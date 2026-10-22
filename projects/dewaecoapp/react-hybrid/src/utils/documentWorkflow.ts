import { parsePurchaseReceipt, parseUtilityBill, type BillExtraction, type ReceiptExtraction } from './documentParsing';

export type EvidenceType = 'bill' | 'receipt';
export type EvidenceStatus = 'pending_review';
export interface EvidenceRecord {
  id: string;
  fingerprint: string;
  kind: EvidenceType;
  createdAt: string;
  status: EvidenceStatus;
  note: string;
  bill?: { month: number; year: number; accountId: string; waterLitres: number; energyKwh: number; waterCostAed: number; energyCostAed: number };
  receipt?: { merchant: string; totalAed: number; receiptNumber: string; purchasedProduct: string };
}
export const EVIDENCE_KEY = 'dewaecov2_evidence';
export function readEvidence(): EvidenceRecord[] {
  try {
    const records: unknown = JSON.parse(localStorage.getItem(EVIDENCE_KEY) || '[]');
    if (!Array.isArray(records)) return [];
    return records.filter((r): r is EvidenceRecord => !!r && typeof r === 'object' && r.status === 'pending_review' && typeof r.id === 'string' && typeof r.fingerprint === 'string' && (r.kind === 'bill' || r.kind === 'receipt'));
  } catch { return []; }
}
export function saveEvidence(items: EvidenceRecord[]): void { localStorage.setItem(EVIDENCE_KEY, JSON.stringify(items)); }
export function ensureUniqueEvidence(existing: EvidenceRecord[], fingerprint: string): void {
  if (existing.some(e => e.fingerprint === fingerprint)) throw new Error('This exact image has already been submitted on this device.');
}
export async function fingerprintFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map(v => v.toString(16).padStart(2,'0')).join('');
}
export async function recognizeImage(file: File, onProgress?: (p: string) => void): Promise<string> {
  if (!['image/png','image/jpeg','image/webp','image/bmp'].includes(file.type)) throw new Error('Please use a JPG, PNG, WEBP or BMP photo. PDF scanning is not supported in this version.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Image must be smaller than 10 MB.');
  onProgress?.('Loading English OCR model…');
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng');
  try {
    onProgress?.('Reading document image…');
    const result = await worker.recognize(file);
    return result.data.text || '';
  } finally { await worker.terminate(); }
}
export function interpretDocument(kind: EvidenceType, text: string): BillExtraction | ReceiptExtraction {
  return kind === 'bill' ? parseUtilityBill(text) : parsePurchaseReceipt(text);
}
