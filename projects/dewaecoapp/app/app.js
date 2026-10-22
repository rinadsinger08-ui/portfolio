'use strict';
(function(){
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const money=n=>'AED '+Number(n).toLocaleString('en-AE',{minimumFractionDigits:2,maximumFractionDigits:2});
const number=n=>Number(n).toLocaleString('en-AE',{maximumFractionDigits:2});
const CATS={
showerheads:{name:'Showerheads',unit:'L/min',uses:240,icon:'🚿',description:'Daily shower minutes'},
faucets:{name:'Faucets & aerators',unit:'L/min',uses:300,icon:'🚰',description:'Daily tap-use minutes'},
toilets:{name:'Toilets',unit:'L/flush',uses:150,icon:'🚽',description:'Monthly flushes'},
washing:{name:'Washing machines',unit:'L/cycle',uses:16,icon:'🫧',description:'Monthly wash cycles'},
dishwashers:{name:'Dishwashers',unit:'L/cycle',uses:24,icon:'🍽',description:'Monthly dishwasher cycles'}
};
const SAMPLES=[
['showerheads','Example standard showerhead',80,11.4],['showerheads','Example low-flow showerhead',145,6.0],['showerheads','Example budget water-saver',96,7.5],
['faucets','Example standard bathroom tap',140,9.0],['faucets','Example aerated faucet',205,5.0],['faucets','Example low-flow aerator',45,4.0],
['toilets','Example older toilet',420,9],['toilets','Example dual-flush toilet',730,4.5],['toilets','Example single-flush efficient toilet',650,5],
['washing','Example standard top-loader',1350,100],['washing','Example front-loader',1900,48],['washing','Example efficient washer',2100,42],
['dishwashers','Example standard dishwasher',1200,18],['dishwashers','Example efficient dishwasher',1550,10],['dishwashers','Example compact dishwasher',1000,11]
].map((x,i)=>({id:'sample'+i,category:x[0],name:x[1],price:x[2],rate:x[3]}));
const KEY='dewaecoapp-public-preview-v1';
const defaults={bills:[],documents:[],custom:[],tariff:8.8,category:'showerheads',selections:[],scenarios:{},view:'dashboard'};
function load(){try{const v=JSON.parse(localStorage.getItem(KEY));return v&&typeof v==='object'?{...defaults,...v}:structuredClone(defaults)}catch{return structuredClone(defaults)}}
const state=load();
if(!Array.isArray(state.bills))state.bills=[];
if(!Array.isArray(state.documents))state.documents=[];
if(!Array.isArray(state.custom))state.custom=[];
if(!Array.isArray(state.selections))state.selections=[];
if(!state.scenarios||typeof state.scenarios!=='object')state.scenarios={};
if(!CATS[state.category])state.category='showerheads';
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{notify('Storage unavailable; changes may not persist.')}}
function notify(message){const target=$('document-message');if(target)target.textContent=message}
function validNum(value){if(value===''||value===null||!Number.isFinite(Number(value))||Number(value)<0)return null;return Number(value)}
function monthText(s){if(!/^\d{4}-\d{2}$/.test(s))return s;return new Date(s+'-02T12:00:00').toLocaleDateString('en-AE',{month:'short',year:'numeric'})}
function fmtPercent(a,b){if(b===0)return null;return (a-b)/b*100}
function comparisonLine(kind,now,before,unit){const p=fmtPercent(now,before);if(p===null)return '<div class="listline">'+esc(kind)+': previous usage was zero; percentage unavailable</div>';const lower=p<0;return '<div class="listline between"><div><b>'+esc(kind)+'</b><p class="help">'+number(before)+' → '+number(now)+' '+esc(unit)+'</p></div><span class="badge '+(p>0?'amber':'')+'">'+(p===0?'No change':(lower?'↓ ':'↑ ')+number(Math.abs(p))+'%')+'</span></div>'}
function showView(view){if(!['dashboard','products','calculator','scan'].includes(view))view='dashboard';state.view=view;document.querySelectorAll('.section').forEach(x=>x.classList.toggle('active',x.id==='view-'+view));document.querySelectorAll('.nav-btn').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.view===view)));persist();if(view==='dashboard')renderDashboard();if(view==='products')renderProducts();if(view==='calculator')renderCalculator();if(view==='scan')renderDocuments()}
function sortedBills(){return [...state.bills].sort((a,b)=>a.month.localeCompare(b.month))}

/* Illustrative program-design rule only. Real credits require official utility verification and a secure server. */
const CONCEPT_POINTS_PER_REDUCED_UTILITY=10;
function previousMonthKey(month){
 if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))return null;
 const [y,m]=month.split('-').map(Number),d=new Date(Date.UTC(y,m-2,1));
 return d.getUTCFullYear()+'-'+String(d.getUTCMonth()+1).padStart(2,'0');
}
function conceptPoints(){
 // A demonstration calculation, NOT a points ledger. Recompute from unique, photo-imported
 // records with matching entered account identifiers and consecutive billing months.
 // Changing browser storage or editing photos can fake these values; no real benefit is issued.
 const scans=state.bills.filter(b=>b.source==='scan'&&typeof b.identifier==='string'&&b.identifier.trim()&&
  typeof b.month==='string'&&Number.isFinite(b.water)&&Number.isFinite(b.energy)&&b.water>=0&&b.energy>=0);
 const lookup=new Map();
 scans.forEach(b=>{const key=b.identifier.trim().toLowerCase()+'|'+b.month;if(!lookup.has(key))lookup.set(key,b)});
 const awards=scans.map(current=>{
  const pm=previousMonthKey(current.month);
  const previous=pm?lookup.get(current.identifier.trim().toLowerCase()+'|'+pm):null;
  if(!previous)return null;
  const waterSaved=Math.max(0,previous.water-current.water),energySaved=Math.max(0,previous.energy-current.energy);
  return {billId:current.id,month:current.month,waterSaved,energySaved,
   waterPoints:waterSaved>0?CONCEPT_POINTS_PER_REDUCED_UTILITY:0,
   energyPoints:energySaved>0?CONCEPT_POINTS_PER_REDUCED_UTILITY:0};
 }).filter(Boolean);
 return {total:awards.reduce((s,a)=>s+a.waterPoints+a.energyPoints,0),awards};
}

function renderDashboard(){
 const b=sortedBills(),latest=b[b.length-1],previous=b[b.length-2],concept=conceptPoints();
 $('stat-concept-points').textContent=number(concept.total);
 $('stat-concept-sub').textContent=concept.awards.length?concept.awards.length+' eligible month-to-month comparison(s) · simulated only':'Requires two consecutive scanned bills for the same entered account';
 $('stat-water').textContent=latest?number(latest.water)+' m³':'—';$('stat-power').textContent=latest?number(latest.energy)+' kWh':'—';
 $('stat-water-sub').textContent=latest?monthText(latest.month)+' · scanned · unverified':'No bills recorded';
 $('stat-power-sub').textContent=latest?monthText(latest.month)+' · scanned · unverified':'No bills recorded';
 if(!latest){$('usage-bars').innerHTML='<div class="empty"><b>No trend yet</b>Add monthly records to see how your usage changes.</div>';$('comparison-box').innerHTML='<div class="empty"><b>Start with two months</b>Percent changes appear after two tracked billing periods.</div>';}
 else{
 const last=b.slice(-6),maximum=Math.max(0.001,...last.map(x=>x.water));
 $('usage-bars').innerHTML='<div class="bar-group">'+last.map(x=>'<div class="bar"><div class="bar-track"><div class="bar-fill" style="height:'+Math.max(2,x.water/maximum*100)+'%"></div></div><div class="bar-label">'+esc(monthText(x.month))+'</div><div class="bar-number">'+number(x.water)+' m³</div></div>').join('')+'</div>';
 if(!previous){$('comparison-box').innerHTML='<div class="empty"><b>One month recorded</b>Add another month to view the change.</div>';}
 else{
 const mi=new Date(previous.month+'-02T12:00:00');mi.setMonth(mi.getMonth()+1);const adjacent=mi.toISOString().slice(0,7)===latest.month;
 const credit=concept.awards.find(a=>a.billId===latest.id);
 const rewardCopy=credit?
  '<div class="result mt"><b>✦ '+number(credit.waterPoints+credit.energyPoints)+' hypothetical DEWAEcoApp points</b>'+
  (credit.waterPoints?'Water use fell by '+number(credit.waterSaved)+' m³ (+10 concept points). ':'No water-reduction points. ')+
  (credit.energyPoints?'Electricity fell by '+number(credit.energySaved)+' kWh (+10 concept points).':'No electricity-reduction points.')+
  '</div>':
  '<div class="callout mt">Concept points require two consecutive monthly bill photos associated with the same entered account number. This comparison does not qualify.</div>';
 $('comparison-box').innerHTML='<p class="help">'+esc(monthText(previous.month))+' vs '+esc(monthText(latest.month))+(adjacent?'':' · Not consecutive months')+'</p>'+
 comparisonLine('Water',latest.water,previous.water,'m³')+
 comparisonLine('Electricity',latest.energy,previous.energy,'kWh')+rewardCopy+
 '<p class="footnote mt">Comparison uses the reported consumption values, not the bill amount. Photos and account identifiers are not independently authenticated. Concept points are illustrative and never redeemable.</p>';
 }
 }
 $('bill-history').innerHTML=b.length?'<div class="tablewrap"><table class="table"><thead><tr><th>Month</th><th>Water (m³)</th><th>Energy (kWh)</th><th>Costs</th><th></th></tr></thead><tbody>'+b.slice().reverse().map(x=>'<tr><td>'+esc(monthText(x.month))+' <span class="badge '+(x.source==='scan'?'amber':'gray')+'">'+(x.source==='scan'?'Scanned · unverified':'Legacy manual')+'</span></td><td>'+number(x.water)+'</td><td>'+number(x.energy)+'</td><td>'+ (x.waterCost===null&&x.energyCost===null?'—':money((x.waterCost||0)+(x.energyCost||0)))+'</td><td><button class="btn danger small" data-delbill="'+esc(x.id)+'">Remove</button></td></tr>').join('')+'</tbody></table></div>':'<div class="empty"><b>Nothing here yet</b>Add a bill from the button above or use Scan & Review to organize a document.</div>';
}
const searchLink=(s,retailer)=>retailer==='amazon'?'https://www.amazon.ae/s?k='+encodeURIComponent(s):'https://www.carrefouruae.com/mafuae/en/search?q='+encodeURIComponent(s);
function usage(product,uses){return product.rate*uses}
function monthlyCost(product,uses,tariff){return usage(product,uses)/1000*tariff}
function fiveYear(product,uses,tariff){return product.price+monthlyCost(product,uses,tariff)*60}
function recommendations(products,uses,tariff){if(products.length<2)return null;const a=products.slice().sort((x,y)=>usage(x,uses)-usage(y,uses))[0];const b=products.slice().sort((x,y)=>fiveYear(x,uses,tariff)-fiveYear(y,uses,tariff))[0];return {water:a,cost:b}}
function renderProducts(){
 $('category-tabs').innerHTML=Object.entries(CATS).map(([k,c])=>'<button type="button" data-cat="'+k+'" class="'+(state.category===k?'active':'')+'">'+c.icon+' '+esc(c.name)+'</button>').join('');
 const q=$('product-search').value.trim().toLowerCase();const cat=CATS[state.category];
 const products=SAMPLES.filter(x=>x.category===state.category&&(!q||x.name.toLowerCase().includes(q)));
 $('product-results').innerHTML=products.map(x=>{const selected=state.selections.includes(x.id);return '<article class="product '+(selected?'selected':'')+'"><div class="prod-top"><div><p class="brand">DEMONSTRATION · NOT A RETAIL LISTING</p><h3>'+esc(x.name)+'</h3></div><span class="icon-big">'+cat.icon+'</span></div><div class="metrics"><div class="metric"><small>Illustrative price</small><b>'+money(x.price)+'</b></div><div class="metric"><small>Water per use</small><b>'+number(x.rate)+' '+esc(cat.unit)+'</b></div><div class="metric"><small>Monthly consumption</small><b>'+number(usage(x,state.scenarios[state.category]??cat.uses)/1000)+' m³</b></div><div class="metric"><small>5-year estimate</small><b>'+money(fiveYear(x,state.scenarios[state.category]??cat.uses,state.tariff))+'</b></div></div><div class="actions"><button type="button" class="btn small '+(selected?'secondary':'outline')+'" data-select="'+esc(x.id)+'">'+(selected?'✓ Selected':'Compare')+'</button><button type="button" class="btn secondary small" data-adopt="'+esc(x.id)+'">To calculator ↗</button><a href="'+esc(searchLink(cat.name,'amazon'))+'" target="_blank" rel="noopener noreferrer">Amazon.ae ↗</a><a href="'+esc(searchLink(cat.name,'carrefour'))+'" target="_blank" rel="noopener noreferrer">Carrefour ↗</a></div></article>'}).join('')||'<div class="empty"><b>No examples match</b>Try another search or category.</div>';
 const selected=state.selections.map(id=>SAMPLES.find(x=>x.id===id)).filter(Boolean).filter(x=>x.category===state.category);
 const el=$('product-comparison');if(selected.length!==2){el.style.display='none';return}
 const uses=state.scenarios[state.category]??cat.uses;
 const [a,b]=selected;const rec=recommendations(selected,uses,state.tariff);
 el.style.display='block';el.innerHTML='<div class="between mb"><h3>Side-by-side comparison</h3><span class="badge gray">'+number(uses)+' '+esc(cat.unit==='L/min'?'minutes / month':cat.unit==='L/flush'?'flushes / month':'cycles / month')+'</span></div><div class="tablewrap"><table class="table"><thead><tr><th>Metric</th><th>'+esc(a.name)+'</th><th>'+esc(b.name)+'</th></tr></thead><tbody>'+[['Purchase price',money(a.price),money(b.price)],['Water per use',number(a.rate)+' '+cat.unit,number(b.rate)+' '+cat.unit],['Water per month',number(usage(a,uses))+' L',number(usage(b,uses))+' L'],['Monthly water cost',money(monthlyCost(a,uses,state.tariff)),money(monthlyCost(b,uses,state.tariff))],['Five-year estimate',money(fiveYear(a,uses,state.tariff)),money(fiveYear(b,uses,state.tariff))]].map(row=>'<tr><td>'+row.map(esc).join('</td><td>')+'</td></tr>').join('')+'</tbody></table></div><div class="grid two mt"><div class="result"><b>💧 Lowest water use</b>'+esc(rec.water.name)+'</div><div class="result"><b>◈ Lowest 5-year cost</b>'+esc(rec.cost.name)+'</div></div><p class="footnote mt">Prices, names, and specifications in this example catalog are fictional and illustrative. Do not use these results to make a real purchasing decision.</p>';
}
function categoryOptions(){return Object.entries(CATS).map(([k,v])=>'<option value="'+k+'">'+esc(v.name)+'</option>').join('')}
function renderCalculator(){
 $('water-tariff').value=state.tariff;$('calc-category').innerHTML=categoryOptions();$('calc-category').value=state.category;
 $('uses-month').value=state.scenarios[state.category]??CATS[state.category].uses;
 const cat=CATS[state.category],products=state.custom.filter(x=>x.category===state.category),rec=recommendations(products,Number($('uses-month').value),state.tariff);
 $('product-form').querySelector('label[for="new-product-rate"]').textContent='Water per use ('+cat.unit+')';
 const unitNotes='Based on '+number($('uses-month').value)+' '+(cat.unit==='L/min'?'minutes':cat.unit==='L/flush'?'flushes':'cycles')+' per month.';
 const table=products.length?'<p class="help mb">'+esc(unitNotes)+'</p><div class="tablewrap"><table class="table"><thead><tr><th>Product</th><th>Price</th><th>Water per use</th><th>Monthly water</th><th>Monthly cost</th><th>5-year total</th><th></th></tr></thead><tbody>'+products.map(x=>'<tr><td><b>'+esc(x.name)+'</b></td><td>'+money(x.price)+'</td><td>'+number(x.rate)+' '+esc(cat.unit)+'</td><td>'+number(usage(x,Number($('uses-month').value)))+' L</td><td>'+money(monthlyCost(x,Number($('uses-month').value),state.tariff))+'</td><td>'+money(fiveYear(x,Number($('uses-month').value),state.tariff))+'</td><td><button class="btn danger small" data-delproduct="'+esc(x.id)+'">Remove</button></td></tr>').join('')+'</tbody></table></div>':'<div class="empty"><b>No products for '+esc(cat.name)+' yet</b>Add a product or choose one from Eco Products.</div>';
 const summary=rec?'<div class="grid two mt"><div class="result"><b>💧 Lowest water use</b>'+esc(rec.water.name)+' · '+number(usage(rec.water,Number($('uses-month').value)))+' L/month</div><div class="result"><b>◈ Lowest 5-year total</b>'+esc(rec.cost.name)+' · '+money(fiveYear(rec.cost,Number($('uses-month').value),state.tariff))+'</div></div>':'';
 $('calc-results').innerHTML=table+summary;
}
function renderDocuments(){
 const d=state.documents.slice().reverse();
 $('document-history').innerHTML=d.length?'<div class="tablewrap"><table class="table"><thead><tr><th>Document</th><th>Period / store</th><th>Status</th><th>Date saved</th><th></th></tr></thead><tbody>'+d.map(x=>'<tr><td>'+esc(x.type==='bill'?'Utility bill':'Purchase receipt')+'</td><td>'+esc(x.period||x.merchant||'Not specified')+'</td><td><span class="badge amber">Unverified local review</span></td><td>'+esc(x.created.slice(0,10))+'</td><td><button class="btn danger small" data-deldoc="'+esc(x.id)+'">Delete</button></td></tr>').join('')+'</tbody></table></div>':'<div class="empty"><b>No documents saved</b>Upload a bill or purchase receipt to organize a local review record.</div>';
}
function uuid(){return typeof crypto.randomUUID==='function'?crypto.randomUUID():String(Date.now())+'-'+Math.random()}
async function fingerprint(file){const bytes=await file.arrayBuffer();if(crypto.subtle){const out=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(out)].map(x=>x.toString(16).padStart(2,'0')).join('')}return file.name+':'+file.size+':'+file.lastModified}
function detect(text,type){const clean=text.replace(/[, ](?=\d{3}\b)/g,'');let m;
 if(type==='bill'){
 m=clean.match(/(?:water\s*(?:consumption|usage|used)?)[^\n0-9]{0,24}([\d.]+)\s*(m3|m³|cubic\s*met(?:re|er)s?|lit(?:er|re)s?|kwh)?/i);
 if(m){const v=Number(m[1]);if(Number.isFinite(v)){let n=v;if(/lit/i.test(m[2]||''))n=v/1000;$('doc-water').value=n.toFixed(3)}}
 m=clean.match(/(?:electricity|energy)\s*(?:consumption|usage|used)?[^\n0-9]{0,26}([\d.]+)\s*(?:kwh)?/i);if(m)$('doc-electricity').value=m[1];
 m=clean.match(/\b(20\d{2})[\/.-](0?[1-9]|1[0-2])\b/);if(m)$('doc-month').value=m[1]+'-'+m[2].padStart(2,'0');
 }else{
 m=clean.match(/(?:total|amount\s*paid|grand\s*total)[^\n0-9]{0,20}(?:AED|Dhs?|د\.إ)?\s*([\d,.]+)/i);if(m)$('doc-total').value=m[1].replace(/,/g,'');
 }
}
function init(){
 document.querySelectorAll('.nav-btn').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
 $('show-bill-form').onclick=()=>{showView('scan');$('document-type').value='bill';$('document-file').focus()};
 $('clear-bills').onclick=()=>{if(state.bills.length&&confirm('Delete all locally saved tracking records?')){state.bills=[];persist();renderDashboard()}};
 $('bill-history').addEventListener('click',e=>{const btn=e.target.closest('[data-delbill]');if(btn){state.bills=state.bills.filter(x=>x.id!==btn.dataset.delbill);persist();renderDashboard()}});
 $('category-tabs').addEventListener('click',e=>{const btn=e.target.closest('[data-cat]');if(btn){state.category=btn.dataset.cat;state.selections=[];$('product-search').value='';persist();renderProducts()}});
 $('product-search').addEventListener('input',renderProducts);
 $('product-results').addEventListener('click',e=>{const select=e.target.closest('[data-select]');const adopt=e.target.closest('[data-adopt]');
 if(select){const id=select.dataset.select;if(state.selections.includes(id))state.selections=state.selections.filter(x=>x!==id);else state.selections=state.selections.length>=2?[state.selections[1],id]:[...state.selections,id];persist();renderProducts()}
 if(adopt){const x=SAMPLES.find(p=>p.id===adopt.dataset.adopt);if(!x)return;state.custom.push({...x,id:uuid()});state.category=x.category;persist();$('product-form-card').hidden=false;showView('calculator')}}
 );
 $('show-product-form').onclick=()=>{$('product-form-card').hidden=false;$('new-product-name').focus()};
 $('hide-product-form').onclick=()=>{$('product-form-card').hidden=true};
 $('product-form').addEventListener('submit',e=>{e.preventDefault();const name=$('new-product-name').value.trim(),price=validNum($('new-product-price').value),rate=validNum($('new-product-rate').value);
 if(!name||price===null||rate===null){alert('Enter a product name, nonnegative price and water usage.');return}
 state.custom.push({id:uuid(),name,price,rate,category:state.category});persist();$('product-form').reset();$('product-form-card').hidden=true;renderCalculator()});
 $('calc-results').addEventListener('click',e=>{const btn=e.target.closest('[data-delproduct]');if(btn){state.custom=state.custom.filter(x=>x.id!==btn.dataset.delproduct);persist();renderCalculator()}});
 $('clear-custom').onclick=()=>{if(state.custom.some(x=>x.category===state.category)&&confirm('Clear products in this category?')){state.custom=state.custom.filter(x=>x.category!==state.category);persist();renderCalculator()}};
 $('water-tariff').addEventListener('change',()=>{const n=validNum($('water-tariff').value);if(n===null){$('water-tariff').value=state.tariff;return}state.tariff=n;persist();renderCalculator()});
 $('calc-category').addEventListener('change',()=>{state.category=$('calc-category').value;state.selections=[];persist();renderCalculator()});
 $('uses-month').addEventListener('change',()=>{const n=validNum($('uses-month').value);if(n===null){renderCalculator();return}state.scenarios[state.category]=n;persist();renderCalculator()});
 $('document-file').addEventListener('change',()=>{$('ocr-status').textContent='';$('document-text').value='';$('document-message').textContent=''});
 $('extract-document').addEventListener('click',async()=>{const f=$('document-file').files[0];if(!f){$('ocr-status').textContent='Choose a photo first.';return}if(f.size>5*1024*1024){$('ocr-status').textContent='Maximum 5 MB.';return}
 $('extract-document').disabled=true;$('ocr-status').textContent='Loading OCR…';
 try{if(!window.Tesseract){await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';s.onload=res;s.onerror=()=>rej(new Error('Could not load OCR library'));document.head.append(s)})}
 const r=await window.Tesseract.recognize(f,'eng',{logger:ev=>{if(ev.status==='recognizing text')$('ocr-status').textContent='Reading photo '+Math.round(ev.progress*100)+'%'}});const text=r.data.text||'';$('document-text').value=text;detect(text,$('document-type').value);$('ocr-status').textContent=text.trim()?'OCR complete; review the fields.':'No readable text detected.';
 }catch(err){$('ocr-status').textContent='OCR unavailable. You can still review the photo manually.';console.warn(err)}finally{$('extract-document').disabled=false}});
 $('document-form').addEventListener('submit',async e=>{e.preventDefault();const f=$('document-file').files[0],type=$('document-type').value,message=$('document-message');message.textContent='';
 if(!f){message.textContent='Attach a photo before saving an evidence record.';return}
 if(!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>5*1024*1024){message.textContent='Choose a JPG, PNG, or WEBP image under 5 MB.';return}
 const water=$('doc-water').value===''?null:validNum($('doc-water').value),energy=$('doc-electricity').value===''?null:validNum($('doc-electricity').value),total=$('doc-total').value===''?null:validNum($('doc-total').value),identifier=$('doc-identifier').value.trim();
 if(($('doc-water').value!==''&&water===null)||($('doc-electricity').value!==''&&energy===null)||($('doc-total').value!==''&&total===null)){message.textContent='Please correct negative or invalid values.';return}
 if(type==='bill'&&(!identifier||!$('doc-month').value||water===null||energy===null)){message.textContent='For a bill, review its account number, billing month, water m³ and electricity kWh. An account number is needed to compare the same household.';return}
 if(type==='receipt'&&!$('doc-merchant').value.trim()){message.textContent='For a receipt, enter the merchant name.';return}
 const hash=await fingerprint(f);
 if(state.documents.some(d=>d.hash===hash)){message.textContent='This exact image was already saved on this device.';return}
 if(type==='bill'&&identifier&&state.documents.some(d=>d.type==='bill'&&d.identifier===identifier&&d.period===$('doc-month').value)){message.textContent='A bill from this account and month is already saved.';return}
 if(type==='receipt'&&identifier&&state.documents.some(d=>d.type==='receipt'&&d.identifier===identifier&&d.merchant.toLowerCase()===$('doc-merchant').value.trim().toLowerCase())){message.textContent='This receipt identifier already exists for the merchant.';return}
 const period=$('doc-month').value;
 if(type==='bill'&&state.bills.some(b=>b.month===period)){message.textContent='A bill for this month is already on your dashboard. Remove it there before replacing it.';return}
 const docId=uuid();
 state.documents.push({id:docId,hash,type,identifier,period,water,energy,total,merchant:$('doc-merchant').value.trim(),created:new Date().toISOString(),status:'unverified'});
 if(type==='bill')state.bills.push({id:uuid(),month:period,water,energy,waterCost:null,energyCost:null,source:'scan',documentId:docId,identifier});
 persist();$('document-form').reset();$('document-file').value='';$('document-text').value='';$('ocr-status').textContent='';
 message.textContent=type==='bill'?'Bill recorded as UNVERIFIED. Any simulated points are hypothetical, not redeemable.':'Receipt saved locally as UNVERIFIED. No purchase points are issued.';
 renderDocuments();if(type==='bill'){renderDashboard();showView('dashboard')}
 });
 $('document-type').addEventListener('change',()=>{$('document-text').value='';$('document-message').textContent=''});
 $('document-text').addEventListener('change',()=>detect($('document-text').value,$('document-type').value));
 $('document-history').addEventListener('click',e=>{const b=e.target.closest('[data-deldoc]');if(b){state.documents=state.documents.filter(d=>d.id!==b.dataset.deldoc);persist();renderDocuments()}});
 $('clear-documents').onclick=()=>{if(state.documents.length&&confirm('Delete all saved local review records?')){state.documents=[];persist();renderDocuments()}};
 showView(state.view||'dashboard');
}
init();
})();