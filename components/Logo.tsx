import Image from 'next/image';

export const Logo = ({ isDark }: { isDark: boolean }): JSX.Element => {
  const logoSrc = isDark
    ? '/images/logo/logo-dark-70x70.png'
    : '/images/logo/logo-70x70.png';
  const logoAlt =
    'Forestar.be - Entretien, Réservation et Réparation Robot Tondeuse Husqvarna';

  return (
    <Image
      src={logoSrc}
      alt={logoAlt}
      width={40}
      height={40}
      className="object-contain"
      priority
    />
  );
};
