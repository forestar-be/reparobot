import { describe, expect, it } from 'vitest';
import {
  catalogueHref,
  countLabel,
  DISCONTINUED_NOTICE,
  filterRobots,
  isDiscontinued,
  metaDescription,
  offerAvailability,
  parseCatalogueFilters,
  robotShortName,
  splitDescription,
  typeOfRobot,
} from './catalogue';
import type { Robot } from './robots';

const robot = (slug: string, category: string, maxSurface: number): Robot => ({
  id: slug,
  slug,
  isFeatured: false,
  name: slug,
  category,
  description: '',
  image: '',
  maxSurface,
  maxSlope: 40,
  price: 1000,
  installationPrice: 200,
  inventoryId: 1,
});

const ROBOTS = [
  robot('a', 'wired', 400),
  robot('b', 'wired', 1500),
  robot('c', 'wireless', 800),
  robot('d', 'wireless', 4800),
];

describe('parseCatalogueFilters', () => {
  it('lit le type et la surface de l’URL', () => {
    expect(
      parseCatalogueFilters({ type: 'sans-fil', surface: '1500' }),
    ).toEqual({ type: 'sans-fil', surface: 1500 });
  });
  it('ignore les valeurs inconnues ou absurdes', () => {
    expect(parseCatalogueFilters({ type: 'wired', surface: 'abc' })).toEqual({
      type: null,
      surface: null,
    });
    expect(parseCatalogueFilters({ surface: '-5' }).surface).toBeNull();
    expect(parseCatalogueFilters({ surface: '1e9' }).surface).toBeNull();
    expect(parseCatalogueFilters({ surface: '12.5' }).surface).toBeNull();
    expect(parseCatalogueFilters({})).toEqual({ type: null, surface: null });
  });
  it('prend la première valeur d’un paramètre répété', () => {
    expect(parseCatalogueFilters({ type: ['filaire', 'sans-fil'] }).type).toBe(
      'filaire',
    );
  });
});

describe('filterRobots', () => {
  it('filtre par type', () => {
    expect(
      filterRobots(ROBOTS, { type: 'filaire', surface: null }).map(
        (r) => r.slug,
      ),
    ).toEqual(['a', 'b']);
  });
  it('filtre par surface : la capacité couvre le jardin', () => {
    expect(
      filterRobots(ROBOTS, { type: null, surface: 1500 }).map((r) => r.slug),
    ).toEqual(['b', 'd']);
    expect(
      filterRobots(ROBOTS, { type: null, surface: 800 }).map((r) => r.slug),
    ).toEqual(['b', 'c', 'd']);
  });
  it('combine les deux filtres sans réordonner', () => {
    expect(
      filterRobots(ROBOTS, { type: 'sans-fil', surface: 1500 }).map(
        (r) => r.slug,
      ),
    ).toEqual(['d']);
  });
  it('ne filtre rien sans filtre', () => {
    expect(filterRobots(ROBOTS, { type: null, surface: null })).toHaveLength(4);
  });
});

describe('petits formats', () => {
  it('robotShortName retire le surtitre', () => {
    expect(robotShortName('Husqvarna Automower® 430V NERA')).toBe('430V NERA');
    expect(robotShortName('Husqvarna Automower® Aspire™ R4')).toBe(
      'Aspire™ R4',
    );
    expect(robotShortName('Autre robot')).toBe('Autre robot');
  });
  it('typeOfRobot', () => {
    expect(typeOfRobot(robot('x', 'wired', 1))).toBe('filaire');
    expect(typeOfRobot(robot('x', 'wireless', 1))).toBe('sans-fil');
  });
  it('catalogueHref', () => {
    expect(catalogueHref({ type: null, surface: null })).toBe('/robots');
    expect(catalogueHref({ type: 'sans-fil', surface: 1500 })).toBe(
      '/robots?type=sans-fil&surface=1500',
    );
  });
  it('countLabel', () => {
    expect(countLabel(16, 16)).toBe('16 modèles présentés');
    expect(countLabel(1, 16)).toBe('1 modèle sur 16');
    expect(countLabel(1, 1)).toBe('1 modèle présenté');
    expect(countLabel(0, 16)).toBe('0 modèle sur 16');
  });
});

describe('splitDescription / metaDescription', () => {
  it('sépare l’accroche et le détail', () => {
    expect(splitDescription('Accroche\nDétail un\nDétail deux')).toEqual({
      lead: 'Accroche',
      body: 'Détail un\nDétail deux',
    });
    expect(splitDescription('Seule')).toEqual({ lead: 'Seule', body: '' });
    expect(splitDescription(null)).toEqual({ lead: '', body: '' });
  });
  it('metaDescription tient dans la limite sans couper un mot', () => {
    const d = metaDescription('Robot tondeuse.', 'x '.repeat(200), 100);
    expect(d.length).toBeLessThanOrEqual(100);
    expect(d.endsWith('…')).toBe(true);
    expect(metaDescription('Court', 'suite.')).toBe('Court. suite.');
  });
});

describe('modèle abandonné', () => {
  it('ne l’est que si l’API le dit (une ancienne API ne le dit pas)', () => {
    expect(isDiscontinued({ isDiscontinued: true })).toBe(true);
    expect(isDiscontinued({ isDiscontinued: false })).toBe(false);
    expect(isDiscontinued({})).toBe(false);
  });

  it('publie la disponibilité schema.org Discontinued, jamais un stock', () => {
    expect(offerAvailability({ isDiscontinued: true })).toBe(
      'https://schema.org/Discontinued',
    );
    expect(offerAvailability({ isDiscontinued: false })).toBeUndefined();
    expect(offerAvailability({})).toBeUndefined();
  });

  it('la phrase de la fiche ne parle pas de stock', () => {
    expect(DISCONTINUED_NOTICE).toMatch(/ne fabrique plus/);
    expect(DISCONTINUED_NOTICE).not.toMatch(/stock|reste|épuis/i);
  });
});
