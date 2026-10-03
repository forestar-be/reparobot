import { describe, expect, it } from 'vitest';
import { formatEuro, formatNumber, formatSurface } from './format';

const nb = (s: string) => s.replaceAll(String.fromCharCode(160), '~');

describe('formatEuro', () => {
  it('suit la maquette : pas de séparateur à quatre chiffres', () => {
    expect(nb(formatEuro(1399))).toBe('1399~€');
    expect(nb(formatEuro(649))).toBe('649~€');
    expect(nb(formatEuro(0))).toBe('0~€');
  });
  it('garde deux décimales quand il y en a', () => {
    expect(nb(formatEuro(199.99))).toBe('199,99~€');
    expect(nb(formatEuro(1.3))).toBe('1,30~€');
  });
  it('groupe à partir de cinq chiffres', () => {
    expect(nb(formatEuro(12000))).toBe('12~000~€');
  });
});

describe('formatSurface / formatNumber', () => {
  it('formate les surfaces', () => {
    expect(nb(formatSurface(4800))).toBe('4800~m²');
    expect(nb(formatSurface(12000))).toBe('12~000~m²');
    expect(formatNumber(400)).toBe('400');
  });
});
