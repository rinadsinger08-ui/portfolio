import { ProductSpec, ProductCategory } from '../types';

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  showerheads: 'Showerheads',
  faucets: 'Faucets & Aerators',
  toilets: 'Toilets',
  washing_machines: 'Washing Machines',
  dishwashers: 'Dishwashers',
};

export const CATEGORY_DESCRIPTIONS: Record<ProductCategory, string> = {
  showerheads: 'Low-flow and water-efficient showerheads',
  faucets: 'Water-saving faucet aerators and taps',
  toilets: 'Dual-flush and low-volume toilets',
  washing_machines: 'Water-efficient front and top load washers',
  dishwashers: 'Low water consumption dishwashers',
};

const amazonSearch = (query: string) => `https://www.amazon.ae/s?k=${encodeURIComponent(query)}`;
const carrefourSearch = (query: string) => `https://www.carrefouruae.com/ma-en/search?q=${encodeURIComponent(query)}`;

export const DEMO_CATALOG: ProductSpec[] = [
  { name: 'EcoFlow Rain Shower Head', brand: 'EcoFlow', category: 'showerheads', flowRate: 6.0, unit: 'L/min', price: 89, specSource: 'Illustrative example — no manufacturer verification', retailerSearchUrl: amazonSearch('EcoFlow low flow shower head 6 L/min'), description: 'Air-infused technology for full spray at low flow.' },
  { name: 'AquaSave Hand Shower', brand: 'AquaSave', category: 'showerheads', flowRate: 7.5, unit: 'L/min', price: 64, specSource: 'Illustrative example — no manufacturer verification', retailerSearchUrl: carrefourSearch('AquaSave water saving hand shower'), description: 'Three spray modes with an eco-pause button.' },
  { name: 'Standard Chrome Shower Head', brand: 'HomeBasics', category: 'showerheads', flowRate: 12.0, unit: 'L/min', price: 39, specSource: 'Typical non-rated showerhead (reference baseline)', retailerSearchUrl: amazonSearch('chrome shower head standard'), description: 'Conventional showerhead shown as a comparison baseline.' },
  { name: 'TapMaster Aerator Kit', brand: 'TapMaster', category: 'faucets', flowRate: 4.0, unit: 'L/min', price: 25, specSource: 'Illustrative example — no manufacturer verification', retailerSearchUrl: amazonSearch('TapMaster faucet aerator 4 L/min'), description: 'Screw-in aerator that cuts flow without reducing spray.' },
  { name: 'EcoTap Low-Flow Faucet', brand: 'EcoTap', category: 'faucets', flowRate: 5.5, unit: 'L/min', price: 110, specSource: 'Illustrative example — no manufacturer verification', retailerSearchUrl: carrefourSearch('EcoTap low flow faucet'), description: 'Sensor-activated kitchen faucet with eco mode.' },
  { name: 'Standard Mixer Tap', brand: 'HomeBasics', category: 'faucets', flowRate: 8.0, unit: 'L/min', price: 70, specSource: 'Typical non-rated mixer tap (reference baseline)', retailerSearchUrl: amazonSearch('standard mixer tap bathroom'), description: 'Conventional mixer tap shown as a comparison baseline.' },
  { name: 'DualFlush Pro Toilet', brand: 'DualFlush', category: 'toilets', flowRate: 4.5, unit: 'L/flush', price: 950, specSource: 'Illustrative example — no manufacturer verification', retailerSearchUrl: amazonSearch('DualFlush pro toilet 4.5 L flush'), description: '3L / 4.5L dual-flush cistern.' },
  { name: 'EcoSan Low-Volume Toilet', brand: 'EcoSan', category: 'toilets', flowRate: 6.0, unit: 'L/flush', price: 680, specSource: 'Illustrative example — no manufacturer verification', retailerSearchUrl: carrefourSearch('EcoSan low volume toilet'), description: 'Single-flush 6L cistern with rimless design.' },
  { name: 'Standard Toilet Suite', brand: 'HomeBasics', category: 'toilets', flowRate: 9.0, unit: 'L/flush', price: 420, specSource: 'Typical older toilet (reference baseline)', retailerSearchUrl: amazonSearch('standard toilet suite'), description: 'Conventional 9L flush shown as a comparison baseline.' },
  { name: 'WashEco Front Loader 8kg', brand: 'WashEco', category: 'washing_machines', flowRate: 45, unit: 'L/cycle', price: 1850, specSource: 'Illustrative example — no independently verified label', retailerSearchUrl: amazonSearch('WashEco front loader 8kg water efficient'), description: 'A+++ rated, 45L per full cotton cycle.' },
  { name: 'CleanWater Top Loader 7kg', brand: 'CleanWater', category: 'washing_machines', flowRate: 70, unit: 'L/cycle', price: 1290, specSource: 'Illustrative example — no independently verified label', retailerSearchUrl: carrefourSearch('CleanWater top loader 7kg'), description: 'A+ rated top loader with eco cycle option.' },
  { name: 'Standard Washer 7kg', brand: 'HomeBasics', category: 'washing_machines', flowRate: 95, unit: 'L/cycle', price: 950, specSource: 'Typical older washer (reference baseline)', retailerSearchUrl: amazonSearch('standard washing machine 7kg'), description: 'Conventional washer shown as a comparison baseline.' },
  { name: 'DishEco Built-in Dishwasher', brand: 'DishEco', category: 'dishwashers', flowRate: 9.5, unit: 'L/cycle', price: 1490, specSource: 'Illustrative example — no independently verified label', retailerSearchUrl: amazonSearch('DishEco dishwasher 9.5 L cycle'), description: '14 place settings, eco cycle uses 9.5L.' },
  { name: 'SparkleWash Freestanding Dishwasher', brand: 'SparkleWash', category: 'dishwashers', flowRate: 12.0, unit: 'L/cycle', price: 1090, specSource: 'Illustrative example — no independently verified label', retailerSearchUrl: carrefourSearch('SparkleWash freestanding dishwasher'), description: '12 place settings with half-load option.' },
  { name: 'Standard Dishwasher', brand: 'HomeBasics', category: 'dishwashers', flowRate: 18.0, unit: 'L/cycle', price: 750, specSource: 'Typical older dishwasher (reference baseline)', retailerSearchUrl: amazonSearch('standard dishwasher'), description: 'Conventional dishwasher shown as a comparison baseline.' },
];

export function searchDemoCatalog(query: string, category: ProductCategory | 'all'): ProductSpec[] {
  const q = query.trim().toLowerCase();
  return DEMO_CATALOG.filter((p) => {
    const matchesCategory = category === 'all' || p.category === category;
    if (!matchesCategory) return false;
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || CATEGORY_LABELS[p.category].toLowerCase().includes(q);
  });
}

export function buildRetailerSearchUrl(query: string): string {
  return amazonSearch(query);
}
