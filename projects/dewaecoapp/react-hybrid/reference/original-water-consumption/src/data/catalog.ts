import { CatalogProduct, CategoryInfo, ProductCategory } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'showerheads',
    label: 'Showerheads',
    defaultMinutesPerDay: 10,
    description: 'Compare water-efficient showerheads by flow rate and long-term cost.',
  },
  {
    id: 'faucets',
    label: 'Faucets & Aerators',
    defaultMinutesPerDay: 8,
    description: 'Kitchen and bathroom faucets with low-flow aerator options.',
  },
  {
    id: 'washing-machines',
    label: 'Washing Machines',
    defaultMinutesPerDay: 3,
    description: 'Front-load and top-load washers compared by water factor.',
  },
  {
    id: 'dishwashers',
    label: 'Dishwashers',
    defaultMinutesPerDay: 2,
    description: 'Energy Star dishwashers with low gallons-per-cycle ratings.',
  },
  {
    id: 'toilets',
    label: 'Toilets',
    defaultMinutesPerDay: 5,
    description: 'High-efficiency toilets and dual-flush models.',
  },
];

export const CATEGORY_MAP: Record<ProductCategory, CategoryInfo> = CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.id]: c }),
  {} as Record<ProductCategory, CategoryInfo>
);

export const CATEGORY_LABELS: Record<ProductCategory, string> = CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.id]: c.label }),
  {} as Record<ProductCategory, string>
);

export const DEMO_CATALOG: CatalogProduct[] = [
  // ── Showerheads ──────────────────────────────────────────────
  {
    id: 'sh-h2omecho',
    name: 'H2Okinetic Echo Shower Head',
    brand: 'Delta Faucet',
    category: 'showerheads',
    price: 49.99,
    flowRate: 1.75,
    flowRateStatus: 'verified',
    source: 'EPA WaterSense Labeled Products',
    sourceUrl: 'https://www.epa.gov/watersense/showerheads',
    description: 'WaterSense-labeled 1.75 GPM showerhead with H2Okinetic spray technology.',
  },
  {
    id: 'sh-aeromax',
    name: 'AeroMax Low-Flow Shower Head',
    brand: 'High Sierra',
    category: 'showerheads',
    price: 24.95,
    flowRate: 1.5,
    flowRateStatus: 'verified',
    source: 'EPA WaterSense Labeled Products',
    sourceUrl: 'https://www.epa.gov/watersense/showerheads',
    description: '1.5 GPM all-metal low-flow showerhead with solid brass construction.',
  },
  {
    id: 'sh-rainspa',
    name: 'RainSpa Deluxe Rain Shower',
    brand: 'Moen',
    category: 'showerheads',
    price: 89.99,
    flowRate: 2.0,
    flowRateStatus: 'manufacturer',
    source: 'Manufacturer product specification sheet',
    sourceUrl: 'https://www.moen.com',
    description: '8-inch rainshower with 2.0 GPM flow rate and immersion self-pressurizing technology.',
  },
  {
    id: 'sh-ecostream',
    name: 'EcoStream Adjustable Handheld',
    brand: 'Waterpik',
    category: 'showerheads',
    price: 29.99,
    flowRate: 1.6,
    flowRateStatus: 'verified',
    source: 'EPA WaterSense Labeled Products',
    sourceUrl: 'https://www.epa.gov/watersense/showerheads',
    description: 'WaterSense-labeled handheld with 1.6 GPM and 5 spray settings.',
  },
  {
    id: 'sh-standard20',
    name: 'Standard 2.0 GPM Shower Head',
    brand: 'Generic',
    category: 'showerheads',
    price: 12.99,
    flowRate: 2.5,
    flowRateStatus: 'estimated',
    source: 'U.S. federal maximum flow rate standard (legacy)',
    sourceUrl: 'https://www.epa.gov/watersense/showerheads',
    description: 'Basic 2.5 GPM showerhead. Included as a baseline for comparison.',
  },

  // ── Faucets & Aerators ───────────────────────────────────────
  {
    id: 'fa-laminar',
    name: 'Laminar Low-Flow Bathroom Faucet',
    brand: 'Delta Faucet',
    category: 'faucets',
    price: 39.99,
    flowRate: 1.0,
    flowRateStatus: 'verified',
    source: 'EPA WaterSense Labeled Products',
    sourceUrl: 'https://www.epa.gov/watersense/bathroom-faucets',
    description: 'WaterSense-labeled 1.0 GPM bathroom faucet with laminar flow.',
  },
  {
    id: 'fa-aerator-pack',
    name: 'Standard Faucet Aerator Pack (1.5 GPM)',
    brand: 'Niagara Conservation',
    category: 'faucets',
    price: 8.99,
    flowRate: 1.5,
    flowRateStatus: 'verified',
    source: 'EPA WaterSense Labeled Products',
    sourceUrl: 'https://www.epa.gov/watersense/bathroom-faucets',
    description: 'Pack of 3 screw-in aerators that reduce any faucet to 1.5 GPM.',
  },
  {
    id: 'fa-kitchen-pro',
    name: 'Pro Kitchen Pull-Down Faucet',
    brand: 'Kohler',
    category: 'faucets',
    price: 119.99,
    flowRate: 1.8,
    flowRateStatus: 'manufacturer',
    source: 'Manufacturer product specification sheet',
    sourceUrl: 'https://www.kohler.com',
    description: 'Pull-down kitchen faucet with 1.8 GPM and 3-function sprayhead.',
  },

  // ── Washing Machines ─────────────────────────────────────────
  {
    id: 'wm-frontload-x',
    name: 'Front-Load Washer XE (4.5 cu ft)',
    brand: 'LG',
    category: 'washing-machines',
    price: 649.0,
    flowRate: 13.0,
    flowRateStatus: 'verified',
    source: 'ENERGY STAR Certified Appliances',
    sourceUrl: 'https://www.energystar.gov/productfinder/product/certified-clothes-washers',
    description: 'ENERGY STAR front-load washer with integrated water factor (IWF) of 3.2 (≈13 GPM equivalent).',
  },
  {
    id: 'wm-topload-eco',
    name: 'Top-Load High-Efficiency Washer',
    brand: 'Whirlpool',
    category: 'washing-machines',
    price: 549.0,
    flowRate: 15.0,
    flowRateStatus: 'verified',
    source: 'ENERGY STAR Certified Appliances',
    sourceUrl: 'https://www.energystar.gov/productfinder/product/certified-clothes-washers',
    description: 'ENERGY STAR top-load HE washer with IWF of 3.7 (≈15 GPM equivalent).',
  },
  {
    id: 'wm-compact-eu',
    name: 'Compact Front-Load Washer (2.2 cu ft)',
    brand: 'Bosch',
    category: 'washing-machines',
    price: 799.0,
    flowRate: 9.0,
    flowRateStatus: 'manufacturer',
    source: 'Manufacturer product specification sheet',
    sourceUrl: 'https://www.bosch-home.com',
    description: 'European compact front-load washer with very low water consumption.',
  },

  // ── Dishwashers ──────────────────────────────────────────────
  {
    id: 'dw-quietguard',
    name: 'QuietGuard Tall-Tub Dishwasher',
    brand: 'KitchenAid',
    category: 'dishwashers',
    price: 599.0,
    flowRate: 3.5,
    flowRateStatus: 'verified',
    source: 'ENERGY STAR Certified Dishwashers',
    sourceUrl: 'https://www.energystar.gov/productfinder/product/certified-dishwashers',
    description: 'ENERGY STAR dishwasher using ~3.5 gallons per cycle.',
  },
  {
    id: 'dw-compact-countertop',
    name: 'Compact Countertop Dishwasher',
    brand: 'Danby',
    category: 'dishwashers',
    price: 249.0,
    flowRate: 2.8,
    flowRateStatus: 'manufacturer',
    source: 'Manufacturer product specification sheet',
    sourceUrl: 'https://www.danby.com',
    description: 'Countertop dishwasher using ~2.8 gallons per cycle. Ideal for small households.',
  },
  {
    id: 'dw-standard',
    name: 'Standard Built-In Dishwasher',
    brand: 'GE',
    category: 'dishwashers',
    price: 399.0,
    flowRate: 4.0,
    flowRateStatus: 'verified',
    source: 'ENERGY STAR Certified Dishwashers',
    sourceUrl: 'https://www.energystar.gov/productfinder/product/certified-dishwashers',
    description: 'Standard ENERGY STAR dishwasher using ~4.0 gallons per cycle.',
  },

  // ── Toilets ──────────────────────────────────────────────────
  {
    id: 'to-dualflush',
    name: 'Dual-Flush High-Efficiency Toilet',
    brand: 'Toto',
    category: 'toilets',
    price: 279.0,
    flowRate: 1.28,
    flowRateStatus: 'verified',
    source: 'EPA WaterSense Labeled Toilets',
    sourceUrl: 'https://www.epa.gov/watersense/toilets',
    description: 'WaterSense-labeled dual-flush toilet with 1.28 GPF (gallons per flush) average.',
  },
  {
    id: 'to-singleflush',
    name: 'Single-Flush HET Toilet',
    brand: 'American Standard',
    category: 'toilets',
    price: 199.0,
    flowRate: 1.28,
    flowRateStatus: 'verified',
    source: 'EPA WaterSense Labeled Toilets',
    sourceUrl: 'https://www.epa.gov/watersense/toilets',
    description: 'WaterSense-labeled single-flush toilet with 1.28 GPF.',
  },
  {
    id: 'to-legacy',
    name: 'Standard Gravity Toilet (3.5 GPF)',
    brand: 'Generic',
    category: 'toilets',
    price: 89.0,
    flowRate: 3.5,
    flowRateStatus: 'estimated',
    source: 'U.S. federal standard (pre-1994 legacy)',
    sourceUrl: 'https://www.epa.gov/watersense/toilets',
    description: 'Older 3.5 GPF toilet. Included as a baseline to show potential savings.',
  },
];

export function getProductsByCategory(category: ProductCategory): CatalogProduct[] {
  return DEMO_CATALOG.filter((p) => p.category === category);
}

export function buildRetailerSearchUrl(retailer: 'amazon' | 'carrefour', query: string): string {
  const encoded = encodeURIComponent(query);
  if (retailer === 'amazon') {
    return `https://www.amazon.ae/s?k=${encoded}`;
  }
  return `https://www.carrefouruae.com/mafuae/en/search?q=${encoded}`;
}
