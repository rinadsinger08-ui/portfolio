import test from 'node:test';
import assert from 'node:assert/strict';
import { recommend, validateProfile, profileKey, SPACE_LEVELS, originalInspiredChoices } from '../src/engine.js';
import { PETS } from '../src/pets.js';

const base = {space:'large',minutes:180,monthly:300,setup:1000,housing:'yes',allergies:'no',activity:'active',experience:'experienced',backup:'yes'};

test('all eight original animal categories and original Code.org images are present',()=>{
  assert.deepEqual(PETS.map(p=>p.id).sort(), ['bird','cat','dog','fish','hamster','rabbits','small-dog','turtle']);
  for(const pet of PETS) {
    assert.ok(pet.icon.startsWith('https://studio.code.org/v3/assets/04740d0a-0e30-4312-8bb1-6bf43aa63074/'));
    assert.ok(pet.fallbackIcon.endsWith('.svg'));
  }
});

test('high-resource profile ranks multiple animals rather than defaulting to fish',()=>{
  const result=recommend(base);
  assert.equal(result.ok,true);
  assert.equal(result.matches.length,4);
  assert.equal(result.matches[0].pet.id,'dog');
  assert.equal(result.excluded.length,4);
  assert.deepEqual(recommend(base),result);
});

test('different plausible profiles produce diverse top recommendations',()=>{
  const cases=[
    {space:'small',minutes:20,monthly:50,setup:100,activity:'calm',experience:'first'},
    {space:'small',minutes:70,monthly:100,setup:400,activity:'calm',experience:'first'},
    {space:'medium',minutes:100,monthly:170,setup:600,activity:'active',experience:'first'},
    {space:'large',minutes:20,monthly:200,setup:1000,activity:'calm',experience:'experienced'},
    {space:'small',minutes:100,monthly:120,setup:400,activity:'calm',experience:'first'},
    {space:'large',minutes:70,monthly:100,setup:400,activity:'moderate',experience:'first'}
  ];
  const top=new Set();
  for(const changes of cases){
    const result=recommend({...base,...changes});
    assert.equal(result.matches.length,4);
    top.add(result.matches[0].pet.id);
  }
  assert.ok(top.size>=4, 'different profiles should not lead primarily to fish or no match');
});

test('limited-but-nonzero resources with housing and backup yes show ranked options and visible cautions',()=>{
  const result=recommend({...base,space:'small',minutes:10,monthly:40,setup:100,housing:'yes',backup:'yes'});
  assert.equal(result.matches.length,4);
  assert.ok(result.matches.some(m=>m.cautions.some(t=>t.includes('setup budget'))));
  assert.ok(result.matches.every(m=>m.reasons.length));
});

test('genuinely not ready profiles show no matches with blockers',()=>{
  for(const profile of [
    {...base,housing:'no'},
    {...base,minutes:0},
    {...base,monthly:0,setup:0}
  ]){
    const result=recommend(profile);
    assert.equal(result.matches.length,0);
    assert.equal(result.excluded.length,PETS.length);
    assert.ok(result.excluded.every(e=>e.blockers.length>=1));
  }
});

test('backup care caution does not silently eliminate every pet',()=>{
  const result=recommend({...base,backup:'no'});
  assert.equal(result.matches.length,4);
  assert.ok(result.matches.every(x=>x.cautions.some(y=>y.includes('backup care'))));
});

test('avoiding furry animals excludes mammals and still offers three other categories',()=>{
  const result=recommend({...base,allergies:'yes'});
  assert.equal(result.matches.length,3);
  assert.ok(result.matches.every(x=>x.pet.family!=='mammal'));
  assert.deepEqual(result.matches.map(x=>x.pet.id).sort(),['bird','fish','turtle']);
});

test('original choice paths are preserved as a ranking signal, not guaranteed suitability',()=>{
  assert.deepEqual(originalInspiredChoices({...base,space:'large',minutes:180,monthly:300,setup:1000}),['dog']);
  assert.ok(originalInspiredChoices({...base,space:'small',minutes:20,monthly:40,setup:100}).includes('hamster'));
});

for(const input of [null,undefined,[],'',12])
  test('malformed profile is rejected: '+String(input),()=>{
    assert.equal(validateProfile(input).ok,false);
    assert.equal(recommend(input).matches.length,0);
  });

for(const value of ['', ' ', 'ten','Infinity',Infinity,NaN,-1,true,null,[],'0x10','1e2','5minutes'])
  test('bad numeric input is rejected: '+String(value),()=>{
    for(const key of ['minutes','monthly','setup']){
      const r=validateProfile({...base,[key]:value});
      assert.equal(r.ok,false);assert.ok(r.errors[key]);
    }
  });

test('zero, maxima, trimmed decimal numeric values and controlled choices',()=>{
  assert.equal(validateProfile({...base,minutes:0,monthly:0,setup:0}).ok,true);
  assert.equal(validateProfile({...base,minutes:720,monthly:10000,setup:20000}).ok,true);
  assert.equal(validateProfile({...base,minutes:' 60.5 '}).profile.minutes,60.5);
  for(const [key,value] of [['minutes',720.01],['monthly',10000.01],['setup',20000.01]])
    assert.equal(validateProfile({...base,[key]:value}).ok,false);
  for(const key of ['space','housing','allergies','activity','experience','backup'])
    assert.equal(validateProfile({...base,[key]:'<img src=x onerror=alert(1)>'}).ok,false);
});

test('profile key stable across extra data and number formatting',()=>{
  assert.equal(profileKey({...base,minutes:'180.0',monthly:' 300 ',extra:'x'}),profileKey(base));
  assert.equal(profileKey(null),null);
});

test('1512-profile sweep checks diversity, no-match safety conditions and accounting',()=>{
  let scenarios=0;const topIds=new Set();
  for(const space of ['small','medium','large'])
  for(const minutes of [0,29.99,30,60,90,120,720])
  for(const monthly of [0,40,100,140,180,10000])
  for(const setup of [0,250,350,500,550,20000])
  for(const allergies of ['yes','no']){
    const result=recommend({...base,space,minutes,monthly,setup,allergies});
    assert.equal(result.ok,true);
    assert.equal(result.matches.length+result.excluded.length,PETS.length);
    assert.equal(new Set(result.matches.map(m=>m.pet.id)).size,result.matches.length);
    if(minutes===0 || (monthly===0 && setup===0)) assert.equal(result.matches.length,0);
    else {
      assert.equal(result.matches.length,allergies==='yes'?3:4);
      assert.ok(result.matches.every(m=>allergies!=='yes'||m.pet.family!=='mammal'));
      for(const m of result.matches) assert.ok(Array.isArray(m.cautions)&&m.reasons.length>0);
      if(result.matches.length) topIds.add(result.matches[0].pet.id);
    }
    scenarios++;
  }
  assert.equal(scenarios,1512);
  assert.ok(topIds.size>=3);
});

test('catalog and input immutability and stable ordering',()=>{
  const input=Object.freeze({...base});
  const before=JSON.stringify(PETS);
  const r=recommend(input);
  assert.equal(JSON.stringify(PETS),before);
  assert.deepEqual(input,base);
  for(let k=1;k<r.matches.length;k++) assert.ok(r.matches[k-1].score>=r.matches[k].score);
});
