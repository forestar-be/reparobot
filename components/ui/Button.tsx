import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';
import Link from 'next/link';
import Glyph from './Glyph';

type Variant = 'solid' | 'outline' | 'light';

const VARIANTS: Record<Variant, string> = {
  solid:
    'border-forest bg-forest text-white hover:-translate-y-px hover:bg-forest-hover',
  outline:
    'border-forest bg-transparent text-forest hover:-translate-y-px hover:bg-sage',
  light:
    'border-ivory bg-ivory text-forest hover:-translate-y-px hover:bg-white',
};

const BASE =
  'inline-flex min-h-[49px] items-center justify-center gap-[18px] rounded-action border px-[22px] py-3 text-sm leading-[1.4] font-bold transition-[background-color,transform] duration-150';

interface CommonProps {
  variant?: Variant;
  /** Pleine largeur. */
  full?: boolean;
  /** Flèche finale (par défaut oui). */
  arrow?: boolean;
  className?: string;
  children: ReactNode;
}

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps | 'href'> & {
    href: string;
  };
type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

/**
 * Bouton plein (prochaine étape), bordé (conversation) ou clair (sur fond vert).
 * Avec `href`, c'est un lien : interne par `next/link`, `tel:`/`mailto:`/externe par `<a>`.
 */
export default function Button(props: ButtonAsLink | ButtonAsButton) {
  const {
    variant = 'solid',
    full = false,
    arrow = true,
    className = '',
    children,
    ...rest
  } = props;
  const classes = `${BASE} ${VARIANTS[variant]} ${full ? 'w-full' : ''} ${className}`;
  const content = (
    <>
      {children}
      {arrow && <Glyph name="arrow" className="h-[17px] w-[17px]" />}
    </>
  );
  if ('href' in rest && rest.href !== undefined) {
    const { href, ...anchor } = rest as ButtonAsLink;
    const internal = href.startsWith('/') || href.startsWith('#');
    return internal ? (
      <Link href={href} className={classes} {...anchor}>
        {content}
      </Link>
    ) : (
      <a href={href} className={classes} {...anchor}>
        {content}
      </a>
    );
  }
  const { type = 'button', ...button } = rest as ButtonAsButton;
  return (
    <button type={type} className={classes} {...button}>
      {content}
    </button>
  );
}

/** Lien souligné avec flèche (« Toute la gamme », « Calculer mon budget »). */
export function TextLink({
  href,
  children,
  className = '',
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-3 border-b border-current pb-[3px] text-sm font-bold text-forest mobile:gap-[5px] ${className}`}
    >
      {children}
      <Glyph name="arrow" className="h-5 w-5 mobile:h-3.5 mobile:w-3.5" />
    </Link>
  );
}
