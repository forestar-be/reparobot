'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';

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
        className="h-[400px] w-full bg-gray-100 flex items-center justify-center"
        role="progressbar"
        aria-label="Loading map..."
      >
        Loading map...
      </div>
    );
  }

  return (
    <Box
      sx={{
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
    </Box>
  );
};

export default ClientMapWrapper;
