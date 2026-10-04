const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = { space:'large',minutes:'180',monthly:'300',setup:'1000',housing:'yes',allergies:'no',activity:'active',experience:'experienced',backup:'yes' };
const origin = process.env.PET_DECIDER_BASE_URL || 'http://127.0.0.1:3000';
const url=origin+'/projects/pet-decider/';
const qaDir=process.env.PET_DECIDER_QA_DIR || 'test-results';
fs.mkdirSync(qaDir,{recursive:true});
async function fill(page, values={}) {
 for(const [key,value] of Object.entries({...base,...values})) {
  if(['minutes','monthly','setup'].includes(key)) await page.locator('#'+key).fill(value);
  else await page.locator('#'+key).selectOption(value);
 }
}
async function submit(page){await page.getByRole('button',{name:'Explore my matches'}).click();}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.PET_DECIDER_CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--use-gl=angle','--use-angle=swiftshader','--disable-gpu']});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(url);
 await submit(page);assert.equal(await page.locator('[aria-invalid=true]').count(),9);assert.equal(await page.locator('#form-errors').isVisible(),true);
 console.log('PASS empty form shows accessible field errors');
 await fill(page);await submit(page);assert.equal(await page.locator('.pet-card').count(),4);assert.equal(await page.locator('.pet-card h3').first().textContent(),'Adult dog');
 assert.equal(await page.locator('#history-list .history-card').count(),1);
 console.log('PASS valid profile renders ranked matches and saves history');
 await page.getByRole('checkbox').nth(0).check();await page.getByRole('checkbox').nth(1).check();assert.equal(await page.locator('#comparison').isVisible(),true);assert.equal(await page.locator('thead th').count(),3);
 await page.getByRole('checkbox').nth(1).uncheck();assert.equal(await page.locator('#comparison').isVisible(),false);
 console.log('PASS compare table follows selection and hides below two options');
 await submit(page);assert.equal(await page.locator('#history-list .history-card').count(),1);
 await page.reload();assert.equal(await page.locator('#history-list .history-card').count(),1);await page.getByRole('button',{name:'Revisit'}).click();assert.equal(await page.locator('.pet-card').count(),4);assert.equal(await page.locator('#minutes').inputValue(),'180');
 console.log('PASS history deduplicates, persists, and restores complete profiles');
 await page.locator('#minutes').fill('0');assert.equal(await page.locator('.pet-card').count(),0);await submit(page);assert.equal(await page.locator('.no-match').count(),1);assert.equal(await page.locator('#history-list .history-card').count(),2);
 console.log('PASS edits invalidate stale matches and zero yields explicit no-match');
 await fill(page,{allergies:'yes'});await submit(page);assert.equal(await page.locator('.pet-card').count(),1);assert.equal(await page.locator('.pet-card h3').textContent(),'Freshwater aquarium');
 await fill(page,{housing:'no'});await submit(page);assert.equal(await page.locator('.no-match').count(),1);
 console.log('PASS allergy preference and housing restrictions are enforced in UI');
 await page.getByRole('button',{name:'Reset answers'}).click();assert.equal(await page.locator('#minutes').inputValue(),'');assert.equal(await page.locator('.pet-card').count(),0);assert.equal(await page.locator('#history-list .history-card').count(),4);
 await page.getByRole('button',{name:'Clear history',exact:true}).click();await page.getByRole('button',{name:'Keep history'}).click();assert.equal(await page.locator('#history-list .history-card').count(),4);
 await page.getByRole('button',{name:'Clear history',exact:true}).click();await page.getByRole('button',{name:'Delete saved profiles'}).click();assert.equal(await page.locator('#history-list .history-card').count(),0);await page.reload();assert.equal(await page.locator('#history-list .history-card').count(),0);
 console.log('PASS reset preserves history, confirmed clear deletes it persistently');
 await page.evaluate(()=>localStorage.setItem('pet-decider.history.v1','{broken'));await page.reload();assert.ok((await page.locator('#storage-status').textContent()).includes('unavailable'));await fill(page);await submit(page);assert.equal(await page.locator('.pet-card').count(),4);
 console.log('PASS corrupted storage recovers without breaking recommendation flow');
 const blocked=await browser.newContext();await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Access denied','SecurityError');}}));
 const blockedPage=await blocked.newPage();await blockedPage.goto(url);await fill(blockedPage);await submit(blockedPage);assert.equal(await blockedPage.locator('.pet-card').count(),4);assert.ok((await blockedPage.locator('#storage-status').textContent()).includes('could not be saved'));await blocked.close();
 console.log('PASS denied localStorage keeps app usable with session history');
 await page.setViewportSize({width:375,height:812});await fill(page);await submit(page);await page.getByRole('checkbox').nth(0).check();await page.getByRole('checkbox').nth(1).check();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.screenshot({path:qaDir+'/pet-mobile.png',fullPage:true});
 await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:qaDir+'/pet-desktop.png',fullPage:true});
 await page.goto(origin+'/');assert.equal(await page.getByRole('link',{name:'Try the app'}).count(),1);
 await page.screenshot({path:qaDir+'/portfolio-desktop.png',fullPage:true});
 await page.setViewportSize({width:375,height:812});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:qaDir+'/portfolio-mobile.png',fullPage:true});
 console.log('PASS portfolio and app mobile layouts have no page overflow');
 assert.deepEqual(errors,[]);console.log('PASS no browser JavaScript errors');await browser.close();
})().catch(error=>{console.error(error);process.exit(1);});
