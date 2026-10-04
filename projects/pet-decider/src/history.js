import { profileKey, validateProfile } from './engine.js';

export const HISTORY_LIMIT = 10;
export const STORAGE_KEY = 'pet-decider.history.v1';

/** Saved data is untrusted: validate its shape, dates and profiles before reuse. */
export function cleanHistory(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const clean = [];
  for (const item of value) {
    if (!item || typeof item !== 'object' || typeof item.savedAt !== 'string') continue;
    const timestamp = Date.parse(item.savedAt);
    const validation = validateProfile(item.profile);
    if (!Number.isFinite(timestamp) || !validation.ok) continue;
    const key = profileKey(validation.profile);
    if (seen.has(key)) continue;
    seen.add(key);
    clean.push({ profile: validation.profile, savedAt: new Date(timestamp).toISOString() });
    if (clean.length === HISTORY_LIMIT) break;
  }
  return clean;
}

export function readHistory(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null) return { entries: [], warning: '' };
    const parsed = JSON.parse(raw);
    const entries = cleanHistory(parsed);
    const valid = Array.isArray(parsed) && parsed.length === entries.length && parsed.length <= HISTORY_LIMIT;
    return { entries, warning: valid ? '' : 'Some saved history was unreadable and has been skipped.' };
  } catch {
    return { entries: [], warning: 'Saved history is unavailable. You can still use the app.' };
  }
}

export function addHistory(entries, input, now = new Date()) {
  const validation = validateProfile(input);
  if (!validation.ok || !(now instanceof Date) || !Number.isFinite(now.getTime())) return cleanHistory(entries);
  const key = profileKey(validation.profile);
  const others = cleanHistory(entries).filter(item => profileKey(item.profile) !== key);
  return [{ profile: validation.profile, savedAt: now.toISOString() }, ...others].slice(0, HISTORY_LIMIT);
}

export function writeHistory(storage, entries) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(cleanHistory(entries)));
    return '';
  } catch {
    return 'History could not be saved on this device. It will remain available for this session.';
  }
}

export function clearHistory(storage) {
  try { storage.removeItem(STORAGE_KEY); return ''; }
  catch { return 'History was cleared for this session, but device storage could not be cleared.'; }
}
