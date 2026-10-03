import QuoteForm from '../../components/devis/QuoteForm';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { getAccessories } from '../../lib/accessories';
import { robotShortName } from '../../lib/catalogue';
import { getInstallationPrices } from '../../lib/installation-prices';
import { quoteContextFor } from '../../lib/quote';
import { getRobotBySlug } from '../../lib/robots';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

type SearchParams = Promise<{ robot?: string | string[] }>;

const slugOf = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value)?.trim() ?? '';

/** Le formulaire n'a pas d'existence propre : les moteurs indexent les fiches, pas `/devis?robot=…`. */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const robot = await getRobotBySlug(slugOf((await searchParams).robot));
  return {
    title: robot
      ? `Recevoir mon devis · ${robotShortName(robot.name)}`
      : 'Recevoir mon devis',
    description:
      'Devis gratuit pour votre robot tondeuse Husqvarna, reçu par email et à signer en ligne.',
    robots: { index: false, follow: true },
  };
}

/**
 * `/devis?robot=<slug>` (D-18) : sans robot ou avec une adresse inconnue, on choisit d'abord le
 * robot dans le catalogue.
 */
export default async function DevisPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const robot = await getRobotBySlug(slugOf((await searchParams).robot));
  if (!robot) redirect('/robots');

  const [prices, accessories] = await Promise.all([
    getInstallationPrices(robot.inventoryId),
    getAccessories(),
  ]);
  const context = quoteContextFor(robot, prices, [
    ...accessories.antennas,
    ...accessories.shelters,
    ...accessories.plugins,
  ]);

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Robots Husqvarna', href: '/robots' },
          { label: robotShortName(robot.name), href: `/robots/${robot.slug}` },
          { label: 'Mon devis' },
        ]}
      />
      <QuoteForm robot={robot} context={context} accessories={accessories} />
    </>
  );
}
