import {
  catalogueHref,
  type CatalogueType,
  type CatalogueFilters as Filters,
} from '../../lib/catalogue';
import Link from 'next/link';
import SurfaceFilter from './SurfaceFilter';

const TABS: { label: string; type: CatalogueType | null }[] = [
  { label: 'Tous les robots', type: null },
  { label: 'Filaire', type: 'filaire' },
  { label: 'Sans fil', type: 'sans-fil' },
];

/**
 * Filtres du catalogue, tous dans l'URL (`?type=sans-fil&surface=1500`) : des liens
 * pour le type, une liste pour la surface. Rien n'est calculé dans le navigateur.
 */
export default function CatalogueFilters({ filters }: { filters: Filters }) {
  return (
    <div className="mb-[26px] flex items-center justify-between gap-[25px] border-y border-line py-[22px] mobile:mb-5 mobile:flex-col mobile:items-stretch mobile:gap-4 mobile:py-[17px]">
      <nav
        aria-label="Type de robot"
        className="flex gap-[3px] rounded-action border border-line bg-[#ebeee4] p-1 mobile:justify-between"
      >
        {TABS.map((tab) => {
          const active = filters.type === tab.type;
          return (
            <Link
              key={tab.label}
              href={catalogueHref({ type: tab.type, surface: filters.surface })}
              aria-current={active ? 'true' : undefined}
              scroll={false}
              className={`flex min-h-[42px] items-center justify-center rounded px-[22px] py-2.5 text-xs font-semibold mobile:flex-1 mobile:px-3.5 mobile:py-2 mobile:text-[11px] ${
                active
                  ? 'bg-white text-forest shadow-[0_2px_5px_#183e3210]'
                  : 'text-muted hover:text-forest'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <SurfaceFilter filters={filters} />
    </div>
  );
}
