---
id: vitrine-formulaires-turnstile
scope: decision
paths: ['lib/actions.ts', 'lib/turnstile.ts', 'components/TurnstileWidget.tsx', 'components/forms/**', 'components/devis/**', 'components/contact/**', 'components/entretien/**', 'components/formulaires-publics.test.ts']
tags: [formulaires, turnstile, server-actions, securite]
last_reviewed: 2026-11-11
review_after_days: 180
confidence: verified
---

# Formulaires publics : server actions et relais Turnstile

Trois formulaires écrivent dans le système : devis (`/devis`), « Être recontacté »
(`/etre-recontacte`) et réservation d'un passage (`/entretien-reparation`).

**Décision : tout passe par une server action** (`lib/actions.ts`, `'use server'`).
Pourquoi : `API_URL` et `AUTH_TOKEN` ne sont pas remplacés côté navigateur par Next.
L'ancien formulaire d'entretien lisait `process.env.API_URL` dans un composant client et
partait vers `undefined/submit-form` : il est resté cassé de fin janvier à fin septembre
2026 sans qu'aucune vérification ne le voie (D-13). Un préfixe `NEXT_PUBLIC_` aurait
corrigé la panne en publiant le jeton partagé dans le bundle : ce n'est pas une option.
`components/formulaires-publics.test.ts` lit textuellement tous les composants client de
`forms/`, `devis/`, `contact/`, `entretien/` et refuse toute lecture de ces variables ;
un nouveau composant de ces dossiers est couvert d'office.

**Turnstile : le site relaie, il ne vérifie jamais** (D-04). Le jeton du widget voyage
dans l'en-tête `x-turnstile-token` ; le garde est dans `forestar-server`
(`turnstilePublicFormsGuard`, posé après le contrôle du jeton partagé, sur
`POST /submit-form`, `/quote-request`, `/rental/request`). Le serveur répond
`{ success:false, code, message }` avec `turnstile_required`, `turnstile_failed` ou
`turnstile_unavailable` ; `lib/turnstile.ts` ne traduit en message « refaites la
vérification » que ces trois codes, tout autre échec garde un message générique.

Comportements à connaître :

- Sans `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (figée au build), aucun widget n'est rendu et
  les formulaires partent sans jeton : c'est le mode du développement local. Sans
  `TURNSTILE_SECRET_KEY`, le serveur laisse aussi tout passer (avec avertissement).
- Tant que la protection est active et que le widget n'a rien rendu, le bouton d'envoi
  est bloqué (`waitingForTurnstile`).
- Un jeton refusé est consommé : le widget est réarmé, la saisie est conservée.
- `trackLead` (GA4) n'est émis qu'après la réponse de succès du serveur.
- Un jeton absent ne pose pas d'en-tête vide, pour que le garde distingue « pas de
  widget » d'un widget vide.

Alternative écartée : un paquet npm commun pour les constantes Turnstile (le shop et la
vitrine n'ont aucun paquet partagé ; publier une version pour trois constantes ferait
dépendre la protection d'une publication). Le contrat commun est la liste des codes de
refus, rendue par le serveur.
