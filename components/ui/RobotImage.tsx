import Image from 'next/image';
import Glyph from './Glyph';

/** Image neutre de l'API quand le robot n'a pas encore de photo (H-02). */

/**
 * Photo d'un robot, entière (jamais rognée). Sans photo (valeur neutre de l'API ou
 * absence), un visuel de repli neutre remplace l'image : aucune fausse photo.
 * À placer dans un conteneur positionné qui donne sa taille.
 */
export default function RobotImage({
  src,
  name,
  sizes,
  priority = false,
}: {
  src: string | null | undefined;
  name: string;
  sizes: string;
  priority?: boolean;
}) {
  const missing = !src;
  if (missing) {
    return (
      <div
        role="img"
        aria-label={`${name} : photo à venir`}
        className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted"
      >
        <Glyph name="robot" className="h-1/3 max-h-24 w-1/3 max-w-24" />
        <span className="text-[11px]">Photo à venir</span>
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={name}
      fill
      sizes={sizes}
      priority={priority}
      className="object-contain mix-blend-multiply"
    />
  );
}
