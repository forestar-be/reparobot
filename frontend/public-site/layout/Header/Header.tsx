import { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import CalculatorDropdown from '../../components/CalculatorDropdown/CalculatorDropdown';
import CustomButton from '../../components/CustomButton';
import ColorModeContext from '../../utils/ColorModeContext';
import headerData from '../../config/header.json';
import { Logo } from '../../components/Logo';
import styles from './Header.module.css';

interface Props {
  onSidebarOpen: () => void;
}

export interface HeaderProps {
  title: string;
}

const Header = ({ onSidebarOpen }: Props): JSX.Element => {
  const { toggleColorMode, isDark } = useContext(ColorModeContext);
  const [header] = useState<HeaderProps>(headerData);
  const pathname = usePathname();
  const router = useRouter();

  const handleNavClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href'); // Get the link's href
  
    if (!href) return;
  
    const targetId = href.startsWith('/#') ? href.substring(2) : href; // Extract the target ID
  
    if (pathname === '/') {
      // If already on the homepage, perform smooth scrolling
      const element = document.getElementById(targetId);
      if (element) {
        window.history.pushState(null, '', href); // Update the address bar
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If not on the homepage, navigate to `/` and then scroll
      await router.push('/'); // Navigate to homepage
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          window.history.pushState(null, '', href); // Update the address bar
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100); // Delay to ensure the page has fully loaded
    }
  };
  
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo Section */}
        <Link href="/" className={styles.logo}>
          <div>
            <Logo isDark={isDark} />
            <span className={styles.title}>{header.title}</span>
          </div>
        </Link>

        {/* Spacer */}
        <div className={styles.spacer} />

        {/* Navigation Links */}
        <nav className={styles.nav}>
          <Link 
            href="/#services" 
            className={styles.navLink} 
            onClick={handleNavClick}
          >
            Services
          </Link>
          <Link 
            href="/#about" 
            className={styles.navLink} 
            onClick={handleNavClick}
          >
            À propos
          </Link>
          <Link 
            href="/#contact" 
            className={styles.navLink} 
            onClick={handleNavClick}
          >
            Contact
          </Link>
          {/* <CalculatorDropdown /> */}
        </nav>

        {/* Mobile Sidebar Toggle */}
        <button
          className={styles.sidebarToggle}
          onClick={onSidebarOpen}
          aria-label="Open sidebar menu"
        >
          ☰
        </button>
      </div>
    </header>
  );
};

export default Header;