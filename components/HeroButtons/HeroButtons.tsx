import React from 'react';
import Link from 'next/link';
import styles from './HeroButtons.module.css';

const HeroButtons = (): JSX.Element => {
  // Event handler for the first button
  const handleExploreServicesClick = () => {
    console.log('Explore Services button clicked');
  };

  // Event handler for the second button
  const handleExpertiseClick = () => {
    console.log('Expertise button clicked');
  };

  return (
    <div className={styles.heroButtonsNav}>
      {/* First Button */}
      <Link
        href="#services"
        className={`${styles.button} ${styles.primaryButton}`}
        aria-label="Explorer nos services d'entretien et réparation de robots tondeuses"
        onClick={handleExploreServicesClick}
      >
        Explorer nos services de robotique
      </Link>

      {/* Second Button */}
      <Link
        href="#about"
        className={`${styles.button} ${styles.secondaryButton}`}
        aria-label="En savoir plus sur notre expertise en robots tondeuses Husqvarna et Gardena"
        onClick={handleExpertiseClick}
      >
        Notre expertise robotique
      </Link>
    </div>
  );
};

export default HeroButtons;
