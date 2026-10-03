import CookieSettingsButton from '../../components/CookieSettingsButton';
import footerData from '../../config/footer.json';
import { useState, type JSX } from 'react';
import Link from 'next/link';

interface FooterProps {
  copyright: string;
  TVA: string;
}

const Footer = (): JSX.Element => {
  const [footer] = useState<FooterProps>(footerData);

  return (
    <footer className="bg-gray-800 py-8 text-white">
      <div className="container-custom">
        <div className="space-y-3 text-center">
          <p className="text-sm text-gray-300">
            Copyright &copy; {new Date().getFullYear()} {footer.copyright}.
          </p>
          <p className="text-sm text-gray-300">TVA {footer.TVA}</p>
          <p className="flex flex-wrap items-center justify-center gap-x-4 text-sm text-gray-300">
            <Link
              href="/cookies"
              className="inline-flex min-h-11 items-center transition-colors hover:text-white"
            >
              Cookies
            </Link>
            <CookieSettingsButton className="inline-flex min-h-11 items-center transition-colors hover:text-white" />
          </p>
          <p className="text-xs text-gray-400">
            Services professionnels fournis par{' '}
            <a
              href="https://forestar.be"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 transition-colors hover:text-primary-300"
            >
              Forestar.be
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
