import type { ElementType, HTMLAttributes } from 'react';

type Tone = 'white' | 'sage' | 'forest';

const TONES: Record<Tone, string> = {
  white: 'border-line bg-white',
  sage: 'border-line bg-sage',
  forest: 'border-forest bg-forest text-white',
};

/** Conteneur de la maquette : arrondi de 10 px, bordure fine, presque pas d'ombre. */
export default function Card({
  as,
  tone = 'white',
  className = '',
  ...rest
}: { as?: ElementType; tone?: Tone } & HTMLAttributes<HTMLElement>) {
  const Tag = as ?? 'div';
  return (
    <Tag
      className={`rounded-card border ${TONES[tone]} ${className}`}
      {...rest}
    />
  );
}
