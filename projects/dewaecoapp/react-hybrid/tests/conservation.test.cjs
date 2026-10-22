const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = (() => {try{return require('typescript')}catch{return require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')}})();
const file=path.join(__dirname,'../src/utils/conservationPoints.ts');
const compiled=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const mod=new Module(file,module);mod.filename=file;mod.paths=Module._nodeModulePaths(path.dirname(file));mod._compile(compiled,file);
const {calculateConceptAwards}=mod.exports;
const bill=(id,year,month,waterUsage,energyUsage,accountId='A1',source='scan')=>({id,year,month,waterUsage,energyUsage,accountId,source,waterCost:0,energyCost:0});
const cases=[
 ['both decreased', [bill('a',2026,8,25000,400),bill('b',2026,9,20000,350)],20],
 ['water decreased', [bill('a',2026,8,25000,400),bill('b',2026,9,20000,410)],10],
 ['electric decreased', [bill('a',2026,8,25000,400),bill('b',2026,9,30000,350)],10],
 ['neither decreased', [bill('a',2026,8,25000,400),bill('b',2026,9,30000,400)],0],
 ['not consecutive', [bill('a',2026,7,25000,400),bill('b',2026,9,20000,350)],0],
 ['different account', [bill('a',2026,8,25000,400),bill('b',2026,9,20000,350,'B2')],0],
 ['manual excluded', [bill('a',2026,8,25000,400,'A1','legacy'),bill('b',2026,9,20000,350)],0],
 ['rollover', [bill('a',2025,11,25000,400),bill('b',2026,0,20000,350)],20],
 ['zero baseline', [bill('a',2026,8,0,0),bill('b',2026,9,0,0)],0],
];
for(const [name,data,expected] of cases){const sum=calculateConceptAwards(data).reduce((s,a)=>s+a.total,0);assert.equal(sum,expected,name)}
console.log(`PASS: ${cases.length} conservation points scenarios`);
