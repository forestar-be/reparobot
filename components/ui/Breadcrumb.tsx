import Link from 'next/link';

export interface Crumb {
  label: string;
  href?: string;
}

/** Fil d'Ariane : Accueil / … / page courante (non lien, `aria-current`). */
export default function Breadcrumb({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ label: 'Accueil', href: '/' }, ...items];
  return (
    <nav aria-label="Fil d'Ariane" className="wrap">
      <ol className="m-0 flex list-none flex-wrap gap-2 p-0 py-6 text-sm text-muted mobile:gap-1.5 mobile:pt-5 mobile:pb-[15px]">
        {all.map((item, i) => {
          const last = i === all.length - 1;
          return (
            <li
              key={`${item.label}-${i}`}
              className="flex gap-2 mobile:gap-1.5"
            >
              {i > 0 && <span aria-hidden="true">/</span>}
              {last || !item.href ? (
                <span aria-current={last ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="hover:underline">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
