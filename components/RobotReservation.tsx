import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';

const RobotReservation = (): JSX.Element => {
  const router = useRouter();

  const handleReservation = () => {
    router.push('/devis/demande');
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Robots Tondeuses Husqvarna',
    description:
      'Découvrez notre gamme complète de robots tondeuses Husqvarna. Installation professionnelle incluse.',
    brand: {
      '@type': 'Brand',
      name: 'Husqvarna',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <Head>
        <title>
          Robots Tondeuses Husqvarna | Vente et Installation en Belgique |
          Forestar - Reparobot
        </title>
        <meta
          name="description"
          content="ReparObot est distributeur officiel de robots tondeuses Husqvarna en Belgique. Installation professionnelle, service après-vente et entretien annuel disponible."
        />
        <meta
          name="keywords"
          content="robot tondeuse, Husqvarna, Automower, installation robot tondeuse, entretien robot tondeuse, Belgique"
        />
        <meta
          property="og:title"
          content="ReparObot | Robots Tondeuses Husqvarna | Vente et Installation"
        />
        <meta
          property="og:description"
          content="Distributeur officiel de robots tondeuses Husqvarna en Belgique. Installation et service inclus."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://reparobot.be/" />
        <meta
          property="og:image"
          content="https://reparobot.be/images/robot-tondeuse-husqvarna.jpg"
        />
        <link rel="canonical" href="https://reparobot.be/" />
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Head>

      <div className="rounded-2xl bg-white py-8 text-center shadow-lg">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            Réservez votre robot tondeuse Husqvarna
          </h2>
          <p className="mb-8 leading-relaxed text-gray-600">
            Découvrez notre gamme complète de robots tondeuses Husqvarna.
            Demandez votre devis personnalisé pour trouver celui qui correspond
            parfaitement à vos besoins avec installation professionnelle
            incluse.
          </p>
          <button
            onClick={handleReservation}
            className="rounded-lg bg-primary-600 px-8 py-3 text-lg font-medium text-white transition-colors duration-200 hover:bg-primary-700"
          >
            Demander un devis
          </button>
        </div>
      </div>
    </>
  );
};

export default RobotReservation;
