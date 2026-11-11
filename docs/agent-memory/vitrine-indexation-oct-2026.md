---
id: vitrine-indexation-oct-2026
scope: decision
paths:
  [
    'app/sitemap.ts',
    'lib/og-image.ts',
    'lib/structured-data.ts',
    'lib/catalogue.ts',
  ]
tags: [seo, search-console, indexation, historique]
last_reviewed: 2026-11-11
review_after_days: 60
confidence: draft
---

# Indexation de reparobot.be (octobre 2026)

**Entrée `draft` : les faits ci-dessous viennent d'une fiche mémoire de Claude du
9 oct. 2026 et de Search Console au 9 oct. 2026 ; seuls les correctifs de code sont
revérifiés dans le dépôt aujourd'hui.** Aucun relevé Search Console n'a été refait.

Constat du 9 oct. 2026 : 0 page indexée, 4 connues, 0 clic ; le site d'avant la refonte
n'avait été exploré qu'une fois (25 janv. 2026). Le test d'URL en direct disait que
Google avait accès : aucun blocage technique, Google n'avait simplement pas revu la
refonte du 3-4 oct. Cause du « je ne me trouve pas sur Google » : l'absence d'indexation,
pas le classement.

Correctifs vérifiés dans le code : `og:image` par défaut (`lib/og-image.ts`), JSON-LD
`Service` et `ContactPage` (`lib/structured-data.ts`), `/cookies` hors plan du site,
badge « Abandonné » et `availability: Discontinued` (`isDiscontinued` du catalogue ; le stock est
interne et n'est jamais exposé à la vitrine : `/robots-catalog` n'en sélectionne aucun champ). Faits externes à ne pas
supposer : propriété Search Console préfixe `https://www.reparobot.be/` sous le compte
Google de l'atelier ; sitemap re-soumis et dix demandes d'indexation manuelles faites ;
l'apex `reparobot.be` redirige vers `www` en **308** (réglage Vercel > Domains, le DNS
est chez OVH, pas Cloudflare).

Conseil d'usage de la fiche : relire Search Console (Pages, Performances) une à deux
semaines après avant de conclure ; la requête large « robot tondeuse belgique » est très
concurrentielle, viser d'abord des requêtes locales (« Husqvarna Braine-le-Comte »).

À vérifier avant de s'appuyer dessus : état actuel de l'indexation et de la redirection
de l'apex.
