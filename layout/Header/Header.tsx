import { Logo } from '../../components/Logo';
import headerData from '../../config/header.json';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header = (): JSX.Element => {
  const [header] = useState<HeaderProps>(headerData);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  // Handle scroll effect for floating header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle active section detection based on scroll position
  useEffect(() => {
    if (pathname !== '/') {
      setActiveSection(pathname);
      return;
    }

    const handleScrollForActiveSection = () => {
      const sections = ['services', 'about', 'contact'];
      const sectionElements = sections
        .map((id) => ({
          id,
          element: document.getElementById(id),
        }))
        .filter(({ element }) => element !== null);

      let currentSection = '';
      const scrollPosition = window.scrollY + 100; // Offset for header

      // Check if we're at the top of the page
      if (scrollPosition < 200) {
        currentSection = '';
      } else {
        // Find the current section based on scroll position
        for (const { id, element } of sectionElements) {
          if (element && scrollPosition >= element.offsetTop - 100) {
            currentSection = id;
          }
        }
      }

      setActiveSection(currentSection);
    };

    // Initial check
    handleScrollForActiveSection();

    window.addEventListener('scroll', handleScrollForActiveSection);
    return () =>
      window.removeEventListener('scroll', handleScrollForActiveSection);
  }, [pathname]);

  const handleNavClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Close mobile menu when link is clicked
    setIsMobileMenuOpen(false);

    const href = e.currentTarget.getAttribute('href');

    if (!href || !href.startsWith('/#')) {
      // If it's not a hash link, let the default behavior handle it
      return;
    }

    e.preventDefault();

    const targetId = href.substring(2);

    if (pathname === '/') {
      const element = document.getElementById(targetId);
      if (element) {
        window.history.pushState(null, '', href);
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      router.push('/');
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          window.history.pushState(null, '', href);
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Function to determine if a navigation link is active
  const isLinkActive = (href: string): boolean => {
    if (href === '/') {
      return pathname === '/' && activeSection === '';
    }

    if (href.startsWith('/#')) {
      const sectionId = href.substring(2);
      return pathname === '/' && activeSection === sectionId;
    }

    // Check for exact match or if pathname starts with href (for subpaths)
    if (href === '/devis') {
      return pathname.startsWith('/devis');
    }

    return pathname === href;
  };

  // Function to get link classes based on active state
  const getLinkClasses = (href: string, isMobile: boolean = false): string => {
    const isActive = isLinkActive(href);
    const baseClasses = isMobile
      ? 'block font-medium py-2 transition-colors duration-200'
      : 'font-medium px-1 lg:px-2 xl:px-3 py-2 rounded-lg transition-all duration-200 relative group';

    const activeClasses = isActive
      ? 'text-primary-600 bg-primary-50'
      : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50';

    return `${baseClasses} ${activeClasses}`;
  };

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 max-h-[72px] transition-all duration-300 ${
        isScrolled ? 'px-4 py-3 md:px-8' : 'px-4 py-6 md:px-8'
      }`}
    >
      <div
        className={`mx-auto max-w-7xl transition-all duration-300 ${
          isScrolled
            ? 'rounded-2xl border border-gray-200/50 bg-white/90 shadow-xl backdrop-blur-md'
            : 'rounded-3xl border border-gray-100 bg-white/95 shadow-lg'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo Section */}
          <Link
            href="/"
            className="flex items-center gap-3 no-underline transition-opacity hover:opacity-80"
          >
            <Logo isDark={false} />
            <div>
              <h1 className="font-display text-sm font-bold text-gray-800 sm:text-base md:text-lg xl:text-xl">
                {header.title}
              </h1>
              {header.subtitle && (
                <h2 className="-mt-1 text-xs font-medium text-gray-500">
                  {header.subtitle}
                </h2>
              )}
            </div>
          </Link>

          {/* Navigation Links - Hidden on mobile and tablet */}
          <nav className="hidden items-center space-x-2 lg:flex lg:space-x-1 xl:space-x-6 2xl:space-x-8">
            <Link
              href="/"
              className={getLinkClasses('/')}
              onClick={handleNavClick}
            >
              Accueil
              <span
                className={`absolute -bottom-1 left-3 h-0.5 bg-primary-600 transition-all duration-200 ${
                  isLinkActive('/')
                    ? 'w-[calc(100%-24px)]'
                    : 'w-0 group-hover:w-[calc(100%-24px)]'
                }`}
              ></span>
            </Link>
            <Link
              href="/#services"
              className={getLinkClasses('/#services')}
              onClick={handleNavClick}
            >
              Services
              <span
                className={`absolute -bottom-1 left-3 h-0.5 bg-primary-600 transition-all duration-200 ${
                  isLinkActive('/#services')
                    ? 'w-[calc(100%-24px)]'
                    : 'w-0 group-hover:w-[calc(100%-24px)]'
                }`}
              ></span>
            </Link>
            <Link href="/robots" className={getLinkClasses('/robots')}>
              Réservation
              <span
                className={`absolute -bottom-1 left-3 h-0.5 bg-primary-600 transition-all duration-200 ${
                  isLinkActive('/robots')
                    ? 'w-[calc(100%-24px)]'
                    : 'w-0 group-hover:w-[calc(100%-24px)]'
                }`}
              ></span>
            </Link>
            <Link href="/devis" className={getLinkClasses('/devis')}>
              Devis
              <span
                className={`absolute -bottom-1 left-3 h-0.5 bg-primary-600 transition-all duration-200 ${
                  isLinkActive('/devis')
                    ? 'w-[calc(100%-24px)]'
                    : 'w-0 group-hover:w-[calc(100%-24px)]'
                }`}
              ></span>
            </Link>
            <Link
              href="/#about"
              className={getLinkClasses('/#about')}
              onClick={handleNavClick}
            >
              À propos
              <span
                className={`absolute -bottom-1 left-3 h-0.5 bg-primary-600 transition-all duration-200 ${
                  isLinkActive('/#about')
                    ? 'w-[calc(100%-24px)]'
                    : 'w-0 group-hover:w-[calc(100%-24px)]'
                }`}
              ></span>
            </Link>
            <Link
              href="/#contact"
              className={getLinkClasses('/#contact')}
              onClick={handleNavClick}
            >
              Contact
              <span
                className={`absolute -bottom-1 left-3 h-0.5 bg-primary-600 transition-all duration-200 ${
                  isLinkActive('/#contact')
                    ? 'w-[calc(100%-24px)]'
                    : 'w-0 group-hover:w-[calc(100%-24px)]'
                }`}
              ></span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="rounded-lg p-2 transition-colors hover:bg-gray-100 lg:hidden"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="rounded-b-2xl border-t border-gray-200/50 bg-white/95 backdrop-blur-sm lg:hidden">
            <div className="space-y-3 px-6 py-4">
              <Link
                href="/"
                className={getLinkClasses('/', true)}
                onClick={handleNavClick}
              >
                Accueil
              </Link>
              <Link
                href="/#services"
                className={getLinkClasses('/#services', true)}
                onClick={handleNavClick}
              >
                Services
              </Link>
              <Link
                href="/robots"
                className={getLinkClasses('/robots', true)}
                onClick={handleNavClick}
              >
                Réservation
              </Link>
              <Link
                href="/devis"
                className={getLinkClasses('/devis', true)}
                onClick={handleNavClick}
              >
                Devis
              </Link>
              <Link
                href="/#about"
                className={getLinkClasses('/#about', true)}
                onClick={handleNavClick}
              >
                À propos
              </Link>
              <Link
                href="/#contact"
                className={getLinkClasses('/#contact', true)}
                onClick={handleNavClick}
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
