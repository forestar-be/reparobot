---
id: vitrine-flux-donnees-api
scope: architecture
paths:
  [
    'lib/robots.ts',
    'lib/service-offers.ts',
    'lib/site-info.ts',
    'lib/accessories.ts',
    'lib/installation-prices.ts',
    'lib/actions.ts',
    'next.config.js',
  ]
tags: [architecture, api, flux]
last_reviewed: 2026-11-11
review_after_days: 180
confidence: verified
---

# Vitrine : qui appelle qui

reparobot.be n'a ni base ni logique métier propre. Toutes ses données viennent des
routes **publiques** de `forestar-server` (`API_URL`, sous `api.forestar.be`, sans
préfixe), appelées avec `Authorization: Bearer <AUTH_TOKEN>` (un jeton partagé par tous
les fronts publics ; sa valeur vit dans les variables d'environnement Vercel et dans le
`.env` local, jamais dans le dépôt).

Lectures (rendu serveur, cache Next à 3600 s, voir [cache et revalidation](vitrine-cache-revalidation.md)) :

| Route serveur                       | Lib du site                  | Sert à                                                       |
| ----------------------------------- | ---------------------------- | ------------------------------------------------------------ |
| `GET /robots-catalog`               | `lib/robots.ts`              | catalogue, fiches, accueil (« à la une »), plan du site      |
| `GET /accessories`                  | `lib/accessories.ts`         | accessoires du devis (antenne, abri, plugin)                 |
| `GET /installation-prices?robotId=` | `lib/installation-prices.ts` | placement, câble au mètre, support d'antenne                 |
| `GET /service-offers`               | `lib/service-offers.ts`      | forfaits entretien, réparation, aide à l'installation        |
| `GET /site-info`                    | `lib/site-info.ts`           | coordonnées du magasin (bande locale, pied de page, JSON-LD) |

Écritures : trois seulement, toutes par **server action** (`lib/actions.ts`), jamais
depuis le navigateur : `POST /quote-request` (devis d'achat), `POST /submit-form`
(entretien, réparation, installation, et « Être recontacté » avec `Type de demande:
Contact`). Détail : [formulaires et Turnstile](vitrine-formulaires-turnstile.md).

Le serveur ne met rien en cache côté HTTP (pas d'en-tête) : le cache est celui du site,
invalidé à chaque écriture du gérant dans forestar-robot.

Invariants utiles :

- Le catalogue ne contient que les robots `isPublicVisible` **avec un prix de vente** ;
  un robot sans prix n'apparaît pas sur le site.
- Les images viennent de l'API (`/images/**`, hôte tiré de `API_URL` par
  `next.config.js`). Changer `API_URL` change aussi la liste d'hôtes d'images autorisés.
- Aucun prix, aucune coordonnée, aucun libellé de forfait n'est en dur dans les pages :
  un prix `null` se lit « sur devis ». Seules les valeurs de secours de `site-info.ts`
  (téléphone, horaires, adresse) existent en dur, champ par champ.
- `reparobot` ne partage pas `@forestar-be/ui` ni de paquet commun : le code Turnstile
  a été copié du storefront du shop, volontairement.

Source des contrats côté serveur : `forestar-server/src/routes/publicSite.routes.js`.
