'use client';

import { OFFICIAL_SITE_URL, STORE_NAME } from '../../lib/site-info';
import type { MapPopup } from '../Map';
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
  popup?: MapPopup;
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
  // Bulle du repère : nom du magasin, adresse (site-info) et lien vers le site officiel.
  const popup = useMemo<MapPopup>(
    () => ({
      title: STORE_NAME,
      address,
      linkLabel: 'Site officiel Forestar.be',
      linkHref: OFFICIAL_SITE_URL,
    }),
    [address],
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
      className="h-full min-h-[300px] overflow-hidden rounded-card border border-line bg-sage-soft mobile:h-60 mobile:min-h-0"
    >
      {Map ? (
        <Map
          center={position}
          zoom={15}
          markerPosition={position}
          popup={popup}
          aria-label={`Carte : ${address}`}
        />
      ) : null}
    </div>
  );
}
