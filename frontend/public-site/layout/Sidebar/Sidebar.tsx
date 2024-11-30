import Link from 'next/link';
import { useEffect, useState, useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import CalculatorDropdown from '../../components/CalculatorDropdown/CalculatorDropdown';
import { Logo } from '../../components/Logo';
import headerData from '../../config/header.json';
import { HeaderProps } from '../Header/Header';
import ColorModeContext from '../../utils/ColorModeContext';
import styles from './Sidebar.module.css';

interface Props {
  onClose: () => void;
  open: boolean;
}

const Sidebar = ({ open, onClose }: Props): JSX.Element => {
  const { isDark } = useContext(ColorModeContext);
  const [header] = useState<HeaderProps>(headerData);
  const pathname = usePathname();
  const router = useRouter();

  const handleNavClick = async (e: React.MouseEvent) => {
    // Always close the sidebar
    onClose();
    
    const href = (e.currentTarget as HTMLAnchorElement).getAttribute('href');
    if (!href) return;

    // If we're on the homepage and it's a hash link
    if (pathname === '/' && href.startsWith('/#')) {
      e.preventDefault();
      
      // Update the URL without a page refresh
      router.push(href, { scroll: false });
      
      // Handle smooth scroll
      const element = document.querySelector(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    // For other pages, let the normal navigation happen
  };

  return (
    <div
      className={`${styles.drawer} ${open ? styles.open : ''}`}
      onClick={onClose}
      role="presentation"
    >
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        {/* Logo Section */}
        <Link href="/" className={styles.logo} onClick={onClose}>
          <div className={styles.logoContainer}>
            <Logo isDark={isDark} />
            <span className={styles.title}>{header.title}</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className={styles.nav}>
          <Link 
            href="/#services"
            className={styles.navLink}
            scroll={false}
            onClick={handleNavClick}
          >
            Services
          </Link>
          <Link 
            href="/#about"
            className={styles.navLink}
            scroll={false}
            onClick={handleNavClick}
          >
            À propos
          </Link>
          <Link 
            href="/#contact"
            className={styles.navLink}
            scroll={false}
            onClick={handleNavClick}
          >
            Contact
          </Link>
          {/* <CalculatorDropdown onClose={onClose} /> */}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;