import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Bill, MonthlyComparison } from '../types';
import { generateUniqueId } from '../utils/helpers';
import { calculateConceptAwards, type ConceptAward } from '../utils/conservationPoints';

interface BillContextType {
  bills: Bill[];
  addBill: (bill: Omit<Bill, 'id'>) => void;
  getMonthlyComparison: (month: number, year: number) => MonthlyComparison | null;
  getLatestBill: () => Bill | null;
  awards: ConceptAward[];
  hypotheticalPoints: number;
}
const BillContext = createContext<BillContextType | null>(null);
export const useBills = () => {
  const ctx = useContext(BillContext);
  if (!ctx) throw new Error('useBills requires BillProvider');
  return ctx;
};
export function BillProvider({children}: {children: ReactNode}) {
  const [bills,setBills] = useState<Bill[]>(() => {
    try {
      const data: unknown = JSON.parse(localStorage.getItem('dewaecov2_bills') || '[]');
      if (!Array.isArray(data)) return [];
      return data.filter((v): v is Bill => !!v && typeof v === 'object' && typeof v.id === 'string' &&
        Number.isInteger(v.month) && v.month >= 0 && v.month < 12 && Number.isInteger(v.year) &&
        Number.isFinite(v.waterUsage) && v.waterUsage >= 0 && Number.isFinite(v.energyUsage) && v.energyUsage >= 0 &&
        Number.isFinite(v.waterCost) && v.waterCost >= 0 && Number.isFinite(v.energyCost) && v.energyCost >= 0);
    } catch {return []}
  });
  useEffect(()=>{try{localStorage.setItem('dewaecov2_bills',JSON.stringify(bills))}catch{/*local-only demo*/}},[bills]);
  const awards=calculateConceptAwards(bills);
  const hypotheticalPoints=awards.reduce((sum,a)=>sum+a.total,0);
  const addBill=(newBill: Omit<Bill,'id'>) => {
    if (!Number.isInteger(newBill.month) || newBill.month<0 || newBill.month>11 || !Number.isInteger(newBill.year) ||
      [newBill.waterUsage,newBill.energyUsage,newBill.waterCost,newBill.energyCost].some(x=>!Number.isFinite(x)||x<0) ||
      newBill.source!=='scan' || !newBill.accountId?.trim()) throw new Error('A scanned and reviewed bill needs valid fields and account identifier.');
    const item={...newBill,id:generateUniqueId()};
    setBills(prev=>[item,...prev.filter(b=>!(b.month===item.month && b.year===item.year && b.accountId===item.accountId))]);
  };
  const getMonthlyComparison=(month: number,year: number): MonthlyComparison | null=>{
    const current=bills.find(b=>b.month===month&&b.year===year);if(!current)return null;
    const dt=new Date(Date.UTC(year,month-1,1));
    const previous=bills.find(b=>b.year===dt.getUTCFullYear()&&b.month===dt.getUTCMonth()&&b.accountId===current.accountId);
    const percent=(a:number,b:number)=>b>0?(a-b)/b*100:0;
    return {currentMonth:current,previousMonth:previous||null,
      waterChange:previous?percent(current.waterUsage,previous.waterUsage):0,
      energyChange:previous?percent(current.energyUsage,previous.energyUsage):0,
      pointsEarned:awards.find(a=>a.billId===current.id)?.total??0};
  };
  const getLatestBill=()=>[...bills].sort((a,b)=>b.year-a.year||b.month-a.month)[0]||null;
  return <BillContext.Provider value={{bills,addBill,getMonthlyComparison,getLatestBill,awards,hypotheticalPoints}}>{children}</BillContext.Provider>;
}
