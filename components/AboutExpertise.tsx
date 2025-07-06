'use client';

import { trackEvent } from '../utils/analytics';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import CountUp from 'react-countup';

interface StatData {
  value: number;
  suffix: string;
  description: string;
  icon: string;
  color: string;
}

const AboutExpertise: React.FC = () => {
  const [hasTrackedSection, setHasTrackedSection] = useState(false);

  // Automatic statistics calculation
  const statisticsData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 0-11 -> 1-12
    const foundationYear = 2008;
    const foundationMonth = 1; // January 2008

    // Calculate years of experience
    const yearsOfExperience = currentYear - foundationYear;

    // Calculate total months since company foundation
    const totalMonths =
      (currentYear - foundationYear) * 12 + (currentMonth - foundationMonth);

    // Estimate number of robots maintained (approximately 6 robots per month)
    const robotsPerMonth = 6;
    const totalRobotsMaintained = Math.floor(totalMonths * robotsPerMonth);

    return {
      yearsOfExperience,
      totalRobotsMaintained,
      totalMonths,
    };
  }, []); // Empty dependency array since this only depends on current date

  // Optimized and convincing statistics data
  const statsData: StatData[] = useMemo(
    () => [
      {
        value: statisticsData.yearsOfExperience,
        suffix: '+',
        description: "Années d'expertise",
        icon: '🏆',
        color: 'blue',
      },
      {
        value: statisticsData.totalRobotsMaintained,
        suffix: '+',
        description: 'Robots entretenus',
        icon: '🤖',
        color: 'green',
      },
      {
        value: 98,
        suffix: '%',
        description: 'Satisfaction client',
        icon: '⭐',
        color: 'yellow',
      },
      {
        value: 24,
        suffix: 'h',
        description: 'Intervention rapide',
        icon: '⚡',
        color: 'orange',
      },
    ],
    [statisticsData],
  );

  // SEO and conversion optimized content
  const expertiseContent = useMemo(
    () => ({
      title: 'Pourquoi choisir notre expertise ?',
      description: `Plus de ${statisticsData.yearsOfExperience} ans d'expérience dédiés aux robots tondeuses Husqvarna et Gardena`,
      features: [
        {
          title: 'Expertise Technique Reconnue',
          description:
            'Notre équipe Forestar certifiée maîtrise parfaitement les technologies Husqvarna et Gardena. Diagnostics précis, réparations durables et conseils personnalisés pour optimiser les performances de votre robot tondeuse.',
          icon: '🎯',
        },
        {
          title: 'Service Premium à Domicile',
          description:
            'Intervention rapide dans un rayon de 50km. Enlèvement, réparation et remise en service à domicile pour votre confort. Support technique Forestar disponible 7j/7 pour répondre à toutes vos questions.',
          icon: '🏠',
        },
        {
          title: 'Garantie et Qualité Assurées',
          description:
            "Toutes nos interventions Forestar sont garanties. Pièces détachées d'origine, mise à jour logicielle gratuite et entretien préventif pour prolonger la durée de vie de votre équipement.",
          icon: '🛡️',
        },
        {
          title: 'Solutions Complètes',
          description:
            "De l'achat à la maintenance, Forestar propose une gamme complète de services : vente, installation professionnelle, entretien saisonnier, réparations et hivernage sécurisé.",
          icon: '⚙️',
        },
      ],
    }),
    [statisticsData.yearsOfExperience],
  );

  // Memoized color classes function
  const getColorClasses = useCallback((color: string) => {
    const colorMap = {
      blue: {
        bg: 'from-blue-50 to-blue-100/50',
        text: 'text-blue-600',
        border: 'border-blue-200',
        hover: 'hover:border-blue-300',
      },
      green: {
        bg: 'from-green-50 to-green-100/50',
        text: 'text-green-600',
        border: 'border-green-200',
        hover: 'hover:border-green-300',
      },
      yellow: {
        bg: 'from-yellow-50 to-yellow-100/50',
        text: 'text-yellow-600',
        border: 'border-yellow-200',
        hover: 'hover:border-yellow-300',
      },
      orange: {
        bg: 'from-orange-50 to-orange-100/50',
        text: 'text-orange-600',
        border: 'border-orange-200',
        hover: 'hover:border-orange-300',
      },
      purple: {
        bg: 'from-purple-50 to-purple-100/50',
        text: 'text-purple-600',
        border: 'border-purple-200',
        hover: 'hover:border-purple-300',
      },
      teal: {
        bg: 'from-teal-50 to-teal-100/50',
        text: 'text-teal-600',
        border: 'border-teal-200',
        hover: 'hover:border-teal-300',
      },
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  }, []);

  // Memoized CountUp wrapper component
  const CountUpWrapper = useCallback(
    ({ value, suffix, description, icon }: StatData) => {
      const [isVisible, setIsVisible] = useState(false);
      const counterRef = useRef<HTMLSpanElement>(null);

      useEffect(() => {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              trackEvent(
                'view_stat_counter',
                'engagement',
                `stat_${description.toLowerCase().replace(/\s+/g, '_')}`,
                value,
              );
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
            <CountUp duration={2.5} end={value} start={0} suffix={suffix} />
          ) : (
            '0'
          )}
        </span>
      );
    },
    [],
  );

  // Track section visibility with useCallback
  const handleSectionTracking = useCallback(() => {
    if (!hasTrackedSection) {
      trackEvent('view_section', 'engagement', 'about_expertise_section');
      setHasTrackedSection(true);
    }
  }, [hasTrackedSection]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            handleSectionTracking();
          }
        });
      },
      { threshold: 0.2 },
    );

    const aboutSection = document.getElementById('about-expertise');
    if (aboutSection) {
      observer.observe(aboutSection);
    }

    return () => {
      if (aboutSection) {
        observer.unobserve(aboutSection);
      }
    };
  }, [handleSectionTracking]);

  return (
    <section
      id="about"
      className="section-padding relative overflow-hidden border-b border-gray-100 bg-gradient-to-br from-gray-50 via-white to-primary-50/30"
      aria-labelledby="about-expertise-title"
    >
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 transform rounded-full bg-primary-200 opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-primary-300 opacity-15 blur-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
      </div>

      <div className="container-custom relative">
        {/* Header Section */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-2 text-sm font-medium text-primary-700">
            🚀 Notre Expertise
          </div>
          <h2
            id="about-expertise-title"
            className="mb-6 font-display text-4xl font-bold tracking-tight text-gray-900 md:text-5xl"
          >
            L'Excellence au Service de vos Robots Tondeuses
          </h2>
          <p className="mx-auto max-w-4xl text-xl leading-relaxed text-gray-600">
            {expertiseContent.description}. Découvrez pourquoi plus de{' '}
            {statisticsData.totalRobotsMaintained} clients nous font confiance
            pour l'entretien, la réparation et l'installation de leurs robots
            tondeuses.
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="mb-20">
          <div className="mb-8 text-center">
            <h3 className="mb-2 font-display text-2xl font-bold text-gray-900">
              Des Résultats qui Parlent
            </h3>
            <p className="text-gray-600">
              Notre expertise se reflète dans ces chiffres
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {statsData.map((stat, index) => {
              const colors = getColorClasses(stat.color);

              return (
                <div
                  key={index}
                  className={`group relative overflow-hidden rounded-2xl border ${colors.border} ${colors.hover} bg-gradient-to-br ${colors.bg} p-8 text-center shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-xl`}
                  onMouseEnter={() =>
                    trackEvent(
                      'hover_stat',
                      'engagement',
                      `stat_${stat.description.toLowerCase().replace(/\s+/g, '_')}`,
                    )
                  }
                >
                  {/* Icon */}
                  <div className="mb-4 text-4xl">{stat.icon}</div>

                  {/* Value */}
                  <div
                    className={`mb-2 font-display text-4xl font-bold ${colors.text}`}
                  >
                    <CountUpWrapper
                      value={stat.value}
                      suffix={stat.suffix}
                      description={stat.description}
                      icon={stat.icon}
                      color={stat.color}
                    />
                  </div>

                  {/* Description */}
                  <p className="text-sm font-medium leading-tight text-gray-700">
                    {stat.description}
                  </p>

                  {/* Decorative elements */}
                  <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/30 opacity-50"></div>
                  <div className="absolute -bottom-2 -left-2 h-12 w-12 rounded-full bg-white/20 opacity-30"></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            <div>
              <h3 className="mb-6 font-display text-3xl font-bold text-gray-900">
                {expertiseContent.title}
              </h3>

              <div className="space-y-6">
                {expertiseContent.features.slice(0, 2).map((feature, index) => (
                  <div
                    key={index}
                    className="group flex animate-fade-in items-start gap-4"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="mt-1 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-100 text-xl transition-colors duration-300 group-hover:bg-primary-200">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-2 font-semibold text-gray-900">
                        {feature.title}
                      </h4>
                      <p className="leading-relaxed text-gray-700">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Visual Content */}
          <div className="relative">
            {/* Main feature card */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
              {/* Background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent"></div>

              <div className="relative z-10">
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-100">
                    <span className="text-3xl">🎯</span>
                  </div>
                  <h4 className="mb-2 font-display text-xl font-bold text-gray-900">
                    Service Premium Garanti
                  </h4>
                  <p className="text-gray-600">
                    Une expertise reconnue dans l'univers des robots tondeuses
                  </p>
                </div>

                {/* Benefits list */}
                <div className="space-y-4">
                  {[
                    'Diagnostic gratuit à domicile',
                    'Intervention sous 24h',
                    'Garantie sur toutes nos réparations',
                    'Techniciens certifiés Husqvarna',
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                        <svg
                          className="h-3 w-3 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-primary-300/30 to-transparent"></div>
              <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-gradient-to-tr from-primary-200/40 to-transparent"></div>
            </div>

            {/* Floating stats */}
            <div className="absolute -left-6 -top-6 z-20 rounded-2xl border border-gray-100 bg-white p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                  <span className="text-xl">✅</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900">98%</div>
                  <div className="text-sm text-gray-600">Satisfaction</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 z-20 rounded-2xl border border-gray-100 bg-white p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <span className="text-xl">⚡</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900">24h</div>
                  <div className="text-sm text-gray-600">Intervention</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Features */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          {expertiseContent.features.slice(2).map((feature, index) => (
            <div
              key={index + 2}
              className="animate-fade-in rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md"
              style={{ animationDelay: `${(index + 2) * 0.2}s` }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-lg">
                  {feature.icon}
                </div>
                <h4 className="font-semibold text-gray-900">{feature.title}</h4>
              </div>
              <p className="leading-relaxed text-gray-700">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-white shadow-2xl md:p-12">
            <h3 className="mb-4 font-display text-3xl font-bold">
              Prêt à confier votre robot tondeuse à des experts ?
            </h3>
            <p className="mb-8 text-xl text-primary-100">
              Rejoignez plus de {statisticsData.totalRobotsMaintained} clients
              satisfaits. Devis gratuit sous 24h, intervention rapide garantie.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-primary-600 transition-all duration-200 hover:bg-gray-100 hover:shadow-lg"
              >
                <span>Demander un devis gratuit</span>
                <svg
                  className="h-5 w-5"
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
              <a
                href="#services"
                className="rounded-xl border-2 border-white px-8 py-4 font-semibold text-white transition-all duration-200 hover:bg-white hover:text-primary-600"
              >
                Découvrir nos services
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutExpertise;
