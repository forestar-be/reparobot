'use client';

/**
 * Pont entre les cartes de forfaits (rendues côté serveur) et le formulaire : « Réserver un
 * passage » sur une carte présélectionne le type d'intervention et l'option du forfait.
 */
import AnchorLink from '../ui/AnchorLink';
import Glyph from '../ui/Glyph';
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type PresetKind = 'maintenance' | 'winter' | 'repair';

interface Preset {
  kind: PresetKind;
  /** Change à chaque clic : choisir deux fois la même carte réapplique la présélection. */
  nonce: number;
}

interface BookingContextValue {
  preset: Preset | null;
  apply: (kind: PresetKind) => void;
}

const BookingContext = createContext<BookingContextValue>({
  preset: null,
  apply: () => {},
});

export function BookingProvider({ children }: { children: ReactNode }) {
  const [preset, setPreset] = useState<Preset | null>(null);
  const value = useMemo<BookingContextValue>(
    () => ({
      preset,
      apply: (kind) =>
        setPreset((current) => ({ kind, nonce: (current?.nonce ?? 0) + 1 })),
    }),
    [preset],
  );
  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBookingPreset(): Preset | null {
  return useContext(BookingContext).preset;
}

/**
 * Lien d'une carte : présélection, puis défilement explicite jusqu'au formulaire (premier champ
 * focalisé), même si `#passage` est déjà dans l'adresse.
 */
export function PresetLink({
  kind,
  children,
}: {
  kind: PresetKind;
  children: ReactNode;
}) {
  const { apply } = useContext(BookingContext);
  return (
    <AnchorLink
      href="#passage"
      onClick={() => apply(kind)}
      className="inline-flex items-center gap-3 border-b border-current pb-[3px] text-sm font-bold text-forest"
    >
      {children}
      <Glyph name="arrow" className="h-[17px] w-[17px]" />
    </AnchorLink>
  );
}
