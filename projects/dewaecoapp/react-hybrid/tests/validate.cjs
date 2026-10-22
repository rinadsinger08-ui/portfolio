const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const ts=(()=>{try{return require('typescript')}catch{return require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')}})();
const root=path.join(__dirname,'..');
let fileCount=0;
function syntaxScan(folder){
 for(const entry of fs.readdirSync(folder,{withFileTypes:true})){
  const file=path.join(folder,entry.name);
  if(entry.isDirectory()){syntaxScan(file);continue;}
  if(!/\.tsx?$/.test(file))continue;
  const res=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}});
  assert.equal(res.diagnostics.length,0,'transpilation diagnostics in '+file);
  fileCount++;
 }
}
const cache=new Map();
function getTs(rel){
 const file=path.resolve(root,rel).replace(/\.ts$/,'')+'.ts';
 if(cache.has(file))return cache.get(file).exports;
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(file));cache.set(file,m);
 const native=m.require.bind(m);
 m.require=(name)=>name.startsWith('.')?getTs(path.relative(root,path.resolve(path.dirname(file),name))):native(name);
 m._compile(code,file);return m.exports;
}
syntaxScan(path.join(root,'src'));
const {waterToLitres,parseUtilityBill,parsePurchaseReceipt}=getTs('src/utils/documentParsing');
const {calculateProductConsumption,compareProducts,buildRecommendation}=getTs('src/utils/productCalculations');
const {calculateWaterScenario}=getTs('src/utils/waterScenario');
const {WATER_COST_PER_LITRE}=getTs('src/utils/usageAssumptions');
const {calculatePointsForReduction}=getTs('src/utils/helpers');
assert.equal(waterToLitres(2.5,'m3'),2500);
assert.ok(Math.abs(waterToLitres(1,'IG')-4.54609)<1e-9);
assert.ok(Math.abs(waterToLitres(1,'USgal')-3.785411784)<1e-9);
assert.throws(()=>waterToLitres(-1,'m3'));
const bill=parseUtilityBill('DEWA\nBilling Period: May 2025\nWater Consumption (m3): 14.5\nElectricity Consumption (kWh): 650\nWater Charges: AED 124.50\nElectricity Charges: AED 155.20');
assert.equal(bill.month,4);assert.equal(bill.year,2025);assert.equal(bill.waterUsageLitres,14500);assert.equal(bill.energyUsageKwh,650);assert.equal(bill.waterCostAed,124.5);assert.equal(bill.energyCostAed,155.2);
const older=parseUtilityBill('April 2024\nWater Usage (IG): 1,200\nEnergy Usage (kWh): 300');
assert.equal(older.waterUnit,'IG');assert.ok(Math.abs(older.waterUsageLitres-(1200*4.54609))<1e-7);
const receipt=parsePurchaseReceipt('CARREFOUR UAE\nReceipt No: A82913\nWater-saving showerhead\nSubtotal AED 70\nGrand Total: AED 73.50');
assert.equal(receipt.merchant,'CARREFOUR UAE'); assert.equal(receipt.receiptNumber,'A82913');assert.equal(receipt.amountAed,73.5);
assert.equal(WATER_COST_PER_LITRE,0.0088);
const shower=(name,flowRate,price)=>({name,brand:'Demo',category:'showerheads',flowRate,unit:'L/min',price,specSource:'Demo',retailerSearchUrl:''});
const a=calculateProductConsumption(shower('Eco',6,89));
assert.equal(a.monthlyLiters,6*8*30);assert.equal(a.annualLiters,6*8*30*12);
assert.ok(Math.abs(a.monthlyCostAed-12.672)<1e-8);
assert.ok(Math.abs(a.fiveYearTotalCostAed-(89+12.672*60))<1e-6);
const compare=compareProducts([shower('Eco',6,89),shower('Other',12,39)]);
assert.equal(compare.length,2);assert.equal(compare.filter(x=>x.isLowestWater).length,1);
assert.ok(buildRecommendation(compare).lowestWater);
assert.equal(calculatePointsForReduction(-10,-5),0);
assert.ok(Number.isFinite(compare[0].consumption.fiveYearTotalCostAed));
const s1=calculateWaterScenario(7,240,8.8,89);
assert.equal(s1.monthlyLitres,1680);
assert.equal(s1.annualLitres,20160);
assert.ok(Math.abs(s1.monthlyWaterCostAed-14.784)<1e-9);
assert.ok(Math.abs(s1.fiveYearTotalCostAed-(89+14.784*60))<1e-8);
const shower2=calculateWaterScenario(12,240,8.8,39);
assert.ok(s1.monthlyLitres < shower2.monthlyLitres);
const washing=calculateWaterScenario(45,20,8.8,1850);
assert.equal(washing.monthlyLitres,900);
const toilet=calculateWaterScenario(4.5,150,8.8,800);
assert.equal(toilet.monthlyLitres,675);
assert.throws(()=>calculateWaterScenario(6,-1,8.8,90),RangeError);
assert.throws(()=>calculateWaterScenario(NaN,1,8.8,90),RangeError);
assert.throws(()=>calculateWaterScenario(4,1,Infinity,90),RangeError);
console.log(`PASS: ${fileCount} TS/TSX syntax checks; document parsing, conversions, rewards safety, usage units, category-specific scenarios, 5-year cost tests.`);
