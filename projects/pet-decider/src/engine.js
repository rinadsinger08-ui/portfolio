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

/** The original App Lab branches provide a directional preference, not automatic eligibility.
 * Budget is translated into broad bands because the web form uses CAD instead of Low/Medium/High.
 */
export function originalInspiredChoices(profile) {
  const band = profile.monthly >= 140 && profile.setup >= 450 ? 'high'
    : profile.monthly >= 75 && profile.setup >= 250 ? 'medium' : 'low';
  const short = profile.minutes <= 30;
  const long = profile.minutes > 90;
  if (profile.space === 'small') {
    if (short) return band === 'high' ? ['turtle'] : ['hamster','fish'];
    if (!long) return band === 'high' ? ['rabbits'] : band === 'medium' ? ['bird'] : ['hamster'];
    return ['cat','small-dog'];
  }
  if (profile.space === 'medium') {
    if (short) return band === 'low' ? ['hamster','fish'] : ['turtle'];
    if (!long) return band === 'low' ? ['rabbits','hamster'] : band === 'high' ? ['cat','bird'] : ['bird','cat'];
    return band === 'high' ? ['dog'] : band === 'medium' ? ['small-dog'] : ['cat'];
  }
  if (short) return band === 'low' ? ['fish','hamster'] : ['turtle'];
  if (!long) return band === 'low' ? ['rabbits','hamster'] : band === 'high' ? ['dog'] : ['cat','bird'];
  return band === 'high' ? ['dog'] : ['cat','small-dog'];
}

/** Rank research options with transparent tradeoffs instead of rejecting every profile
 * that falls below an illustrative numeric estimate. Hard pauses are reserved for
 * unavailable housing permission, zero care time, and zero total resources.
 * User-selected furry-animal avoidance is respected as a true exclusion.
 */
export function recommend(input) {
  const validation = validateProfile(input);
  if (!validation.ok) return { ...validation, matches: [], excluded: [] };
  const profile = validation.profile;
  const focus = originalInspiredChoices(profile);
  const ranked = [], excluded = [];
  for (const pet of PETS) {
    const blockers = [];
    if (profile.housing === 'no') blockers.push('Housing permission is not confirmed; check with your housing provider first.');
    if (profile.minutes === 0) blockers.push('No daily care time is available.');
    if (profile.monthly === 0 && profile.setup === 0) blockers.push('No monthly or setup resources are currently available.');
    if (profile.allergies === 'yes' && pet.family === 'mammal') blockers.push('You asked to avoid furry animals.');
    if (blockers.length) { excluded.push({pet, blockers}); continue; }

    const cautions = [];
    const reasons = [];
    const timeGap = Math.max(0, pet.minutes - profile.minutes) / pet.minutes;
    const monthlyGap = Math.max(0, pet.monthly - profile.monthly) / pet.monthly;
    const setupGap = Math.max(0, pet.setup - profile.setup) / pet.setup;
    const spaceGap = Math.max(0, pet.space - SPACE_LEVELS[profile.space]);
    if (timeGap > 0) cautions.push(`Model estimate is ${pet.minutes} min/day; you entered ${profile.minutes}.`);
    if (monthlyGap > 0) cautions.push(`Illustrative monthly budget is CAD ${pet.monthly}; you entered CAD ${profile.monthly}.`);
    if (setupGap > 0) cautions.push(`Illustrative setup budget is CAD ${pet.setup}; you entered CAD ${profile.setup}.`);
    if (spaceGap > 0) cautions.push('This model calls for more dedicated space.');
    if (profile.backup === 'no') cautions.push('Arrange reliable backup care before adopting.');
    if (pet.experience === 'experienced' && profile.experience === 'first') cautions.push('This category needs additional species-specific research for first-time owners.');
    let score = 25
      - 8 * Math.min(1, timeGap)
      - 7 * Math.min(1, monthlyGap)
      - 7 * Math.min(1, setupGap)
      - 5 * spaceGap;
    if (focus.includes(pet.id)) {score += 5; reasons.push('Similar to a recommendation path in the original Code.org Pet Decider.');}
    if (pet.activity === profile.activity) {score += 3; reasons.push('Aligns with your preferred activity level.');}
    if (pet.experience === 'first' || profile.experience === 'experienced') {score += 2; reasons.push('Fits the experience level you selected in this model.');}
    if (!timeGap && !monthlyGap && !setupGap && !spaceGap) reasons.push('Within this demo’s illustrative space, time and budget estimates.');
    if (!reasons.length) reasons.push('One possible category to research, with the planning gaps shown below.');
    ranked.push({pet, score: Math.round(score*100)/100, reasons, cautions});
  }
  ranked.sort((a,b)=>b.score-a.score || a.pet.id.localeCompare(b.pet.id,'en'));
  const matches = ranked.slice(0,4);
  for(const item of ranked.slice(4)) excluded.push({pet:item.pet, blockers:['Another option ranked more closely for this profile.']});
  return {...validation, matches, excluded};
}
