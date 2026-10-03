import { formatEuro } from '../../lib/format';

/**
 * Prix d'un robot : « 4299 € » suivi de « TVAC, robot seul » (D-02). L'installation
 * se montre à part, avec `InstallationPrice`.
 */
export default function Price({
  amount,
  size = 'card',
  className = '',
}: {
  amount: number;
  size?: 'card' | 'compact' | 'big';
  className?: string;
}) {
  if (size === 'big') {
    return (
      <div
        className={`text-[37px] leading-[1.3] font-bold tracking-[-0.05em] text-ink mobile:text-[34px] ${className}`}
      >
        {formatEuro(amount)}
        <span className="ml-3 text-[11px] font-normal tracking-normal text-muted mobile:ml-2.5">
          TVAC, robot seul
        </span>
      </div>
    );
  }
  const sizing =
    size === 'compact'
      ? 'text-[21px] mobile:text-[19px]'
      : 'text-[22px] mobile:text-[25px]';
  return (
    <div
      className={`font-bold tracking-[-0.04em] text-ink ${sizing} ${className}`}
    >
      {formatEuro(amount)}
      <small
        className={`block font-normal tracking-normal text-muted ${
          size === 'compact' ? 'text-[10px] mobile:text-[10px]' : 'text-[10px]'
        }`}
      >
        TVAC, robot seul
      </small>
    </div>
  );
}

/** « + installation : 200 € » (placement compris). */
export function InstallationPrice({
  amount,
  className = '',
}: {
  amount: number;
  className?: string;
}) {
  return <p className={className}>+ installation : {formatEuro(amount)}</p>;
}
