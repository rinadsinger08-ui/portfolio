/**
 * Heuristic OCR interpretation. Never treat extracted values as verified.
 * All bill water quantities are normalized to litres for consistent comparisons.
 */
export type WaterUnit = 'm3' | 'L' | 'IG' | 'USgal';
export const LITRES_PER_IMPERIAL_GALLON = 4.54609;
export const LITRES_PER_US_GALLON = 3.785411784;

export function waterToLitres(value: number, unit: WaterUnit): number {
  if (!Number.isFinite(value) || value < 0) throw new Error('Invalid water quantity');
  if (unit === 'm3') return value * 1000;
  if (unit === 'IG') return value * LITRES_PER_IMPERIAL_GALLON;
  if (unit === 'USgal') return value * LITRES_PER_US_GALLON;
  return value;
}
export function litresToCubicMetres(litres: number): number { return litres / 1000; }

function numberFromText(value: string | undefined): number | undefined {
  if (!value) return undefined;
  // OCR often uses commas as thousands separators. Values with only a single comma and no period
  // can also be decimals (e.g., 17,4); treat a single comma followed by 1 or 2 digits as decimal.
  let clean = value.replace(/\s/g, '');
  if (/^\d+,\d{1,2}$/.test(clean)) clean = clean.replace(',', '.');
  else clean = clean.replace(/,/g, '');
  const n = Number(clean);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}
function captureAfterLabel(lines: string[], label: RegExp): { value: number; line: string } | undefined {
  for (const line of lines) {
    const m = label.exec(line);
    if (!m) continue;
    const suffix = line.slice(m.index + m[0].length)
      .replace(/^\s*\((?:m³|m3|cubic\s*met(?:er|re)s?|L|lit(?:er|re)s?|IG|imperial\s*gallons?|kWh)\)\s*/i, '')
      .replace(/^\s*[:=\-–]?\s*/, '');
    const n = suffix.match(/(?:AED\s*)?(\d[\d,]*(?:\.\d+)?)/i);
    const value = numberFromText(n?.[1]);
    if (value !== undefined) return { value, line };
  }
  return undefined;
}
function inferWaterUnit(text: string): WaterUnit | undefined {
  if (/\b(?:m³|m3|cubic\s*met(?:er|re)s?)\b/i.test(text) || /m³/i.test(text)) return 'm3';
  if (/\b(?:litres?|liters?)\b/i.test(text)) return 'L';
  if (/\b(?:imperial\s*gallons?|IG)\b/i.test(text)) return 'IG';
  if (/\b(?:US\s*gallons?)\b/i.test(text)) return 'USgal';
  return undefined;
}
function extractMonthYear(text: string): { month?: number; year?: number } {
  const months = 'january february march april may june july august september october november december'.split(' ');
  const match = text.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})\b/i);
  if (match) return { month: months.indexOf(match[1].toLowerCase()), year: Number(match[2]) };
  // Do not automatically infer a billing period from an arbitrary number/date appearing on a document.
  return {};
}
export interface BillExtraction {
  waterUsageLitres?: number;
  waterOriginalValue?: number;
  waterUnit?: WaterUnit;
  energyUsageKwh?: number;
  waterCostAed?: number;
  energyCostAed?: number;
  month?: number;
  year?: number;
  warnings: string[];
}
export function parseUtilityBill(text: string): BillExtraction {
  const lines = text.split(/\r?\n/).map(v => v.trim()).filter(Boolean);
  const water = captureAfterLabel(lines, /(?:water|H2O)\s*(?:consumption|usage|units\s*consumed)/i);
  const energy = captureAfterLabel(lines, /(?:electricity|electrical|energy|power)\s*(?:consumption|usage|units\s*consumed)/i);
  const waterCharge = captureAfterLabel(lines, /(?:water\s*(?:charge|charges|cost|amount)|charge\s*for\s*water)/i);
  const energyCharge = captureAfterLabel(lines, /(?:(?:electricity|energy)\s*(?:charge|charges|cost|amount)|charge\s*for\s*electricity)/i);
  const waterUnit = water ? inferWaterUnit(water.line) ?? inferWaterUnit(text) : undefined;
  const period = extractMonthYear(text);
  const warnings: string[] = [];
  if (water && !waterUnit) warnings.push('Water unit not recognized; select it manually before saving.');
  if (!water) warnings.push('Water usage not confidently found.');
  if (!energy) warnings.push('Electricity usage not confidently found.');
  if (period.month === undefined || period.year === undefined) warnings.push('Billing month not confidently found.');
  return {
    waterOriginalValue: water?.value,
    waterUnit,
    waterUsageLitres: water && waterUnit ? waterToLitres(water.value, waterUnit) : undefined,
    energyUsageKwh: energy?.value,
    waterCostAed: waterCharge?.value,
    energyCostAed: energyCharge?.value,
    ...period,
    warnings,
  };
}
export interface ReceiptExtraction {
  merchant?: string;
  amountAed?: number;
  receiptNumber?: string;
  warnings: string[];
}
export function parsePurchaseReceipt(text: string): ReceiptExtraction {
  const lines = text.split(/\r?\n/).map(v => v.trim()).filter(Boolean);
  // Total lines may contain VAT and subtotal; use the final amount labelled TOTAL / AMOUNT PAID.
  const totals = lines.filter(line => /(?:^|\b)(?:grand\s*total|total\s*(?:amount|paid)?|amount\s*paid)\s*[:=\-]?/i.test(line) && !/subtotal|tax total/i.test(line));
  let amountAed: number | undefined;
  for (let i=totals.length - 1; i>=0; i--) {
    const after = totals[i].replace(/^.*?(?:grand\s*total|total\s*(?:amount|paid)?|amount\s*paid)\s*[:=\-]?\s*/i, '');
    amountAed = numberFromText(after.match(/(?:AED\s*)?(\d[\d,]*(?:\.\d+)?)/i)?.[1]);
    if (amountAed !== undefined) break;
  }
  const id = text.match(/(?:receipt|invoice|transaction)\s*(?:no\.?|number|#|id)\s*[:#\-]?\s*([A-Za-z0-9\-/]{3,40})/i)?.[1];
  const merchant = lines.find(l => /[A-Za-z]{3,}/.test(l) && !/receipt|invoice|date|total|www\.|tax\b|AED\b/i.test(l))?.slice(0,100);
  const warnings: string[] = [];
  if (!id) warnings.push('No receipt number recognized; duplicates cannot be reliably identified.');
  if (amountAed === undefined) warnings.push('Total amount not recognized.');
  if (!merchant) warnings.push('Merchant not recognized.');
  return { merchant, amountAed, receiptNumber: id, warnings };
}
