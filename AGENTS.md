# AGENTS.md — Reparobot

Site vitrine public de Reparobot (réparation et entretien de robots tondeuses) : catalogue de robots, calculateurs, demandes de devis et de rappel. Il consomme les routes publiques de `forestar-server` (Bearer `AUTH_TOKEN`).

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, `leaflet` pour la carte, Vitest. Pas de `@forestar-be/ui` : ce site n'utilise pas le design système commun.

## Commandes

Le gestionnaire est pnpm (`packageManager` dans `package.json`).

```bash
pnpm dev           # port 3005 ; lance d'abord `pnpm run check`
pnpm run build     # lance d'abord `pnpm run check`
pnpm run check     # lint + types:check
pnpm run fix       # lint:fix + types:check + format:fix
pnpm test          # Vitest (une fois), `pnpm run test:watch` en continu
```

`predev` et `prebuild` exécutent `check` : une erreur de lint ou de types bloque le démarrage et le build. Les tests ne sont pas dans `prebuild` : les lancer à part avant de pousser.

## Structure

- `app/` : pages, `api/` (routes serveur : `revalidate`), calculateurs, `devis/`, `etre-recontacte/`, `robots/`, `metadata.ts`, `sitemap.ts`, `robots.ts`.
- `lib/` : `robots.ts` (catalogue lu depuis l'API, avec données de repli si `API_URL` ou `AUTH_TOKEN` manque), `actions.ts` (actions serveur), `turnstile.ts`, données structurées et analytics. Les tests `*.test.ts(x)` sont à côté du code (`components/`, `lib/`).
- `components/`, `config/conditions.json`.

## Variables d'environnement

`API_URL`, `AUTH_TOKEN`, `REVALIDATE_SECRET`, `SITE_URL`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_GA*`, `GOOGLE_SITE_VERIFICATION` (voir `.env.template`). Les actions serveur refusent d'envoyer si `API_URL` ou `AUTH_TOKEN` manque ; `AUTH_TOKEN` ne doit jamais être lu côté navigateur.

## SEO

Le référencement compte : `app/sitemap.ts`, `app/robots.ts` et `app/metadata.ts` sont à garder cohérents avec les pages créées ou supprimées.
