import test from 'node:test';
import assert from 'node:assert/strict';
import { addHistory, cleanHistory, readHistory, writeHistory, clearHistory, HISTORY_LIMIT, STORAGE_KEY } from '../src/history.js';
const profile={space:'large',minutes:180,monthly:300,setup:1000,housing:'yes',allergies:'no',activity:'active',experience:'experienced',backup:'yes'};
const now=new Date('2026-10-04T01:00:00Z'); const entry={profile,savedAt:now.toISOString()};
function memoryStorage(){const map=new Map();return {getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value),removeItem:key=>map.delete(key)};}
test('empty storage starts without warning',()=>assert.deepEqual(readHistory(memoryStorage()),{entries:[],warning:''}));
test('repeat searches move to front without duplicates',()=>{
  let entries=addHistory([],profile,now);entries=addHistory(entries,{...profile,minutes:200},now);entries=addHistory(entries,{...profile,minutes:'180.0'},now);assert.equal(entries.length,2);assert.equal(entries[0].profile.minutes,180);
});
test('history capped at ten, drops oldest distinct entry',()=>{
  let entries=[];for(let i=0;i<20;i++)entries=addHistory(entries,{...profile,minutes:180+i},now);assert.equal(entries.length,HISTORY_LIMIT);assert.equal(entries[0].profile.minutes,199);assert.equal(entries.at(-1).profile.minutes,190);
});
test('invalid profiles or timestamps never pollute history',()=>{
  assert.deepEqual(addHistory([entry],{...profile,minutes:''},now),[entry]);assert.deepEqual(addHistory([entry],profile,new Date('invalid')),[entry]);
});
test('untrusted entries skipped; extra properties discarded',()=>{
  const dirty=[null,{}, {profile,savedAt:'invalid'}, {profile:{...profile,space:'<script>'},savedAt:now.toISOString()}, {...entry,html:'<img src=x>',profile:{...profile,extra:'injection'}},entry];assert.deepEqual(cleanHistory(dirty),[entry]);assert.deepEqual(cleanHistory({}),[]);
});
test('invalid JSON and malformed structures recover safely',()=>{
  for(const value of ['{broken','null','{}','[null]','[{"savedAt":"invalid"}]']){const storage=memoryStorage();storage.setItem(STORAGE_KEY,value);const result=readHistory(storage);assert.deepEqual(result.entries,[]);assert.ok(result.warning);}
});
test('mixed saved data retains valid entries with warning',()=>{
  const storage=memoryStorage();storage.setItem(STORAGE_KEY,JSON.stringify([entry,null]));assert.deepEqual(readHistory(storage).entries,[entry]);assert.ok(readHistory(storage).warning);
});
test('denied storage and quota failures are nonfatal',()=>{
  const denied={getItem(){throw Error('denied');},setItem(){throw Error('quota');},removeItem(){throw Error('denied');}};assert.ok(readHistory(denied).warning);assert.ok(writeHistory(denied,[entry]));assert.ok(clearHistory(denied));assert.ok(readHistory(null).warning);
});
test('save, reload and clear preserve expected state',()=>{
  const storage=memoryStorage();assert.equal(writeHistory(storage,[entry]),'');assert.deepEqual(readHistory(storage),{entries:[entry],warning:''});assert.equal(clearHistory(storage),'');assert.equal(storage.getItem(STORAGE_KEY),null);assert.deepEqual(readHistory(storage).entries,[]);
});
test('history operations never mutate existing objects',()=>{
  const frozen=Object.freeze([Object.freeze({profile:Object.freeze({...profile}),savedAt:now.toISOString()})]);addHistory(frozen,{...profile,minutes:300},now);assert.deepEqual(frozen,[entry]);
});
