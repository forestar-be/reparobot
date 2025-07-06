'use client';

import robotsData from '../config/robots.json';
import { trackEvent } from '../utils/analytics';
import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import RobotContactForm from './RobotContactForm';

interface Robot {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  maxSurface: number;
  maxSlope: number;
  price: number;
  priceExVAT?: number;
  installationPrice: number;
  promotion?: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

const RobotSelection = (): JSX.Element => {
  const router = useRouter();
  const [categories] = useState<Category[]>(robotsData.categories);
  const [robots] = useState<Robot[]>(robotsData.robots);
  const [selectedRobot, setSelectedRobot] = useState<Robot | null>(null);
  const [isFormEdited, setIsFormEdited] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const [hasTrackedView, setHasTrackedView] = useState(false);

  // Handle screen size changes
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768); // md breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleQuoteRequest = () => {
    router.push('/devis/demande');
  };

  // Track view
  useEffect(() => {
    if (!hasTrackedView) {
      trackEvent('page_view', 'navigation', 'robot_selection_page');
      setHasTrackedView(true);
    }
  }, [hasTrackedView]);

  const handleRobotClick = (robot: Robot) => {
    setSelectedRobot(robot);
    trackEvent('robot_selection', 'user_interaction', `robot_${robot.id}`);
  };

  const handleCloseForm = (force?: boolean) => {
    setSelectedRobot(null);
    setIsFormEdited(false);
  };

  return (
    <>
      <Head>
        <title>
          Robots Tondeuses Husqvarna | Réservation et Installation | RepaRobot |
          Forestar
        </title>
        <meta
          name="description"
          content="Découvrez et réservez votre robot tondeuse Husqvarna. Large gamme de modèles filaires et sans fil avec installation professionnelle incluse. Livraison rapide en Belgique."
        />
        <meta
          name="keywords"
          content="robot tondeuse, Husqvarna, tondeuse automatique, installation robot tondeuse, robot jardin, Automower"
        />
        <meta
          property="og:title"
          content="Robots Tondeuses Husqvarna | Réservation et Installation"
        />
        <meta
          property="og:description"
          content="Réservez votre robot tondeuse Husqvarna avec installation professionnelle incluse. Livraison rapide en Belgique."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://reparobot.be/robots" />
        <meta
          property="og:image"
          content="https://reparobot.be/images/robots-husqvarna.jpg"
        />
        <link rel="canonical" href="https://reparobot.be/robots" />
      </Head>

      <div
        className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-blue-900 pb-8 pt-32"
        ref={topRef}
      >
        <div className="container-custom mx-auto max-w-7xl px-4">
          {/* Main Card Container */}
          <div className="card border border-white/20 bg-white/95 shadow-2xl backdrop-blur-sm">
            {/* Robot Reservation Header - Principal */}
            <div className="-m-6 mb-8 rounded-t-xl bg-gradient-to-br from-primary-600 via-primary-700 to-blue-600 p-8 text-white shadow-xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-4 -top-4 h-24 w-24 rotate-45 rounded-lg bg-white"></div>
                <div className="absolute -bottom-4 -left-4 h-16 w-16 rotate-12 rounded-lg bg-white"></div>
              </div>

              <div className="relative z-10">
                {/* Compact Devis Card - Floating in top right corner */}
                <div className="absolute -top-4 right-4 hidden lg:block">
                  <div className="w-80 transform rounded-xl border border-white/30 bg-white/95 p-4 shadow-xl backdrop-blur-lg transition-all duration-300 hover:scale-105">
                    <div className="text-center">
                      <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600">
                        <span className="text-sm text-white">⚡</span>
                      </div>
                      <h3 className="mb-1 text-lg font-bold text-gray-800">
                        Devis Immédiat
                      </h3>
                      <p className="mb-3 text-xs text-gray-600">
                        Prix et disponibilité garantis
                      </p>

                      <div className="mb-3 flex flex-wrap justify-center gap-1">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                          <span className="text-xs">✅</span>
                          Prix garantis
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                          <span className="text-xs">📦</span>
                          Stock confirmé
                        </span>
                      </div>

                      <button
                        onClick={handleQuoteRequest}
                        className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:from-emerald-600 hover:to-emerald-700"
                      >
                        📋 Obtenir mon devis
                      </button>
                      <p className="mt-1 text-xs text-gray-500">
                        Installation incluse
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile Devis Button - Top right corner */}
                <div className="absolute -top-2 right-0 lg:hidden">
                  <button
                    onClick={handleQuoteRequest}
                    className="group rounded-lg border border-emerald-300/50 bg-emerald-500/90 px-3 py-2 text-xs font-medium text-white backdrop-blur transition-all duration-300 hover:bg-emerald-600"
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-xs">⚡</span>
                      <div className="text-left">
                        <div className="font-semibold leading-tight">
                          Devis immédiat
                        </div>
                        <div className="text-xs leading-tight text-emerald-100">
                          Prix garantis
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Main Header Content */}
                <div className="text-center lg:pr-80 lg:text-left">
                  <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <span className="text-3xl">🤖</span>
                  </div>
                  <h1 className="mb-4 font-display text-4xl font-bold text-white lg:text-5xl">
                    Réservation Robots Tondeuses
                  </h1>
                  <p className="mb-6 max-w-3xl text-xl leading-relaxed text-primary-100">
                    Découvrez notre gamme complète de robots tondeuses autonomes
                    Husqvarna pour un gazon parfait sans effort
                  </p>

                  {/* Warning Notice */}
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-300/30 bg-orange-500/20 px-4 py-2 text-sm backdrop-blur-sm">
                    <span className="text-orange-200">⚠️</span>
                    <span className="text-orange-100">
                      Prix et disponibilité à confirmer après réception de la
                      demande de réservation
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {categories.map((category) => (
              <div key={category.id} className="mb-12">
                {/* Category Header */}
                <div className="mb-8 rounded-xl border border-primary-200/50 bg-gradient-to-r from-primary-50 to-blue-50 p-6">
                  <h2 className="mb-3 text-3xl font-bold text-gray-800">
                    {category.name}
                  </h2>
                  <p className="text-lg leading-relaxed text-gray-600">
                    {category.description}
                  </p>
                </div>

                {/* Robot Cards Grid */}
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {robots
                    .filter((robot) => robot.category === category.id)
                    .map((robot) => (
                      <div key={robot.id} className="group">
                        <div
                          className="relative h-full transform cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-primary-500/20"
                          onClick={() => handleRobotClick(robot)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleRobotClick(robot);
                            }
                          }}
                        >
                          {/* Image Section with Overlay */}
                          <div className="relative overflow-hidden">
                            <Image
                              src={robot.image}
                              alt={robot.name}
                              width={400}
                              height={160}
                              className="h-40 w-full bg-gray-100 object-cover object-center transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

                            {/* Status Badge */}
                            <div className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-primary-500 to-blue-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                              Réservation
                            </div>

                            {/* Promotion Badge */}
                            {robot.promotion && (
                              <div className="absolute bottom-3 left-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                                {robot.promotion}
                              </div>
                            )}
                          </div>

                          {/* Content Section */}
                          <div className="flex flex-1 flex-col p-6">
                            <h3 className="mb-3 text-xl font-bold text-gray-900">
                              {robot.name}
                            </h3>

                            <p className="mb-6 flex-1 leading-relaxed text-gray-600">
                              {robot.description}
                            </p>

                            {/* Specifications */}
                            <div className="mb-6 flex flex-wrap gap-2">
                              <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800">
                                <span className="text-xs">🏠</span>
                                {robot.maxSurface} m²
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                                <span className="text-xs">⛰️</span>
                                {robot.maxSlope}%
                              </span>
                            </div>

                            {/* Pricing Section */}
                            <div className="mt-auto">
                              <div className="mb-3 rounded-lg bg-gray-50 p-4">
                                <div className="flex items-baseline justify-between">
                                  <span className="text-2xl font-bold text-gray-900">
                                    {robot.price} €
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    + {robot.installationPrice} € installation
                                  </span>
                                </div>
                              </div>

                              {/* Action Button */}
                              <div className="mt-4">
                                <div className="w-full rounded-lg bg-gradient-to-r from-primary-500 to-blue-500 px-4 py-2 text-center text-sm font-semibold text-white transition-all duration-300 group-hover:from-primary-600 group-hover:to-blue-600 group-hover:shadow-lg">
                                  <span className="block group-hover:hidden">
                                    Réserver
                                  </span>
                                  <span className="hidden group-hover:block">
                                    Cliquer pour réserver
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Dialog */}
        {selectedRobot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div
              className={`max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-lg bg-white ${
                isSmallScreen ? 'h-full max-h-full' : ''
              }`}
            >
              <RobotContactForm
                robot={selectedRobot}
                onClose={handleCloseForm}
                onFormEdit={setIsFormEdited}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RobotSelection;
