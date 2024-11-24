import { useState } from 'react';
import Link from 'next/link';
import styles from './CalculatorDropdown.module.css';

interface Props {
  onClose?: () => void; 
}

const CalculatorDropdown = ({onClose}: Props): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className={styles.dropdown}>
      {/* Dropdown Button */}
      <button className={styles.button} onClick={toggleMenu} aria-expanded={isOpen}>
        Calculateurs ▼
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={styles.menu}>
          <Link onClick={onClose} href="/calculateur-cout-entretien-robot-tondeuse" passHref>
            <span className={styles.menuItem} onClick={closeMenu}>
              Estimation coûts d'entretien
            </span>
          </Link>
          <Link onClick={onClose} href="/calculateur-retour-sur-investissement-robot-tondeuse" passHref>
            <span className={styles.menuItem} onClick={closeMenu}>
              Calculateur d'économies
            </span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CalculatorDropdown;
