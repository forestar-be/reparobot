---
id: vitrine-catalogue-repli-seo
scope: decision
paths:
  [
    'lib/robots.ts',
    'app/sitemap.ts',
    'app/robots/[slug]/page.tsx',
    'app/devis/page.tsx',
  ]
tags: [seo, resilience, catalogue, sitemap]
last_reviewed: 2026-11-11
review_after_days: 180
confidence: verified
---

# Panne de l'API : le repli ne doit jamais devenir du SEO

`getRobotsCatalog()` rend `FALLBACK_CATALOG` (catégories sans robot) si `API_URL` ou
`AUTH_TOKEN` manque, si l'API répond une erreur ou si la forme est invalide. Le repli est
utile pour afficher une page, **dangereux pour l'indexation** : un catalogue vide servi
comme vrai ferait publier un plan du site sans fiches, ou des 404 mis en cache.

Règles en place (reconnaissables à `isFallbackCatalog`) :

- `app/sitemap.ts` : à l'exécution, sur repli, **lève une erreur** pour que Next garde le
  plan précédent. Pendant le build (`NEXT_PHASE === 'phase-production-build'`, aperçu sans
  jeton par exemple) il se contente des pages fixes.
- `app/robots/[slug]/page.tsx` : un slug inconnu dans un vrai catalogue est un `404` ;
  sur repli c'est une **erreur** (« Catalogue indisponible »), pas un 404, qu'on ne met
  pas en cache comme « inconnue ».
- `generateStaticParams` rend `[]` sur repli : aucune fiche n'est figée vide au build.
- Les autres lectures (forfaits, coordonnées, accessoires, prix d'installation) ne lèvent
  jamais : elles rendent `[]`/valeurs de secours et la page s'affiche sans ces blocs.

Conséquence pour un build : un déploiement Vercel sans `API_URL`/`AUTH_TOKEN` produit un
site sans fiches robots (pas un site cassé) ; vérifier ces deux variables avant de
soupçonner un bug de page.

`/devis` redirige vers `/robots` quand le robot du paramètre `?robot=<slug>` est inconnu :
la page n'a pas d'existence propre.
