'use client';

import {
  catalogueHref,
  SURFACE_STEPS,
  type CatalogueFilters,
} from '../../lib/catalogue';
import { formatSurface } from '../../lib/format';
import { useRouter } from 'next/navigation';

/**
 * « Mon jardin » : la surface se choisit dans une liste. Sans JavaScript, le formulaire
 * GET et son bouton envoient les mêmes paramètres d'URL ; avec JavaScript, le choix
 * s'applique aussitôt. Dans les deux cas, la liste des robots est rendue par le serveur.
 */
export default function SurfaceFilter({
  filters,
}: {
  filters: CatalogueFilters;
}) {
  const router = useRouter();
  const steps: number[] = [...SURFACE_STEPS];
  if (filters.surface && !steps.includes(filters.surface)) {
    steps.push(filters.surface);
    steps.sort((a, b) => a - b);
  }
  return (
    <form
      action="/robots"
      method="get"
      className="flex items-center gap-[13px] text-xs mobile:justify-between mobile:gap-3.5 mobile:text-[11px]"
    >
      {filters.type ? (
        <input type="hidden" name="type" value={filters.type} />
      ) : null}
      <label htmlFor="surface" className="whitespace-nowrap">
        Mon jardin
      </label>
      <select
        id="surface"
        name="surface"
        value={filters.surface ? String(filters.surface) : ''}
        onChange={(event) => {
          const value = Number(event.target.value);
          router.push(
            catalogueHref({
              type: filters.type,
              surface: value > 0 ? value : null,
            }),
          );
        }}
        className="min-h-[46px] w-full min-w-[200px] rounded-[5px] border border-field bg-white px-3 py-2.5 text-[13px] text-ink mobile:min-h-[41px] mobile:w-[210px] mobile:min-w-0 mobile:text-[11px]"
      >
        <option value="">Toutes les surfaces</option>
        {steps.map((step) => (
          <option key={step} value={step}>
            {formatSurface(step)}
          </option>
        ))}
      </select>
      <noscript>
        <button
          type="submit"
          className="min-h-[46px] rounded-action border border-forest px-4 text-xs font-bold text-forest"
        >
          Filtrer
        </button>
      </noscript>
    </form>
  );
}
