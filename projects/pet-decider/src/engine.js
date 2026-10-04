import { PETS } from './pets.js';

export const SPACE_LEVELS = Object.freeze({ small: 1, medium: 2, large: 3 });
export const PROFILE_KEYS = Object.freeze(['space', 'minutes', 'monthly', 'setup', 'housing', 'allergies', 'activity', 'experience', 'backup']);
const CHOICES = {
  space: ['small', 'medium', 'large'], housing: ['yes', 'no'],
  allergies: ['yes', 'no'], activity: ['calm', 'moderate', 'active'],
  experience: ['first', 'experienced'], backup: ['yes', 'no']
};
const NUMBERS = { minutes: [0, 720, 'daily care time'], monthly: [0, 10000, 'monthly budget'], setup: [0, 20000, 'setup budget'] };

/** Reject blanks, non-decimal syntax, non-finite numbers, and out-of-range inputs. */
export function validateProfile(input) {
  const profile = {};
  const errors = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, profile: null, errors: { form: 'Please complete the lifestyle form.' } };
  }
  for (const [key, choices] of Object.entries(CHOICES)) {
    if (!choices.includes(input[key])) errors[key] = 'Please choose one of the listed options.';
    else profile[key] = input[key];
  }
  for (const [key, [min, max, label]] of Object.entries(NUMBERS)) {
    const raw = input[key];
    const text = typeof raw === 'string' ? raw.trim() : '';
    const validType = typeof raw === 'number' || (typeof raw === 'string' && /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(text));
    const value = validType ? Number(typeof raw === 'string' ? text : raw) : NaN;
    if (!Number.isFinite(value) || value < min || value > max) {
      errors[key] = `Enter a number from ${min} to ${max.toLocaleString('en-CA')} for ${label}.`;
    } else profile[key] = Object.is(value, -0) ? 0 : value;
  }
  return { ok: Object.keys(errors).length === 0, profile: Object.keys(errors).length ? null : profile, errors };
}

/** Canonical key uses validated fields only; whitespace and key order do not matter. */
export function profileKey(input) {
  const validation = validateProfile(input);
  if (!validation.ok) return null;
  return JSON.stringify(PROFILE_KEYS.map(key => validation.profile[key]));
}

/** Filter hard constraints first, then rank preferences. No forced fallback match. */
export function recommend(input) {
  const validation = validateProfile(input);
  if (!validation.ok) return { ...validation, matches: [], excluded: [] };
  const profile = validation.profile;
  const matches = [];
  const excluded = [];
  for (const pet of PETS) {
    const blockers = [];
    if (profile.housing === 'no') blockers.push('Pet permission is not confirmed.');
    if (profile.backup === 'no') blockers.push('Arrange backup care for absences first.');
    if (profile.allergies === 'yes' && pet.family === 'mammal') blockers.push('Excluded because you asked to avoid furry animals.');
    if (SPACE_LEVELS[profile.space] < pet.space) blockers.push('Needs more dedicated space in this model.');
    if (profile.minutes < pet.minutes) blockers.push(`The model allows at least ${pet.minutes} minutes of daily care.`);
    if (profile.monthly < pet.monthly) blockers.push(`The model sets aside at least CAD ${pet.monthly}/month.`);
    if (profile.setup < pet.setup) blockers.push(`The model sets aside at least CAD ${pet.setup} for setup.`);
    if (blockers.length) { excluded.push({ pet, blockers }); continue; }
    let score = 0;
    const reasons = ['Meets your space, time, and budget inputs in this model.'];
    if (profile.activity === pet.activity) { score += 2; reasons.push('Matches your preferred activity level.'); }
    if (profile.experience === 'experienced' || pet.experience === 'first') {
      score += 1;
      reasons.push(profile.experience === 'experienced' ? 'You have prior pet-care experience.' : 'Included for first-time owners in this model.');
    }
    matches.push({ pet, score, reasons });
  }
  // Alphabetical tie-break makes results stable across submissions and platforms.
  matches.sort((a, b) => b.score - a.score || a.pet.id.localeCompare(b.pet.id, 'en'));
  return { ...validation, matches, excluded };
}
