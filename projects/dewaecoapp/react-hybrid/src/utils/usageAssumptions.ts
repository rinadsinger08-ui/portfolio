import { ProductCategory } from '../types';

export const USAGE_ASSUMPTIONS: Record<
  ProductCategory,
  { label: string; cyclesPerMonth: number; description: string }
> = {
  showerheads: { label: '8 min shower × 1 shower/day', cyclesPerMonth: 8 * 30, description: 'Assumes one 8-minute shower per person per day.' },
  faucets: { label: '10 min/day average use', cyclesPerMonth: 10 * 30, description: 'Assumes 10 minutes of tap use per day across the home.' },
  toilets: { label: '5 flushes/day', cyclesPerMonth: 5 * 30, description: 'Assumes 5 flushes per day per household.' },
  washing_machines: { label: '20 cycles/month', cyclesPerMonth: 20, description: 'Assumes 20 wash cycles per month.' },
  dishwashers: { label: '30 cycles/month', cyclesPerMonth: 30, description: 'Assumes 30 wash cycles per month.' },
};

// Illustration ONLY. October 2026 DEWA entry tier = AED 7.70/m³ + AED 1.10/m³ fuel surcharge,
// before 5% VAT, fixed meter charges, other bill items, and tier-dependent changes.
// Actual marginal rates vary by billing period and total household consumption.
export const WATER_COST_PER_LITRE = 0.0088;
