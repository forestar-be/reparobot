import Link from 'next/link';

/**
 * Signature typographique « reparobot. » avec « par Forestar · depuis 2008 ».
 * Ce n'est jamais un titre : le H1 appartient à chaque page.
 */
export default function Brand({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="reparobot par Forestar, accueil"
      className={`leading-[1.2] ${className}`}
    >
      <b className="block text-[29px] font-extrabold tracking-[-1.6px] text-forest mobile:text-[27px]">
        reparobot<span className="text-leaf">.</span>
      </b>
      <small className="text-[9px] font-bold tracking-[0.12em] text-muted uppercase mobile:text-[8px]">
        par Forestar · depuis 2008
      </small>
    </Link>
  );
}
