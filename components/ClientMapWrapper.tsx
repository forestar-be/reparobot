'use client';

import { useEffect, useState } from 'react';

interface ClientMapWrapperProps {
  latitude: number;
  longitude: number;
  address: string;
  isDarkMode: boolean;
}

const ClientMapWrapper = ({
  latitude,
  longitude,
  address,
  isDarkMode,
}: ClientMapWrapperProps): JSX.Element => {
  const [MapComponent, setMapComponent] = useState<any>(null);

  useEffect(() => {
    // Load the map component on the client side
    import('./Map').then((mod) => {
      setMapComponent(() => mod.default);
    });
  }, []);

  if (!MapComponent) {
    return (
      <div
        className="flex h-[400px] w-full items-center justify-center rounded-lg bg-gray-100"
        role="progressbar"
        aria-label="Loading map..."
      >
        <div className="text-center">
          <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600"></div>
          <p className="text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-lg ${
        isDarkMode ? 'brightness-75' : 'brightness-90'
      }`}
      style={{
        filter: isDarkMode ? 'brightness(0.7)' : 'brightness(0.9)',
      }}
    >
      <MapComponent
        center={[latitude, longitude]}
        zoom={13}
        markerPosition={[latitude, longitude]}
        popupContent={address}
        aria-label={`Map location of ${address}`}
      />
    </div>
  );
};

export default ClientMapWrapper;
