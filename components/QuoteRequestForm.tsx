'use client';

import {
  fetchAccessories,
  fetchRobots,
  submitQuoteRequest,
} from '../lib/actions';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Modal from './Modal';

interface Robot {
  id: number;
  name: string;
  reference?: string;
  sellingPrice?: number;
}

interface Accessory {
  id: number;
  name: string;
  reference?: string;
  category: 'PLUGIN' | 'ANTENNA' | 'SHELTER';
  sellingPrice?: number;
}

interface AccessoriesData {
  plugins: Accessory[];
  antennas: Accessory[];
  shelters: Accessory[];
}

interface QuoteRequestData {
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientCity: string;
  robotInventoryId: number | '';
  pluginInventoryId: number | '';
  antennaInventoryId: number | '';
  shelterInventoryId: number | '';
  hasWire: boolean;
  wireLength: number;
  hasAntennaSupport: boolean;
  hasPlacement: boolean;
  installationNotes: string;
  needsInstaller: boolean;
}

const QuoteRequestForm = (): JSX.Element => {
  const [robots, setRobots] = useState<Robot[]>([]);
  const [accessories, setAccessories] = useState<AccessoriesData>({
    plugins: [],
    antennas: [],
    shelters: [],
  });
  const [robotsLoading, setRobotsLoading] = useState(true);
  const [accessoriesLoading, setAccessoriesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [requestId, setRequestId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<QuoteRequestData>({
    clientFirstName: '',
    clientLastName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    clientCity: '',
    robotInventoryId: '',
    pluginInventoryId: '',
    antennaInventoryId: '',
    shelterInventoryId: '',
    hasWire: false,
    wireLength: 0,
    hasAntennaSupport: false,
    hasPlacement: false,
    installationNotes: '',
    needsInstaller: true,
  });

  // Fetch available robots
  useEffect(() => {
    const loadRobots = async () => {
      setRobotsLoading(true);
      try {
        const result = await fetchRobots();
        if (result.success && result.data) {
          setRobots(result.data);
        } else {
          setError(
            result.error ||
              'Une erreur est survenue lors du chargement des robots disponibles. Veuillez réessayer ou contacter directement notre équipe.',
          );
        }
      } catch (error) {
        console.error('Error fetching robots:', error);
        setError(
          'Une erreur est survenue lors du chargement des robots disponibles. Veuillez réessayer ou contacter directement notre équipe.',
        );
      } finally {
        setRobotsLoading(false);
      }
    };

    loadRobots();
  }, []);

  // Fetch available accessories
  useEffect(() => {
    const loadAccessories = async () => {
      setAccessoriesLoading(true);
      try {
        const result = await fetchAccessories();
        if (result.success && result.data) {
          setAccessories(result.data);
        } else {
          setError(
            result.error ||
              'Une erreur est survenue lors du chargement des accessoires disponibles. Veuillez réessayer ou contacter directement notre équipe.',
          );
        }
      } catch (error) {
        console.error('Error fetching accessories:', error);
        setError(
          'Une erreur est survenue lors du chargement des accessoires disponibles. Veuillez réessayer ou contacter directement notre équipe.',
        );
      } finally {
        setAccessoriesLoading(false);
      }
    };

    loadAccessories();
  }, []);

  const handleChange = (
    field: keyof QuoteRequestData,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    try {
      const result = await submitQuoteRequest(formData);

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la soumission');
      }

      if (result.data) {
        setRequestId(result.data.requestId);
      }
      setSubmitSuccess(true);

      // Reset form
      setFormData({
        clientFirstName: '',
        clientLastName: '',
        clientEmail: '',
        clientPhone: '',
        clientAddress: '',
        clientCity: '',
        robotInventoryId: '',
        pluginInventoryId: '',
        antennaInventoryId: '',
        shelterInventoryId: '',
        hasWire: false,
        wireLength: 0,
        hasAntennaSupport: false,
        hasPlacement: false,
        installationNotes: '',
        needsInstaller: true,
      });
      setRequestId(null);
    } catch (error) {
      console.error('Error submitting quote request:', error);
      setError(
        "Une erreur est survenue lors de l'envoi de votre demande. Veuillez réessayer ou contacter directement notre équipe.",
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedRobot = robots.find(
    (robot) => robot.id === formData.robotInventoryId,
  );
  const selectedPlugin = accessories.plugins.find(
    (plugin) => plugin.id === formData.pluginInventoryId,
  );
  const selectedAntenna = accessories.antennas.find(
    (antenna) => antenna.id === formData.antennaInventoryId,
  );
  const selectedShelter = accessories.shelters.find(
    (shelter) => shelter.id === formData.shelterInventoryId,
  );

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-blue-900">
        <div className="container-custom pb-8 pt-32 sm:pb-16">
          <div className="card mx-auto max-w-2xl border border-primary-200/30 bg-white/95 text-center shadow-2xl backdrop-blur-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 sm:mb-6 sm:h-20 sm:w-20">
              <svg
                className="h-8 w-8 text-green-600 sm:h-10 sm:w-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="mb-3 px-4 text-2xl font-bold text-green-600 sm:mb-4 sm:px-0 sm:text-3xl lg:text-4xl">
              Demande envoyée avec succès !
            </h1>
            <p className="mb-4 px-4 text-sm text-gray-600 sm:mb-6 sm:px-0 sm:text-base">
              Merci pour votre demande d'achat. Vous recevrez votre devis
              personnalisé par email dans les plus brefs délais avec un bon de
              commande signable électroniquement pour finaliser votre achat
              immédiatement.
            </p>

            {/* Request ID Display */}
            {requestId && (
              <div className="mx-4 mb-4 rounded-lg bg-gray-100 p-3 sm:mx-0 sm:mb-6 sm:p-4">
                <p className="text-sm text-gray-700 sm:text-base">
                  <strong>Numéro de demande :</strong> #{requestId}
                </p>
                <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                  Conservez ce numéro pour toute communication avec notre équipe
                </p>
              </div>
            )}

            {/* Next Steps */}
            <div className="mx-4 mb-6 rounded-xl bg-blue-50 p-4 sm:mx-0 sm:mb-8 sm:p-6">
              <h3 className="mb-2 text-base font-semibold text-gray-900 sm:mb-3 sm:text-lg">
                Prochaines étapes :
              </h3>
              <div className="space-y-2 text-left text-xs text-gray-700 sm:text-sm">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 flex-shrink-0 text-blue-600">📧</span>
                  <span>
                    Vous recevrez un email avec votre devis d'achat détaillé
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 flex-shrink-0 text-blue-600">✍️</span>
                  <span>
                    Cliquez sur le lien pour signer votre bon de commande
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 flex-shrink-0 text-blue-600">📬</span>
                  <span>
                    Si vous ne recevez pas l'email, vérifiez vos spams ou
                    contactez-nous
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 flex-shrink-0 text-blue-600">📞</span>
                  <span>
                    Notre équipe vous contactera pour programmer la
                    livraison/installation
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-3 px-4 sm:gap-4 sm:px-0">
              <button
                onClick={() => {
                  setSubmitSuccess(false);
                  setRequestId(null);
                  setFormData({
                    clientFirstName: '',
                    clientLastName: '',
                    clientEmail: '',
                    clientPhone: '',
                    clientAddress: '',
                    clientCity: '',
                    robotInventoryId: '',
                    pluginInventoryId: '',
                    antennaInventoryId: '',
                    shelterInventoryId: '',
                    hasWire: false,
                    wireLength: 0,
                    hasAntennaSupport: false,
                    hasPlacement: false,
                    installationNotes: '',
                    needsInstaller: true,
                  });
                }}
                className="btn-primary w-full px-4 py-3 text-sm sm:w-auto sm:text-base"
              >
                Faire une nouvelle demande
              </button>
              <Link
                href="/#contact"
                className="btn-secondary w-full px-4 py-3 text-center text-sm sm:w-auto sm:text-base"
              >
                Contacter notre équipe
              </Link>
              <Link
                href="/"
                className="btn-secondary w-full px-4 py-3 text-center text-sm sm:w-auto sm:text-base"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modals - rendues au niveau racine */}
      {/* Modal de chargement */}
      {loading && (
        <Modal
          isOpen={loading}
          type="loading"
          message="Envoi de votre demande de devis en cours. Veuillez patienter..."
          closable={false}
        />
      )}

      {/* Modal d'erreur */}
      {error && (
        <Modal
          isOpen={!!error}
          onClose={() => setError(null)}
          type="error"
          title="Erreur"
          message={error}
          closable={true}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-blue-900">
        <div className="container-custom pb-8 pt-32 sm:pb-16">
          <div className="card mx-auto max-w-4xl border border-primary-200/30 bg-white/95 shadow-2xl backdrop-blur-lg">
            {/* Header Section with Digital Process Explanation */}
            <div className="mb-6 text-center sm:mb-8">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-2 text-xs font-medium text-primary-700 sm:mb-4 sm:px-4 sm:text-sm">
                ⚡ Devis Immédiat Digital
              </div>
              <h1 className="mb-3 px-4 text-2xl font-bold sm:mb-4 sm:px-0 sm:text-3xl lg:text-4xl">
                Devis d'achat personnalisé
              </h1>
              <p className="mb-4 px-4 text-base text-gray-600 sm:mb-6 sm:px-0 sm:text-lg">
                Remplissez ce formulaire pour recevoir un devis d'achat détaillé
                avec options d'installation
              </p>

              {/* Process Steps */}
              <div className="mx-auto mb-6 max-w-3xl rounded-xl bg-gradient-to-br from-primary-50 to-blue-50 p-4 sm:mb-8 sm:p-6">
                <h3 className="mb-3 text-base font-semibold text-gray-900 sm:mb-4 sm:text-lg">
                  📧 Processus 100% Digital
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white sm:h-10 sm:w-10 sm:text-sm">
                      1
                    </div>
                    <p className="text-xs text-gray-700 sm:text-sm">
                      Choix du robot
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white sm:h-10 sm:w-10 sm:text-sm">
                      2
                    </div>
                    <p className="text-xs text-gray-700 sm:text-sm">
                      Devis d'achat par email
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white sm:h-10 sm:w-10 sm:text-sm">
                      3
                    </div>
                    <p className="text-xs text-gray-700 sm:text-sm">
                      Bon de commande signable
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-primary-700 sm:mt-4 sm:text-sm">
                  <svg
                    className="h-3 w-3 sm:h-4 sm:w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-center">
                    Signez votre bon de commande directement depuis votre email
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Sélection du robot - EN PREMIER */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-blue-600 p-4 text-white sm:p-6 lg:p-8">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative">
                  <div className="mb-4 flex flex-col items-start gap-3 sm:mb-6 sm:flex-row sm:items-center">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm sm:h-12 sm:w-12">
                      <span className="text-xl sm:text-2xl">🤖</span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold sm:text-2xl">
                        Choisissez votre robot tondeuse
                      </h2>
                      <p className="text-sm text-primary-100 sm:text-base">
                        Sélectionnez le modèle adapté à vos besoins
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm sm:p-6">
                    <label className="mb-2 block text-base font-medium text-white sm:mb-3 sm:text-lg">
                      Robot tondeuse *
                    </label>
                    <select
                      required
                      disabled={robotsLoading}
                      className="w-full rounded-xl border-0 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-lg focus:ring-2 focus:ring-white/50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3 sm:text-lg"
                      value={formData.robotInventoryId}
                      onChange={(e) =>
                        handleChange(
                          'robotInventoryId',
                          parseInt(e.target.value),
                        )
                      }
                    >
                      <option value="">
                        {robotsLoading
                          ? '⏳ Chargement des robots...'
                          : '🎯 Sélectionnez votre robot idéal'}
                      </option>
                      {!robotsLoading &&
                        robots.map((robot) => (
                          <option key={robot.id} value={robot.id}>
                            {robot.name}{' '}
                            {robot.reference && `(${robot.reference})`}
                            {robot.sellingPrice && ` - ${robot.sellingPrice}€`}
                          </option>
                        ))}
                    </select>

                    {selectedRobot && (
                      <div className="mt-3 rounded-lg border border-white/30 bg-white/20 p-3 backdrop-blur-sm sm:mt-4 sm:p-4">
                        <div className="mb-1 flex items-center gap-2 sm:mb-2 sm:gap-3">
                          <span className="text-base sm:text-lg">✅</span>
                          <span className="text-sm font-semibold sm:text-base">
                            Robot sélectionné
                          </span>
                        </div>
                        <p className="mb-1 text-sm text-primary-100 sm:text-base">
                          {selectedRobot.name}{' '}
                          {selectedRobot.reference &&
                            `(${selectedRobot.reference})`}
                        </p>
                        {selectedRobot.sellingPrice && (
                          <p className="mt-1 text-lg font-bold sm:mt-2 sm:text-xl">
                            Prix: {selectedRobot.sellingPrice}€
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Accessoires optionnels */}
              <div className="rounded-2xl border border-orange-200/50 bg-gradient-to-br from-orange-50 to-yellow-50 p-4 sm:p-6 lg:p-8">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold sm:mb-6 sm:gap-3 sm:text-2xl">
                  <span className="text-xl sm:text-2xl">🔧</span>
                  Accessoires optionnels
                </h2>
                <p className="mb-6 text-sm text-gray-600 sm:text-base">
                  Personnalisez votre installation avec nos accessoires
                  recommandés
                </p>

                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
                  {/* Plugin */}
                  <div className="rounded-xl border border-gray-200/50 bg-white/80 p-4 backdrop-blur-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-lg">⚡</span>
                      <h3 className="font-semibold text-gray-900">Plugin</h3>
                    </div>
                    <select
                      disabled={accessoriesLoading}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.pluginInventoryId}
                      onChange={(e) =>
                        handleChange(
                          'pluginInventoryId',
                          e.target.value ? parseInt(e.target.value) : '',
                        )
                      }
                    >
                      <option value="">
                        {accessoriesLoading ? 'Chargement...' : 'Aucun plugin'}
                      </option>
                      {!accessoriesLoading &&
                        accessories.plugins.map((plugin) => (
                          <option key={plugin.id} value={plugin.id}>
                            {plugin.name}{' '}
                            {plugin.reference && `(${plugin.reference})`}
                            {plugin.sellingPrice &&
                              ` - ${plugin.sellingPrice}€`}
                          </option>
                        ))}
                    </select>
                    {selectedPlugin && (
                      <div className="mt-2 rounded-lg bg-green-50 p-2 text-xs text-green-700">
                        ✅ {selectedPlugin.name} sélectionné
                        {selectedPlugin.sellingPrice && (
                          <span className="font-semibold">
                            {' '}
                            - {selectedPlugin.sellingPrice}€
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Antenne */}
                  <div className="rounded-xl border border-gray-200/50 bg-white/80 p-4 backdrop-blur-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-lg">📡</span>
                      <h3 className="font-semibold text-gray-900">Antenne</h3>
                    </div>
                    <select
                      disabled={accessoriesLoading}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.antennaInventoryId}
                      onChange={(e) =>
                        handleChange(
                          'antennaInventoryId',
                          e.target.value ? parseInt(e.target.value) : '',
                        )
                      }
                    >
                      <option value="">
                        {accessoriesLoading
                          ? 'Chargement...'
                          : 'Aucune antenne'}
                      </option>
                      {!accessoriesLoading &&
                        accessories.antennas.map((antenna) => (
                          <option key={antenna.id} value={antenna.id}>
                            {antenna.name}{' '}
                            {antenna.reference && `(${antenna.reference})`}
                            {antenna.sellingPrice &&
                              ` - ${antenna.sellingPrice}€`}
                          </option>
                        ))}
                    </select>
                    {selectedAntenna && (
                      <div className="mt-2 rounded-lg bg-green-50 p-2 text-xs text-green-700">
                        ✅ {selectedAntenna.name} sélectionné
                        {selectedAntenna.sellingPrice && (
                          <span className="font-semibold">
                            {' '}
                            - {selectedAntenna.sellingPrice}€
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Abri */}
                  <div className="rounded-xl border border-gray-200/50 bg-white/80 p-4 backdrop-blur-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-lg">🏠</span>
                      <h3 className="font-semibold text-gray-900">Abri</h3>
                    </div>
                    <select
                      disabled={accessoriesLoading}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.shelterInventoryId}
                      onChange={(e) =>
                        handleChange(
                          'shelterInventoryId',
                          e.target.value ? parseInt(e.target.value) : '',
                        )
                      }
                    >
                      <option value="">
                        {accessoriesLoading ? 'Chargement...' : 'Aucun abri'}
                      </option>
                      {!accessoriesLoading &&
                        accessories.shelters.map((shelter) => (
                          <option key={shelter.id} value={shelter.id}>
                            {shelter.name}{' '}
                            {shelter.reference && `(${shelter.reference})`}
                            {shelter.sellingPrice &&
                              ` - ${shelter.sellingPrice}€`}
                          </option>
                        ))}
                    </select>
                    {selectedShelter && (
                      <div className="mt-2 rounded-lg bg-green-50 p-2 text-xs text-green-700">
                        ✅ {selectedShelter.name} sélectionné
                        {selectedShelter.sellingPrice && (
                          <span className="font-semibold">
                            {' '}
                            - {selectedShelter.sellingPrice}€
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {(selectedPlugin || selectedAntenna || selectedShelter) && (
                  <div className="mt-6 rounded-xl bg-white/90 p-4 shadow-sm">
                    <h4 className="mb-3 font-semibold text-gray-900">
                      Accessoires sélectionnés :
                    </h4>
                    <div className="space-y-2">
                      {selectedPlugin && (
                        <div className="flex justify-between text-sm">
                          <span>{selectedPlugin.name}</span>
                          <span className="font-semibold">
                            {selectedPlugin.sellingPrice
                              ? `${selectedPlugin.sellingPrice}€`
                              : 'Prix sur devis'}
                          </span>
                        </div>
                      )}
                      {selectedAntenna && (
                        <div className="flex justify-between text-sm">
                          <span>{selectedAntenna.name}</span>
                          <span className="font-semibold">
                            {selectedAntenna.sellingPrice
                              ? `${selectedAntenna.sellingPrice}€`
                              : 'Prix sur devis'}
                          </span>
                        </div>
                      )}
                      {selectedShelter && (
                        <div className="flex justify-between text-sm">
                          <span>{selectedShelter.name}</span>
                          <span className="font-semibold">
                            {selectedShelter.sellingPrice
                              ? `${selectedShelter.sellingPrice}€`
                              : 'Prix sur devis'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Informations personnelles */}
              <div className="rounded-2xl border border-gray-200/50 bg-white/60 p-4 backdrop-blur-sm sm:p-6 lg:p-8">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold sm:mb-6 sm:gap-3 sm:text-2xl">
                  <span className="text-xl sm:text-2xl">👤</span>
                  Vos informations
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 sm:mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500 sm:px-4 sm:text-base"
                      value={formData.clientFirstName}
                      onChange={(e) =>
                        handleChange('clientFirstName', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 sm:mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500 sm:px-4 sm:text-base"
                      value={formData.clientLastName}
                      onChange={(e) =>
                        handleChange('clientLastName', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 sm:mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500 sm:px-4 sm:text-base"
                      value={formData.clientEmail}
                      onChange={(e) =>
                        handleChange('clientEmail', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 sm:mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500 sm:px-4 sm:text-base"
                      value={formData.clientPhone}
                      onChange={(e) =>
                        handleChange('clientPhone', e.target.value)
                      }
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700 sm:mb-2">
                      Adresse
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500 sm:px-4 sm:text-base"
                      value={formData.clientAddress}
                      onChange={(e) =>
                        handleChange('clientAddress', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 sm:mb-2">
                      Ville
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500 sm:px-4 sm:text-base"
                      value={formData.clientCity}
                      onChange={(e) =>
                        handleChange('clientCity', e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Options d'installation */}
              <div className="rounded-2xl border border-green-200/50 bg-gradient-to-br from-green-50 to-blue-50 p-4 sm:p-6 lg:p-8">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold sm:mb-6 sm:gap-3 sm:text-2xl">
                  <span className="text-xl sm:text-2xl">🔧</span>
                  Options d'installation
                </h2>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start sm:items-center">
                    <input
                      type="checkbox"
                      id="needsInstaller"
                      className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-gray-300 text-primary-600 focus:ring-primary-500 sm:mt-0"
                      checked={formData.needsInstaller}
                      onChange={(e) =>
                        handleChange('needsInstaller', e.target.checked)
                      }
                    />
                    <label
                      htmlFor="needsInstaller"
                      className="ml-2 text-sm leading-relaxed text-gray-700"
                    >
                      Installation professionnelle requise
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                    <div className="flex items-start sm:items-center">
                      <input
                        type="checkbox"
                        id="hasWire"
                        className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-gray-300 text-primary-600 focus:ring-primary-500 sm:mt-0"
                        checked={formData.hasWire}
                        onChange={(e) =>
                          handleChange('hasWire', e.target.checked)
                        }
                      />
                      <label
                        htmlFor="hasWire"
                        className="ml-2 text-sm leading-relaxed text-gray-700"
                      >
                        Câble périphérique (1,3€/m)
                      </label>
                    </div>

                    {formData.hasWire && (
                      <div className="md:col-span-2 md:pl-6">
                        <label className="mb-1 block text-sm font-medium text-gray-700 sm:mb-2">
                          Longueur de câble (mètres)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="1000"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500 sm:px-4 sm:text-base"
                          value={formData.wireLength}
                          onChange={(e) =>
                            handleChange(
                              'wireLength',
                              parseInt(e.target.value) || 0,
                            )
                          }
                        />
                      </div>
                    )}

                    <div className="flex items-start sm:items-center">
                      <input
                        type="checkbox"
                        id="hasAntennaSupport"
                        className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-gray-300 text-primary-600 focus:ring-primary-500 sm:mt-0"
                        checked={formData.hasAntennaSupport}
                        onChange={(e) =>
                          handleChange('hasAntennaSupport', e.target.checked)
                        }
                      />
                      <label
                        htmlFor="hasAntennaSupport"
                        className="ml-2 text-sm leading-relaxed text-gray-700"
                      >
                        Support d'antenne (50€)
                      </label>
                    </div>

                    <div className="flex items-start sm:items-center">
                      <input
                        type="checkbox"
                        id="hasPlacement"
                        className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-gray-300 text-primary-600 focus:ring-primary-500 sm:mt-0"
                        checked={formData.hasPlacement}
                        onChange={(e) =>
                          handleChange('hasPlacement', e.target.checked)
                        }
                      />
                      <label
                        htmlFor="hasPlacement"
                        className="ml-2 text-sm leading-relaxed text-gray-700"
                      >
                        Placement du robot (200€)
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 sm:mb-2">
                      Notes additionnelles
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Décrivez votre jardin, contraintes spéciales, questions..."
                      className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500 sm:px-4 sm:text-base"
                      value={formData.installationNotes}
                      onChange={(e) =>
                        handleChange('installationNotes', e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Récapitulatif */}
              {selectedRobot && (
                <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 p-4 text-white sm:p-6 lg:p-8">
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold sm:mb-6 sm:gap-3 sm:text-2xl">
                    <span className="text-xl sm:text-2xl">📋</span>
                    Récapitulatif de votre commande
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
                    <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm sm:p-6">
                      <h3 className="mb-2 flex items-center gap-2 text-base font-semibold sm:mb-3 sm:text-lg">
                        🤖 Robot sélectionné
                      </h3>
                      <p className="mb-1 text-sm text-gray-200 sm:text-base">
                        {selectedRobot.name}
                        {selectedRobot.reference &&
                          ` (${selectedRobot.reference})`}
                      </p>
                      {selectedRobot.sellingPrice && (
                        <p className="mt-1 text-xl font-bold text-green-400 sm:mt-2 sm:text-2xl">
                          {selectedRobot.sellingPrice}€
                        </p>
                      )}
                    </div>

                    {(selectedPlugin || selectedAntenna || selectedShelter) && (
                      <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm sm:p-6">
                        <h3 className="mb-2 flex items-center gap-2 text-base font-semibold sm:mb-3 sm:text-lg">
                          🔧 Accessoires
                        </h3>
                        <div className="space-y-1 text-sm text-gray-200 sm:space-y-2 sm:text-base">
                          {selectedPlugin && (
                            <p>
                              <strong>Plugin:</strong> ✅ {selectedPlugin.name}
                              {selectedPlugin.sellingPrice && (
                                <span className="ml-1 font-semibold text-green-400">
                                  ({selectedPlugin.sellingPrice}€)
                                </span>
                              )}
                            </p>
                          )}
                          {selectedAntenna && (
                            <p>
                              <strong>Antenne:</strong> ✅{' '}
                              {selectedAntenna.name}
                              {selectedAntenna.sellingPrice && (
                                <span className="ml-1 font-semibold text-green-400">
                                  ({selectedAntenna.sellingPrice}€)
                                </span>
                              )}
                            </p>
                          )}
                          {selectedShelter && (
                            <p>
                              <strong>Abri:</strong> ✅ {selectedShelter.name}
                              {selectedShelter.sellingPrice && (
                                <span className="ml-1 font-semibold text-green-400">
                                  ({selectedShelter.sellingPrice}€)
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm sm:p-6">
                      <h3 className="mb-2 flex items-center gap-2 text-base font-semibold sm:mb-3 sm:text-lg">
                        ⚙️ Options d'installation
                      </h3>
                      <div className="space-y-1 text-sm text-gray-200 sm:space-y-2 sm:text-base">
                        <p>
                          <strong>Installation:</strong>{' '}
                          {formData.needsInstaller
                            ? '✅ Incluse'
                            : '❌ Non demandée'}
                        </p>
                        {formData.hasWire && (
                          <p>
                            <strong>Câble:</strong> ✅ {formData.wireLength}m
                          </p>
                        )}
                        {formData.hasAntennaSupport && (
                          <p>
                            <strong>Support d'antenne:</strong> ✅ Inclus
                          </p>
                        )}
                        {formData.hasPlacement && (
                          <p>
                            <strong>Placement station:</strong> ✅ Inclus
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Total price calculation */}
                  {(selectedRobot.sellingPrice ||
                    selectedPlugin?.sellingPrice ||
                    selectedAntenna?.sellingPrice ||
                    selectedShelter?.sellingPrice) && (
                    <div className="mt-6 rounded-xl border-2 border-green-400/50 bg-green-900/30 p-4 text-center sm:p-6">
                      <h3 className="mb-2 text-lg font-semibold text-green-400 sm:text-xl">
                        Prix total estimé
                      </h3>
                      <p className="text-2xl font-bold text-white sm:text-3xl">
                        {(selectedRobot.sellingPrice || 0) +
                          (selectedPlugin?.sellingPrice || 0) +
                          (selectedAntenna?.sellingPrice || 0) +
                          (selectedShelter?.sellingPrice || 0)}
                        €
                      </p>
                      <p className="mt-1 text-xs text-green-200 sm:text-sm">
                        Prix hors installation - Devis final détaillé par email
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col justify-center gap-3 pt-4 sm:gap-4 sm:pt-6">
                <button
                  type="submit"
                  disabled={loading || !formData.robotInventoryId}
                  className="btn-primary w-full px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[200px] sm:text-base"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                      Envoi en cours...
                    </span>
                  ) : (
                    'Demander un devis'
                  )}
                </button>

                <Link
                  href="/devis"
                  className="btn-secondary w-full px-4 py-3 text-center text-sm sm:w-auto sm:text-base"
                >
                  Retour
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuoteRequestForm;
