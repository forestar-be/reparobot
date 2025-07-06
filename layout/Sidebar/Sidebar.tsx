import { Logo } from '../../components/Logo';
import headerData from '../../config/header.json';
import { HeaderProps } from '../Header/Header';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
  open: boolean;
}

const Sidebar = ({ open, onClose }: Props): JSX.Element => {
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
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-80 transform bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <Link
              href="/"
              className="flex items-center gap-3"
              onClick={onClose}
            >
              <Logo isDark={false} />
              <div className="relative">
                <span className="font-display text-lg font-bold text-gray-800">
                  {header.title}
                </span>
                {header.subtitle && (
                  <span className="absolute -bottom-1 -right-2 whitespace-nowrap text-xs font-medium text-gray-500">
                    {header.subtitle}
                  </span>
                )}
              </div>
            </Link>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 transition-colors hover:text-gray-600"
              aria-label="Close sidebar"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-6 py-8">
            <div className="space-y-4">
              <Link
                href="/"
                className="block rounded-lg px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary-500"
                onClick={handleNavClick}
              >
                Accueil
              </Link>
              <Link
                href="/#services"
                className="block rounded-lg px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary-500"
                onClick={handleNavClick}
              >
                Services
              </Link>
              <Link
                href="/robots"
                className="block rounded-lg px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary-500"
                onClick={handleNavClick}
              >
                Réservation
              </Link>
              <Link
                href="/#about"
                className="block rounded-lg px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary-500"
                onClick={handleNavClick}
              >
                À propos
              </Link>
              <Link
                href="/#contact"
                className="block rounded-lg px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary-500"
                onClick={handleNavClick}
              >
                Contact
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
