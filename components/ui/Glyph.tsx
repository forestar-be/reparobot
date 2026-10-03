import {
  ArrowRight,
  Bot,
  Calculator,
  Check,
  House,
  Leaf,
  Mail,
  MapPin,
  Menu,
  Phone,
  Star,
  Wrench,
  X,
  type LucideProps,
} from 'lucide-react';

const GLYPHS = {
  arrow: ArrowRight,
  robot: Bot,
  calc: Calculator,
  check: Check,
  garden: House,
  leaf: Leaf,
  mail: Mail,
  pin: MapPin,
  menu: Menu,
  phone: Phone,
  star: Star,
  tool: Wrench,
  close: X,
} as const;

export type GlyphName = keyof typeof GLYPHS;

/** Pictogrammes de la maquette : traits fins (1,5), décoratifs, jamais lus par un lecteur d'écran. */
export default function Glyph({
  name,
  className = 'h-5 w-5',
  ...rest
}: { name: GlyphName } & Omit<LucideProps, 'ref'>) {
  const Icon = GLYPHS[name];
  return (
    <Icon
      aria-hidden="true"
      strokeWidth={1.5}
      className={`shrink-0 ${className}`}
      {...rest}
    />
  );
}
