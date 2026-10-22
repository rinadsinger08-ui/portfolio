import type { Bill } from '../types';

export interface ConceptAward {
  billId: string;
  period: string;
  waterSavedLitres: number;
  electricitySavedKwh: number;
  waterPoints: number;
  electricityPoints: number;
  total: number;
}

/** These 10-point thresholds are hypothetical design rules, never DEWA policy. */
export const CONCEPT_POINTS_PER_REDUCTION = 10;
const period = (b: Bill) => `${b.year}-${String(b.month + 1).padStart(2, '0')}`;
const previousPeriod = (b: Bill) => {
  const date = new Date(Date.UTC(b.year, b.month - 1, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2, '0')}`;
};

/** Only consecutive, photo-submitted records for the same entered account are eligible
 * for *hypothetical* points. This is not authenticity verification.
 */
export function calculateConceptAwards(bills: Bill[]): ConceptAward[] {
  const scanned = bills.filter(b => b.source === 'scan' && typeof b.accountId === 'string' && !!b.accountId.trim() &&
    Number.isInteger(b.month) && b.month >= 0 && b.month < 12 && Number.isInteger(b.year) &&
    Number.isFinite(b.waterUsage) && b.waterUsage >= 0 && Number.isFinite(b.energyUsage) && b.energyUsage >= 0);
  const lookup = new Map<string, Bill>();
  for (const b of scanned) {
    const key = `${b.accountId!.trim().toLowerCase()}|${period(b)}`;
    if (!lookup.has(key)) lookup.set(key, b);
  }
  const awards: ConceptAward[] = [];
  for (const b of scanned) {
    const prior = lookup.get(`${b.accountId!.trim().toLowerCase()}|${previousPeriod(b)}`);
    if (!prior) continue;
    const waterSavedLitres = Math.max(0, prior.waterUsage - b.waterUsage);
    const electricitySavedKwh = Math.max(0, prior.energyUsage - b.energyUsage);
    const waterPoints = waterSavedLitres > 0 ? CONCEPT_POINTS_PER_REDUCTION : 0;
    const electricityPoints = electricitySavedKwh > 0 ? CONCEPT_POINTS_PER_REDUCTION : 0;
    awards.push({ billId: b.id, period: period(b), waterSavedLitres, electricitySavedKwh,
      waterPoints, electricityPoints, total: waterPoints + electricityPoints });
  }
  return awards;
}
