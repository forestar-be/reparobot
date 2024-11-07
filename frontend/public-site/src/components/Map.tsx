// src/components/Map.tsx

import React, { useState, useEffect, useRef } from 'react';
import { LatLngExpression } from 'leaflet';
import { useTheme } from '@mui/material/styles';
import {
  MapContainer,
  Circle,
  TileLayer,
  AttributionControl,
  Marker,
  Popup,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { trackEvent } from '../utils/analytics'; // Import the tracking utility

interface Props {
  coordinates: [number, number];
  zoom: number;
}

const Map: React.FC<Props> = ({ coordinates, zoom }) => {
  const theme = useTheme();
  const businessName = 'Réparobot';
  const address = "160 Chaussée d'ecaussinnes, 7090 Braine le comte, Belgique";
  const position: LatLngExpression = coordinates;
  const [mapKey, setMapKey] = useState(0);
  const mapRef = useRef<HTMLDivElement | null>(null); // Reference to the map container
  const [hasTrackedView, setHasTrackedView] = useState(false); // State to ensure the event is sent only once

  useEffect(() => {
    const handleResize = () => setMapKey((prev) => prev + 1);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedView) {
            // Track Map section visibility
            trackEvent(
              'section_view',           // Action: consistent naming with other section views
              'map_interaction',       // Category: snake_case, consistent with map events
              'map_section_visible'    // Label: more specific, snake_case
            );
            setHasTrackedView(true); // Prevent duplicate tracking
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of the map is visible
      }
    );

    if (mapRef.current) {
      observer.observe(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        observer.unobserve(mapRef.current);
      }
    };
  }, [hasTrackedView]);

  const fillOptions = {
    fillColor:
      theme.palette.mode === 'dark'
        ? theme.palette.primary.main
        : theme.palette.success.dark,
    fillOpacity: 0.6,
    color:
      theme.palette.mode === 'dark'
        ? theme.palette.primary.light
        : theme.palette.success.light,
  };

  // Event handler for marker click
  const handleMarkerClick = () => {
    trackEvent(
      'marker_click',          // Action: snake_case, specific interaction
      'map_interaction',       // Category: snake_case, consistent with other map events
      'location_marker'        // Label: snake_case, describes the element
    );
  };

  // Event handler for popup open
  const handlePopupOpen = () => {
    trackEvent(
      'popup_open',           // Action: already good, keep it
      'map_interaction',      // Category: already good, keep it
      'location_details'      // Label: already good, keep it
    );
  };

  return (
    <div ref={mapRef}>
      <h2>{`Location of ${businessName}`}</h2>
      <MapContainer
        key={mapKey}
        center={position}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '400px', width: '100%' }}
        aria-label={`Map showing location of ${businessName}`}
        attributionControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Circle center={position} pathOptions={fillOptions} radius={50} />
        <Marker position={position} eventHandlers={{
          click: handleMarkerClick
        }}>
          <Popup eventHandlers={{
            popupopen: handlePopupOpen // Corrected event name
          }}>
            <strong>{businessName}</strong>
            <br />
            {address}
          </Popup>
        </Marker>
        <AttributionControl position="bottomright" prefix={false} />
      </MapContainer>
    </div>
  );
};

export default React.memo(Map);
