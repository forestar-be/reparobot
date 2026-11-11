---
id: vitrine-seo-structure-pages
scope: domain
paths: ['app/sitemap.ts', 'app/robots.ts', 'app/layout.tsx', 'lib/og-image.ts', 'lib/structured-data.ts', 'lib/local-business.ts', 'lib/site.ts', 'next.config.js']
tags: [seo, sitemap, json-ld, og-image, canonical]
last_reviewed: 2026-11-11
review_after_days: 120
confidence: verified
---

# SEO : ce que chaque page déclare, et pourquoi

Le site est indexé sous `https://www.reparobot.be` (`DEFAULT_SITE_URL` de `lib/site.ts`,
surchargé par `SITE_URL`, **figée au build** et recopiée côté client par `env` de
`next.config.js`). Ne jamais écrire l'hôte en dur : toujours `siteUrl('/chemin')`.

Règles non évidentes :

- **Pas de canonical global** dans `app/layout.tsx` : il ferait pointer toutes les pages
  vers l'accueil. Chaque page pose son `alternates.canonical`.
- **`openGraph` d'une page remplace celui du layout en entier, images comprises.** Toute
  page qui déclare son `openGraph` doit reprendre `OG_IMAGE` (`lib/og-image.ts`) ou sa
  propre image, sinon aucun `og:image` n'est émis (défaut corrigé le 9 oct. 2026).
- Le plan du site (`app/sitemap.ts`) contient : accueil, `/robots`, une fiche par robot,
  `/entretien-reparation`, `/contact`. Sont **exclus exprès** : `/devis` (formulaire sans
  existence propre, `noindex`, redirige vers `/robots` sans robot), `/etre-recontacte`
  (ne vaut que depuis une fiche) et `/cookies` (en ligne et indexable, mais pas à pousser).
  Le comportement du plan en cas de panne d'API : [catalogue de repli](vitrine-catalogue-repli-seo.md).
- `robots.txt` autorise tout sauf `/api/` et référence le plan.
- JSON-LD : `Product` + `BreadcrumbList` sur les fiches ; `LocalBusiness` (accueil) et
  `ContactPage` (contact) construits depuis `site-info`, `Service` pour l'atelier depuis
  `/service-offers` (seuls les forfaits au prix connu sont publiés, montants TTC). Les
  coordonnées GPS sont celles de l'épingle de la carte (d'anciens JSON-LD en portaient de
  fausses). Aucun `aggregateRating` : la note Google est connue mais pas le nombre d'avis,
  et une note sans effectif est un balisage invalide.
- `jsonLd()` échappe `<` pour qu'une valeur ne referme pas la balise `<script>`.
- Redirections de `next.config.js` : `/about` en 301 vers l'accueil ; `/devis/demande`
  et `/rappel` en 308 (`permanent: true`) vers `/devis` et `/etre-recontacte`.
- La balise de vérification Search Console vient de `GOOGLE_SITE_VERIFICATION` (variable
  Vercel), jamais d'une valeur en dur.
- `app/metadata.ts` est un fichier **vide** (0 octet, jamais importé) : les métadonnées
  vivent dans `app/layout.tsx` et chaque page.

Voir [indexation d'octobre 2026](vitrine-indexation-oct-2026.md) pour l'historique.
