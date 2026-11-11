---
id: memory-catalogue
scope: index
paths: ['**']
tags: [memory, catalogue]
last_reviewed: 2026-11-11
review_after_days: 180
confidence: draft
---

# Repository memory — reparobot (vitrine reparobot.be)

Protocole : [.agents/guides/memory.md](../../.agents/guides/memory.md). Commandes (Node ≥ 22.18) :
`pnpm run memory:check` / `memory:impact`.

- [vitrine-flux-donnees-api](vitrine-flux-donnees-api.md) — qui appelle qui : routes publiques de forestar-server, jeton partagé, invariants du catalogue.
- [vitrine-cache-revalidation](vitrine-cache-revalidation.md) — ISR 3600 s, tags, `/api/revalidate` (Next 16, `expire: 0`), pièges d'un nouveau tag.
- [vitrine-formulaires-turnstile](vitrine-formulaires-turnstile.md) — server actions seulement (panne D-13), Turnstile relayé et jamais vérifié ici.
- [vitrine-catalogue-repli-seo](vitrine-catalogue-repli-seo.md) — panne d'API : le repli ne doit pas polluer plan du site, fiches ni 404.
- [vitrine-devis-calcul-et-corps](vitrine-devis-calcul-et-corps.md) — calcul du devis et corps de `POST /quote-request` (draft : parité PDF non relue).
- [vitrine-seo-structure-pages](vitrine-seo-structure-pages.md) — canonical, `og:image`, plan du site, JSON-LD, redirections.
- [vitrine-indexation-oct-2026](vitrine-indexation-oct-2026.md) — historique d'indexation et Search Console (draft, faits externes non revérifiés).
