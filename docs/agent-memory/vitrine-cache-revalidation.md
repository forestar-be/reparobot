---
id: vitrine-cache-revalidation
scope: decision
paths: ['app/api/revalidate/route.ts', 'lib/robots.ts', 'lib/service-offers.ts', 'lib/site-info.ts', 'lib/accessories.ts', 'lib/installation-prices.ts', 'app/sitemap.ts', 'app/robots/[slug]/page.tsx']
tags: [cache, isr, revalidation, next16]
last_reviewed: 2026-11-11
review_after_days: 180
confidence: verified
---

# Cache de la vitrine et revalidation à la demande

Chaque lecture d'API utilise `fetch(..., { next: { revalidate: 3600, tags: [...] } })` :
une heure au plus de retard, et invalidation immédiate quand le gérant modifie une
donnée dans forestar-robot.

Tags et ce qu'ils couvrent :

- `robots-catalog` : catalogue, **accessoires** et **prix d'installation** (le placement
  suit l'inventaire, d'où le même tag).
- `service-offers` : forfaits d'entretien et de réparation.
- `site-info` : coordonnées du magasin.

Mécanisme : `forestar-server` appelle `GET /api/revalidate?secret=…&tag=…` sur le site
après chaque écriture concernée. Les URL cibles viennent de sa variable
`CACHE_REVALIDATION_URLS` (une URL par site, le paramètre `tag` est remplacé à chaque
appel ; `forestar-server/src/services/reparobotRevalidation.ts`). Le secret côté site est
`REVALIDATE_SECRET`. Une revalidation qui échoue ne fait jamais échouer l'écriture du
gérant : le cache expire de toute façon à l'heure suivante.

Décisions et pièges :

- Next 16 impose un second argument à `revalidateTag`. Le site passe `{ expire: 0 }` :
  la donnée expire tout de suite, le gérant voit le site à jour dès la requête suivante.
  Le profil `'max'` aurait servi une dernière fois l'ancienne version.
- La liste `allowedTags` de la route est fermée. **Un nouveau tag de lecture doit être
  ajouté à la route ET à `ReparobotTag` côté serveur**, sinon l'écriture du gérant ne
  rafraîchit jamais la page (elle ne se corrige qu'à l'heure suivante, sans erreur).
- Les fiches `/robots/[slug]` et `sitemap.ts` sont régénérées avec le catalogue ; leur
  comportement quand l'API est en panne est décrit dans
  [catalogue de repli](vitrine-catalogue-repli-seo.md).
- Le secret passe en paramètre d'URL d'une requête `GET` : il peut apparaître dans des
  journaux d'accès. Alternative non retenue ici : `POST` avec en-tête (nécessiterait de
  changer le contrat avec le serveur). À reconsidérer si le secret est exposé.
