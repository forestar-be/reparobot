'use client';

import aboutData from '../config/about.json';
import { trackEvent } from '../utils/analytics';
import React, { useEffect, useRef, useState } from 'react';
import CountUp from 'react-countup';
import SectionDivider from './SectionDivider';

interface AboutProps {
  value: number;
  suffix: string;
  description: string;
}

const CountUpWrapper = ({ value, suffix, description }: AboutProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (counterRef.current) {
            trackEvent(
              'view_stat_counter',
              'engagement',
              `stat_${description.toLowerCase().replace(/\s+/g, '_')}`,
              value,
            );
          }
        }
      },
      { threshold: 0.5 },
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
    };
  }, [value, description]);

  return (
    <span ref={counterRef}>
      {isVisible ? (
        <CountUp duration={2} end={value} start={0} suffix={suffix} />
      ) : (
        '0'
      )}
    </span>
  );
};

const About: React.FC = () => {
  const [hasTrackedSection, setHasTrackedSection] = useState(false);
  const [about] = useState<AboutProps[]>(aboutData);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedSection) {
            trackEvent('view_section', 'engagement', 'about_section');
            setHasTrackedSection(true);
          }
        });
      },
      { threshold: 0.2 },
    );

    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      observer.observe(aboutSection);
    }

    return () => {
      if (aboutSection) {
        observer.unobserve(aboutSection);
      }
    };
  }, [hasTrackedSection]);

  const handleHover = (description: string) => {
    const formattedDescription = description.toLowerCase().replace(/\s+/g, '_');
    trackEvent('hover_stat', 'engagement', `stat_${formattedDescription}`);
  };

  return (
    <section
      id="about"
      className="section-padding-small relative overflow-hidden border-b border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100"
      aria-labelledby="about-title"
    >
      {/* Top Divider */}
      <SectionDivider variant="default" position="top" />

      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 transform rounded-full bg-primary-200 opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-primary-300 opacity-15 blur-2xl"></div>
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
      </div>

      <div className="container-custom relative pt-8">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1.5 text-xs font-medium text-primary-700">
            📊 Nos Performances
          </div>
          <h2
            id="about-title"
            className="mb-4 font-display text-3xl font-bold tracking-tight text-gray-900 md:text-4xl"
          >
            Des Résultats qui Parlent
          </h2>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600">
            Notre expertise et notre engagement se reflètent dans ces chiffres
          </p>
        </div>

        <div className="mx-auto grid max-w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-9">
          {about.map((item, i) => {
            // Dynamic icon assignment based on index and description
            const getIcon = (index: number, description: string) => {
              if (description.toLowerCase().includes('années')) return '🏆';
              if (description.toLowerCase().includes('robots entretenus'))
                return '🤖';
              if (description.toLowerCase().includes('satisfaction'))
                return '⭐';
              if (description.toLowerCase().includes('modèles')) return '📦';
              if (description.toLowerCase().includes('heures')) return '⚙️';
              if (description.toLowerCase().includes('délai')) return '⚡';
              if (description.toLowerCase().includes('rayon')) return '🗺️';
              if (description.toLowerCase().includes('pannes')) return '🔧';
              if (description.toLowerCase().includes('support')) return '📞';
              return '📊';
            };

            // Dynamic color scheme based on index
            const getColorScheme = (index: number) => {
              const schemes = [
                'blue',
                'green',
                'purple',
                'orange',
                'red',
                'indigo',
                'pink',
                'teal',
                'cyan',
              ];
              return schemes[index % schemes.length];
            };

            const colorName = getColorScheme(i);

            return (
              <div
                key={i}
                className="group relative"
                aria-label={`Statistic ${item.value}${item.suffix}`}
                onMouseEnter={() => handleHover(item.description)}
              >
                {/* Main card */}
                <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm transition-all duration-300 hover:border-gray-200 hover:shadow-xl">
                  {/* Background gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
                      colorName === 'blue'
                        ? 'from-blue-50 to-transparent'
                        : colorName === 'green'
                          ? 'from-green-50 to-transparent'
                          : colorName === 'purple'
                            ? 'from-purple-50 to-transparent'
                            : colorName === 'orange'
                              ? 'from-orange-50 to-transparent'
                              : colorName === 'red'
                                ? 'from-red-50 to-transparent'
                                : colorName === 'indigo'
                                  ? 'from-indigo-50 to-transparent'
                                  : colorName === 'pink'
                                    ? 'from-pink-50 to-transparent'
                                    : colorName === 'teal'
                                      ? 'from-teal-50 to-transparent'
                                      : 'from-cyan-50 to-transparent'
                    }`}
                  ></div>

                  {/* Icon */}
                  <div className="relative z-10 mb-3">
                    <div
                      className={`mx-auto flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-300 ${
                        colorName === 'blue'
                          ? 'bg-blue-100 group-hover:bg-blue-200'
                          : colorName === 'green'
                            ? 'bg-green-100 group-hover:bg-green-200'
                            : colorName === 'purple'
                              ? 'bg-purple-100 group-hover:bg-purple-200'
                              : colorName === 'orange'
                                ? 'bg-orange-100 group-hover:bg-orange-200'
                                : colorName === 'red'
                                  ? 'bg-red-100 group-hover:bg-red-200'
                                  : colorName === 'indigo'
                                    ? 'bg-indigo-100 group-hover:bg-indigo-200'
                                    : colorName === 'pink'
                                      ? 'bg-pink-100 group-hover:bg-pink-200'
                                      : colorName === 'teal'
                                        ? 'bg-teal-100 group-hover:bg-teal-200'
                                        : 'bg-cyan-100 group-hover:bg-cyan-200'
                      }`}
                    >
                      <div className="text-lg">
                        {getIcon(i, item.description)}
                      </div>
                    </div>
                  </div>

                  {/* Counter */}
                  <div
                    className={`relative z-10 mb-2 font-display text-2xl font-bold ${
                      colorName === 'blue'
                        ? 'text-blue-500'
                        : colorName === 'green'
                          ? 'text-green-500'
                          : colorName === 'purple'
                            ? 'text-purple-500'
                            : colorName === 'orange'
                              ? 'text-orange-500'
                              : colorName === 'red'
                                ? 'text-red-500'
                                : colorName === 'indigo'
                                  ? 'text-indigo-500'
                                  : colorName === 'pink'
                                    ? 'text-pink-500'
                                    : colorName === 'teal'
                                      ? 'text-teal-500'
                                      : 'text-cyan-500'
                    }`}
                  >
                    <CountUpWrapper
                      value={item.value}
                      suffix={item.suffix}
                      description={item.description}
                    />
                  </div>

                  {/* Description */}
                  <p className="relative z-10 text-xs font-medium leading-tight text-gray-600">
                    {item.description}
                  </p>

                  {/* Decorative elements */}
                  <div
                    className={`absolute -right-2 -top-2 h-12 w-12 rounded-full bg-gradient-to-br ${
                      colorName === 'blue'
                        ? 'from-blue-300/20 to-transparent'
                        : colorName === 'green'
                          ? 'from-green-300/20 to-transparent'
                          : colorName === 'purple'
                            ? 'from-purple-300/20 to-transparent'
                            : colorName === 'orange'
                              ? 'from-orange-300/20 to-transparent'
                              : colorName === 'red'
                                ? 'from-red-300/20 to-transparent'
                                : colorName === 'indigo'
                                  ? 'from-indigo-300/20 to-transparent'
                                  : colorName === 'pink'
                                    ? 'from-pink-300/20 to-transparent'
                                    : colorName === 'teal'
                                      ? 'from-teal-300/20 to-transparent'
                                      : 'from-cyan-300/20 to-transparent'
                    }`}
                  ></div>
                  <div
                    className={`absolute -bottom-2 -left-2 h-8 w-8 rounded-full bg-gradient-to-tr ${
                      colorName === 'blue'
                        ? 'from-blue-200/30 to-transparent'
                        : colorName === 'green'
                          ? 'from-green-200/30 to-transparent'
                          : colorName === 'purple'
                            ? 'from-purple-200/30 to-transparent'
                            : colorName === 'orange'
                              ? 'from-orange-200/30 to-transparent'
                              : colorName === 'red'
                                ? 'from-red-200/30 to-transparent'
                                : colorName === 'indigo'
                                  ? 'from-indigo-200/30 to-transparent'
                                  : colorName === 'pink'
                                    ? 'from-pink-200/30 to-transparent'
                                    : colorName === 'teal'
                                      ? 'from-teal-200/30 to-transparent'
                                      : 'from-cyan-200/30 to-transparent'
                    }`}
                  ></div>
                </div>

                {/* Floating badge */}
                <div
                  className={`absolute -top-2 left-1/2 z-20 -translate-x-1/2 transform rounded-full px-2 py-1 text-xs font-semibold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
                    colorName === 'blue'
                      ? 'bg-blue-500'
                      : colorName === 'green'
                        ? 'bg-green-500'
                        : colorName === 'purple'
                          ? 'bg-purple-500'
                          : colorName === 'orange'
                            ? 'bg-orange-500'
                            : colorName === 'red'
                              ? 'bg-red-500'
                              : colorName === 'indigo'
                                ? 'bg-indigo-500'
                                : colorName === 'pink'
                                  ? 'bg-pink-500'
                                  : colorName === 'teal'
                                    ? 'bg-teal-500'
                                    : 'bg-cyan-500'
                  }`}
                >
                  Top
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional content */}
        <div className="mt-12 text-center">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl border border-primary-100 bg-gradient-to-r from-primary-50 to-white p-8">
              <h3 className="mb-4 font-display text-2xl font-bold text-gray-900">
                Pourquoi ces chiffres comptent ?
              </h3>
              <div className="mb-6 grid grid-cols-1 gap-4 text-left md:grid-cols-2">
                <div className="rounded-lg bg-white/80 p-4">
                  <h4 className="mb-2 font-semibold text-gray-800">
                    Excellence Technique
                  </h4>
                  <p className="text-sm text-gray-600">
                    Plus de 12 années d'expertise dédiées aux robots tondeuses
                    Husqvarna et Gardena, avec une constante mise à jour de nos
                    compétences.
                  </p>
                </div>
                <div className="rounded-lg bg-white/80 p-4">
                  <h4 className="mb-2 font-semibold text-gray-800">
                    Service de Proximité
                  </h4>
                  <p className="text-sm text-gray-600">
                    Intervention dans un rayon de 30km, délais de réparation
                    optimisés et support technique disponible toute l'année.
                  </p>
                </div>
                <div className="rounded-lg bg-white/80 p-4">
                  <h4 className="mb-2 font-semibold text-gray-800">
                    Gamme Complète
                  </h4>
                  <p className="text-sm text-gray-600">
                    14 modèles de robots disponibles, couvrant toutes les
                    surfaces de 600m² à 5000m² avec solutions filaires et sans
                    fil.
                  </p>
                </div>
                <div className="rounded-lg bg-white/80 p-4">
                  <h4 className="mb-2 font-semibold text-gray-800">
                    Fiabilité Prouvée
                  </h4>
                  <p className="text-sm text-gray-600">
                    95% des pannes résolues en première intervention grâce à
                    notre diagnostic précis et notre stock de pièces détachées.
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <a
                  href="#contact"
                  className="btn-primary inline-flex items-center gap-2 px-6 py-3"
                >
                  <span>Rejoignez nos clients satisfaits</span>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
