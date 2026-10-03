'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from 'react';

interface MapProps {
  center: [number, number];
  zoom?: number;
  markerPosition?: [number, number];
  popupContent?: string;
  'aria-label'?: string;
}

/**
 * Carte du magasin (Leaflet, la carte existante). Le module n'est chargé qu'au moment
 * où le bloc approche de l'écran : il ne pèse ni sur le premier affichage ni sur la
 * mesure de performance de l'accueil.
 */
export default function ContactMap({
  latitude,
  longitude,
  address,
}: {
  latitude: number;
  longitude: number;
  address: string;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const [Map, setMap] = useState<ComponentType<MapProps> | null>(null);
  // Tableaux stables : la carte ne se reconstruit pas à chaque rendu.
  const position = useMemo<[number, number]>(
    () => [latitude, longitude],
    [latitude, longitude],
  );

  useEffect(() => {
    const node = holder.current;
    if (!node) return;
    let cancelled = false;
    const load = () =>
      import('../Map').then((mod) => {
        if (!cancelled) setMap(() => mod.default as ComponentType<MapProps>);
      });
    if (typeof IntersectionObserver === 'undefined') {
      void load();
      return () => {
        cancelled = true;
      };
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          void load();
        }
      },
      { rootMargin: '300px' },
    );
    observer.observe(node);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={holder}
      className="h-80 overflow-hidden rounded-card border border-line bg-sage-soft mobile:h-64"
    >
      {Map ? (
        <Map
          center={position}
          zoom={15}
          markerPosition={position}
          popupContent={address}
          aria-label={`Carte : ${address}`}
        />
      ) : null}
    </div>
  );
}
