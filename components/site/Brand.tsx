import Link from 'next/link';

/**
 * Signature typographique « reparobot.be » avec « par Forestar · depuis 2008 ».
 * Ce n'est jamais un titre : le H1 appartient à chaque page.
 */
export default function Brand({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`leading-[1.2] ${className}`}>
      <b className="block text-[29px] font-extrabold tracking-[-1.6px] text-forest mobile:text-[27px]">
        reparobot<span className="text-leaf">.</span>be
      </b>
      <small className="block text-xs font-bold tracking-[0.12em] text-muted uppercase">
        par Forestar · depuis 2008
      </small>
      <span className="sr-only"> : accueil</span>
    </Link>
  );
}
