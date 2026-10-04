import test from 'node:test';
import assert from 'node:assert/strict';
import { recommend, validateProfile, profileKey, SPACE_LEVELS } from '../src/engine.js';
import { PETS } from '../src/pets.js';
const base = { space: 'large', minutes: 180, monthly: 300, setup: 1000, housing: 'yes', allergies: 'no', activity: 'active', experience: 'experienced', backup: 'yes' };
test('valid profile returns all options with stable preference ranking', () => {
  const result = recommend(base);
  assert.equal(result.ok, true); assert.equal(result.matches.length, 4);
  assert.equal(result.matches[0].pet.id, 'dog'); assert.deepEqual(recommend(base), result);
});
for (const input of [null, undefined, [], '', 12]) test(`reject malformed profile ${JSON.stringify(input)}`, () => {
  assert.equal(validateProfile(input).ok, false); assert.deepEqual(recommend(input).matches, []);
});
for (const value of ['', ' ', 'ten', 'Infinity', Infinity, NaN, -1, true, null, [], {}, '0x10', '1e2', '5minutes']) test(`reject invalid numeric ${String(value)} (${typeof value})`, () => {
  for (const key of ['minutes', 'monthly', 'setup']) {
    const result = validateProfile({ ...base, [key]: value }); assert.equal(result.ok, false); assert.ok(result.errors[key]);
  }
});
test('numeric bounds include zero and maximum; trimmed decimals accepted', () => {
  assert.equal(validateProfile({ ...base, minutes: 0, monthly: 0, setup: 0 }).ok, true);
  assert.equal(validateProfile({ ...base, minutes: 720, monthly: 10000, setup: 20000 }).ok, true);
  for (const [key,value] of [['minutes',720.01],['monthly',10000.01],['setup',20000.01]]) assert.equal(validateProfile({...base,[key]:value}).ok,false);
  assert.equal(validateProfile({ ...base, minutes: ' 60.5 ' }).profile.minutes,60.5);
});
test('missing and unknown choices rejected, including markup', () => {
  for (const key of ['space','housing','allergies','activity','experience','backup']) {
    assert.equal(validateProfile({...base,[key]:'<img src=x onerror=alert(1)>'}).ok,false);
    const missing = {...base}; delete missing[key]; assert.ok(validateProfile(missing).errors[key]);
  }
});
test('blank budget invalid; zero valid and produces no match', () => {
  assert.equal(recommend({...base,monthly:''}).ok,false);
  const result = recommend({...base,monthly:0}); assert.equal(result.ok,true); assert.equal(result.matches.length,0); assert.equal(result.excluded.length,PETS.length);
});
test('housing and backup care prevent all matches independently', () => {
  for (const key of ['housing','backup']) { const result=recommend({...base,[key]:'no'}); assert.equal(result.matches.length,0); assert.ok(result.excluded.every(entry=>entry.blockers.length)); }
});
test('furry-animal preference excludes every mammal',()=>assert.deepEqual(recommend({...base,allergies:'yes'}).matches.map(entry=>entry.pet.id),['fish']));
test('exact thresholds qualify; fractional shortfalls exclude',()=>{
  for (const pet of PETS) {
    const profile={...base,minutes:pet.minutes,monthly:pet.monthly,setup:pet.setup};
    assert.ok(recommend(profile).matches.some(match=>match.pet.id===pet.id));
    for (const key of ['minutes','monthly','setup']) assert.ok(recommend({...profile,[key]:pet[key]-.01}).excluded.some(match=>match.pet.id===pet.id));
  }
});
test('small space excludes rabbit pair; medium admits it',()=>{
  assert.ok(!recommend({...base,space:'small'}).matches.some(entry=>entry.pet.id==='rabbits'));
  assert.ok(recommend({...base,space:'medium'}).matches.some(entry=>entry.pet.id==='rabbits'));
});
test('ties sort predictably and scores do not imply probability',()=>{
  const result=recommend({...base,activity:'calm'}); assert.deepEqual(result.matches.map(entry=>entry.pet.id),['cat','fish','dog','rabbits']);
  assert.ok(result.matches.every(entry=>entry.score>=0&&entry.score<=3));
});
test('first-time experience affects ranking rather than hard eligibility',()=>{
  const result=recommend({...base,activity:'moderate',experience:'first'}); assert.equal(result.matches[0].pet.id,'rabbits'); assert.equal(result.matches[0].score,2);
});
test('equivalent profile keys ignore whitespace, key order, and extra fields',()=>{
  assert.equal(profileKey({...base,minutes:'180.0',monthly:' 300 ',extra:'<script>'}),profileKey(base)); assert.equal(profileKey(null),null); assert.equal('extra' in validateProfile({...base,extra:1}).profile,false);
});
test('recommendations never mutate inputs or catalog',()=>{
  const input=Object.freeze({...base}); const before=JSON.stringify(PETS); recommend(input); assert.equal(JSON.stringify(PETS),before); assert.deepEqual(input,base);
});
test('1512-profile sweep never recommends a pet failing hard constraints',()=>{
  let scenarios=0;
  for(const space of ['small','medium','large'])
  for(const minutes of [0,29.99,30,60,90,120,720])
  for(const monthly of [0,40,100,140,180,10000])
  for(const setup of [0,250,350,500,550,20000])
  for(const allergies of ['yes','no']) {
    const result=recommend({...base,space,minutes,monthly,setup,allergies}); assert.equal(result.ok,true); assert.equal(result.matches.length+result.excluded.length,PETS.length);
    for(const {pet} of result.matches) { assert.ok(SPACE_LEVELS[space]>=pet.space); assert.ok(minutes>=pet.minutes&&monthly>=pet.monthly&&setup>=pet.setup); assert.ok(allergies!=='yes'||pet.family!=='mammal'); }
    scenarios++;
  }
  assert.equal(scenarios,1512);
});
