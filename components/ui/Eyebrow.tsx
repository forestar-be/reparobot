import type { ReactNode } from 'react';

/** Surtitre en capitales espacées. `dark` pour les fonds verts. */
export default function Eyebrow({
  children,
  dark = false,
  className = '',
}: {
  children: ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`mb-[17px] text-[10px] font-extrabold tracking-[0.16em] uppercase mobile:mb-[13px] mobile:text-[9px] ${
        dark ? 'text-on-dark-eyebrow' : 'text-forest'
      } ${className}`}
    >
      {children}
    </div>
  );
}
