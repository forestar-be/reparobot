import type { ReactNode } from 'react';

/**
 * Badge de type (« Filaire », « Sans fil »), de promotion (affichée telle quelle, D-15)
 * ou d'abandon (« Abandonné » : modèle que le constructeur ne fabrique plus).
 */
export default function Badge({
  tone = 'type',
  className = '',
  children,
}: {
  tone?: 'type' | 'promo' | 'discontinued';
  className?: string;
  children: ReactNode;
}) {
  const style =
    tone === 'promo'
      ? 'bg-sage text-forest font-semibold'
      : tone === 'discontinued'
        ? 'bg-[#f3e1d6] text-[#7a3a14] font-semibold'
        : 'bg-white text-forest font-semibold';
  return (
    <span
      className={`inline-block rounded-[3px] px-[9px] py-1 text-xs leading-normal ${style} ${className}`}
    >
      {children}
    </span>
  );
}
