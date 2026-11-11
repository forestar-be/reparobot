---
id: vitrine-devis-calcul-et-corps
scope: domain
paths: ['lib/quote.ts', 'lib/installation-prices.ts', 'lib/accessories.ts', 'components/devis/**', 'app/devis/page.tsx']
tags: [devis, prix, installation]
last_reviewed: 2026-11-11
review_after_days: 120
confidence: draft
---

# Devis d'achat : récapitulatif et corps de `POST /quote-request`

`lib/quote.ts` est un module pur (sans réseau) : il calcule le récapitulatif affiché et
construit le corps envoyé au serveur. Le serveur recalcule de son côté (bon de commande,
PDF) : le site n'envoie jamais de total, seulement des choix.

Règles vérifiées dans le code :

- Total = robot + accessoires choisis (au plus un par catégorie : plugin, antenne, abri)
  - installation cochée (placement compris) + câble au mètre × longueur (0 à 3000 m
    entiers) + support d'antenne, arrondi au centime.
- Un élément **sans prix** n'ajoute rien et se lit « prix confirmé dans le devis » : le
  total est alors un sous-total (`unpriced` liste les lignes concernées).
- **Une seule case « installation »** : placement du robot et installateur vont ensemble
  (`hasPlacement` et `needsInstaller` prennent la même valeur). Elle est **décochée par
  défaut** (D-14).
- Le serveur n'a qu'un champ ville : code postal et ville sont concaténés
  (« 7090 Braine-le-Comte »).
- Prix de placement : celui de `/installation-prices` s'il répond, sinon
  `installationPrice` de l'inventaire ; câble et support n'ont pas de secours
  (`null`, donc « prix confirmé »).
- Les accessoires viennent de `GET /accessories` (articles réels de l'inventaire) ;
  une liste vide est un état normal quand l'API est absente.

Historique utile (fiche mémoire de Claude, audit du 3 oct. 2026, **non revérifié
aujourd'hui, draft**) : avant la refonte, l'ancien formulaire cochait l'installation par
défaut et affichait « Incluse » à 0 € alors que la réservation affichait un autre prix ;
placement, câble et support étaient en dur dans le formulaire et le PDF. D'où la source
unique de prix d'installation aujourd'hui. L'équivalence exacte du total avec le PDF du
serveur (`src/pdf/PurchaseOrderPdfDocument.tsx`) est affirmée par un commentaire de
`lib/quote.ts` ; elle n'a pas été comparée ligne à ligne ici.

Voir aussi [flux de données](vitrine-flux-donnees-api.md) et
[formulaires et Turnstile](vitrine-formulaires-turnstile.md).
