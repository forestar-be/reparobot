import type { ReactNode } from 'react';

/** Badge de type (« Filaire », « Sans fil ») ou de promotion (affichée telle quelle, D-15). */
export default function Badge({
  tone = 'type',
  className = '',
  children,
}: {
  tone?: 'type' | 'promo';
  className?: string;
  children: ReactNode;
}) {
  const style =
    tone === 'promo'
      ? 'bg-sage text-forest font-semibold'
      : 'bg-white text-forest font-semibold';
  return (
    <span
      className={`inline-block rounded-[3px] px-[9px] py-1 text-[10px] leading-normal ${style} ${className}`}
    >
      {children}
    </span>
  );
}
