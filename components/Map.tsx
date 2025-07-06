'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issues
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Define proper types for coordinates
type LatLngTuple = [number, number];

interface MapProps {
  center: LatLngTuple;
  zoom?: number;
  markerPosition?: LatLngTuple;
  popupContent?: string;
  'aria-label'?: string;
}

const Map = ({
  center,
  zoom = 13,
  markerPosition,
  popupContent = 'Default popup content',
  'aria-label': ariaLabel,
}: MapProps): JSX.Element => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Validate center coordinates
    if (
      !center ||
      center.length !== 2 ||
      typeof center[0] !== 'number' ||
      typeof center[1] !== 'number'
    ) {
      console.error('Invalid center coordinates provided:', center);
      return;
    }

    // Clean up any existing map instance
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Check if container is already initialized
    const container = L.DomUtil.get(containerRef.current);
    if (container) {
      // Type assertion to handle the _leaflet_id property
      (container as { _leaflet_id?: number })._leaflet_id = undefined;
    }

    try {
      // Create explicit LatLng objects for type safety
      const centerLatLng = L.latLng(center[0], center[1]);
      const map = L.map(containerRef.current).setView(centerLatLng, zoom);
      mapRef.current = map;

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Add marker if position is provided
      if (markerPosition && markerPosition.length === 2) {
        const markerLatLng = L.latLng(markerPosition[0], markerPosition[1]);
        const marker = L.marker(markerLatLng).addTo(map);
        if (popupContent) {
          marker.bindPopup(popupContent);
        }
      }

      // Ensure proper map sizing
      requestAnimationFrame(() => {
        map.invalidateSize();
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, zoom, markerPosition, popupContent]);

  return (
    <div
      ref={containerRef}
      className="h-96 w-full"
      style={{ minHeight: '24rem' }}
      role="region"
      aria-label={ariaLabel || 'Interactive map'}
    />
  );
};

export default Map;
