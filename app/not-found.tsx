import Button from '../components/ui/Button';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page introuvable',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="wrap py-24 mobile:py-14">
      <p className="mb-3 text-xs font-extrabold tracking-[0.16em] text-forest uppercase">
        Erreur 404
      </p>
      <h1 className="mb-4 text-[41px] mobile:text-[33px]">
        Cette page n’existe pas.
      </h1>
      <p className="mb-8 max-w-[480px] text-muted">
        L’adresse a peut-être changé. Retrouvez nos robots Husqvarna ou revenez
        à l’accueil.
      </p>
      <div className="flex flex-wrap gap-2.5">
        <Button href="/robots">Voir les robots</Button>
        <Button href="/" variant="outline">
          Accueil
        </Button>
      </div>
    </div>
  );
}
