import { useEffect, useState } from 'react';
import { Camera, FileImage, ShieldAlert, Receipt, Droplets, LockKeyhole, Trash2 } from 'lucide-react';
import { useBills } from '../context/BillContext';
import { parsePurchaseReceipt, parseUtilityBill, waterToLitres, type WaterUnit } from '../utils/documentParsing';
import { readEvidence, saveEvidence, fingerprintFile, recognizeImage, ensureUniqueEvidence, type EvidenceRecord, type EvidenceType } from '../utils/documentWorkflow';

const months = 'January February March April May June July August September October November December'.split(' ');
const num = (s: string) => s.trim() === '' ? NaN : Number(s);
const fmt = (v: number) => Number.isFinite(v) ? v.toLocaleString(undefined, {maximumFractionDigits: 2}) : '—';

export default function EvidenceCenter() {
  const { addBill } = useBills();
  const [kind, setKind] = useState<EvidenceType>('bill');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [records, setRecords] = useState<EvidenceRecord[]>(readEvidence);
  const [accountId, setAccountId] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [water, setWater] = useState('');
  const [waterUnit, setWaterUnit] = useState<WaterUnit | ''>('');
  const [energy, setEnergy] = useState('');
  const [waterCost, setWaterCost] = useState('');
  const [energyCost, setEnergyCost] = useState('');
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [product, setProduct] = useState('');
  const [ocrWarnings, setOcrWarnings] = useState<string[]>([]);

  useEffect(() => {
    if (!file) { setPreview(''); return; }
    const link = URL.createObjectURL(file);
    setPreview(link);
    return () => URL.revokeObjectURL(link);
  }, [file]);
  function resetFor(kindNext: EvidenceType) {
    setKind(kindNext); setFile(null); setText(''); setMessage(''); setError('');setOcrWarnings([]);
    setAccountId('');setMonth('');setYear('');setWater('');setWaterUnit('');setEnergy('');setWaterCost('');setEnergyCost('');
    setMerchant('');setAmount('');setReceiptNumber('');setProduct('');
  }
  async function scan() {
    if (!file) { setError('Choose a photo first.'); return; }
    setBusy(true); setError('');setMessage('');setOcrWarnings([]);
    try {
      const recognized = await recognizeImage(file, setProgress);
      if (!recognized.trim()) throw new Error('No text recognized. Use a clearer, well-lit image.');
      setText(recognized);
      if (kind === 'bill') {
        const parsed = parseUtilityBill(recognized);
        setMonth(parsed.month === undefined ? '' : String(parsed.month));
        setYear(parsed.year === undefined ? '' : String(parsed.year));
        setWater(parsed.waterOriginalValue === undefined ? '' : String(parsed.waterOriginalValue));
        setWaterUnit(parsed.waterUnit || '');
        setEnergy(parsed.energyUsageKwh === undefined ? '' : String(parsed.energyUsageKwh));
        setWaterCost(parsed.waterCostAed === undefined ? '' : String(parsed.waterCostAed));
        setEnergyCost(parsed.energyCostAed === undefined ? '' : String(parsed.energyCostAed));
        setOcrWarnings(parsed.warnings);
      } else {
        const parsed = parsePurchaseReceipt(recognized);
        setMerchant(parsed.merchant ?? '');
        setAmount(parsed.amountAed === undefined ? '' : String(parsed.amountAed));
        setReceiptNumber(parsed.receiptNumber ?? '');
        setOcrWarnings(parsed.warnings);
      }
      setMessage('Text extracted. Review every field carefully: OCR can confuse digits, labels and units.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Image scanning failed.'); }
    finally { setBusy(false);setProgress(''); }
  }
  async function save() {
    setError('');setMessage('');
    if (!file || !text.trim()) { setError('Scan a document photo before submitting.'); return; }
    let bill: EvidenceRecord['bill']; let receipt: EvidenceRecord['receipt'];
    if (kind === 'bill') {
      const m = Number(month), y = Number(year);
      const values = [water,energy,waterCost,energyCost].map(num);
      if (!accountId.trim() || month === '' || !Number.isInteger(m) || m < 0 || m > 11 ||
          year === '' || !Number.isInteger(y) || y < 2000 || y > 2100 ||
          !waterUnit || values.some(v => !Number.isFinite(v) || v < 0)) {
        setError('Complete the month, year, unit, usage amounts and costs with valid nonnegative numbers.');return;
      }
      bill = { month:m, year:y, accountId:accountId.trim(), waterLitres:waterToLitres(values[0],waterUnit), energyKwh:values[1], waterCostAed:values[2], energyCostAed:values[3] };
      if (records.some(r => r.kind === 'bill' && r.bill?.year === y && r.bill?.month === m && r.bill?.accountId === accountId.trim())) {
        setError('A photo for this billing month was already submitted on this device.');return;
      }
    } else {
      const total = num(amount);
      if (!merchant.trim() || !receiptNumber.trim() || !product.trim() || !Number.isFinite(total) || total < 0) {
        setError('Complete the merchant, receipt number, purchased product and total.');return;
      }
      receipt = {merchant:merchant.trim(),totalAed:total,receiptNumber:receiptNumber.trim(),purchasedProduct:product.trim()};
      if (records.some(r => r.kind === 'receipt' && r.receipt?.receiptNumber.toLowerCase() === receipt?.receiptNumber.toLowerCase() && r.receipt?.merchant.toLowerCase() === receipt?.merchant.toLowerCase())) {
        setError('A receipt with this merchant and number is already submitted on this device.');return;
      }
    }
    try {
      const fingerprint = await fingerprintFile(file);
      ensureUniqueEvidence(records, fingerprint);
      const record: EvidenceRecord = {
        id: crypto.randomUUID(), fingerprint,kind,createdAt:new Date().toISOString(),
        status:'pending_review',note:'Local prototype submission; authenticity and ownership are not verified.',
        ...(bill ? {bill} : {}),...(receipt ? {receipt}:{}),
      };
      const updated = [record,...records];saveEvidence(updated);setRecords(updated);
      if(bill) addBill({month:bill.month,year:bill.year,waterUsage:bill.waterLitres,waterCost:bill.waterCostAed,energyUsage:bill.energyKwh,energyCost:bill.energyCostAed,accountId:bill.accountId,source:'scan'});
      setFile(null);setText('');setOcrWarnings([]);
      setMessage('Saved as PENDING REVIEW for local demonstration. Only hypothetical points may display on the dashboard after consecutive reductions; no redeemable rewards were awarded. The photo itself was not stored.');
    } catch(e) {setError(e instanceof Error ? e.message : 'Unable to save submission.');}
  }
  function clearEvidence() {
    if (!window.confirm('Clear all local evidence records? This will not clear your tracking entries.')) return;
    saveEvidence([]);setRecords([]);setMessage('Local evidence list cleared.');
  }
  const inputClass='w-full border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-900';
  return <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="flex items-center gap-3 mb-3"><Camera className="w-7 h-7 text-teal-700"/><h1 className="text-3xl font-bold text-slate-800">Document Scan & Review</h1></div>
    <p className="text-slate-600 mb-5">Photograph a utility bill or sustainable purchase receipt. OCR fills in fields for review. Submissions stay <strong>pending</strong> — a photo cannot independently prove authenticity, and this prototype never issues redeemable DEWA points.</p>
    <div className="p-4 mb-6 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-900 flex gap-3"><ShieldAlert className="w-5 h-5 flex-shrink-0"/><div><strong>Privacy and security:</strong> Images are processed by the browser OCR worker, and only the reviewed numeric data, submission metadata, and a file fingerprint are saved to this browser's local storage. The original image is not stored or sent to a server. This is <strong>not</strong> a secure multi-user rewards backend. Avoid using real account-identifying documents on shared computers.</div></div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex gap-2 mb-5" role="group" aria-label="Document type">
          <button className={'px-4 py-2 rounded-md text-sm font-semibold '+(kind==='bill'?'bg-teal-600 text-white':'bg-slate-100 text-slate-700')} onClick={()=>resetFor('bill')}><Droplets className="w-4 h-4 inline mr-1"/>Utility bill</button>
          <button className={'px-4 py-2 rounded-md text-sm font-semibold '+(kind==='receipt'?'bg-teal-600 text-white':'bg-slate-100 text-slate-700')} onClick={()=>resetFor('receipt')}><Receipt className="w-4 h-4 inline mr-1"/>Purchase receipt</button>
        </div>
        <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="evidence-photo">Photo (JPG, PNG, WEBP or BMP, maximum 10 MB)</label>
        <input id="evidence-photo" type="file" accept="image/png,image/jpeg,image/webp,image/bmp" capture="environment" className={inputClass} onChange={e=>{setFile(e.target.files?.[0] ?? null);setText('');setError('');setMessage('');setOcrWarnings([]);}}/>
        {preview&&<img className="my-4 max-h-64 max-w-full rounded-lg border border-slate-200 object-contain" src={preview} alt="Your document preview"/>}
        <button type="button" onClick={scan} disabled={!file||busy} className="mt-4 px-4 py-2 bg-teal-700 text-white font-semibold rounded-lg disabled:opacity-50 flex items-center gap-2"><FileImage className="w-4 h-4"/>{busy?(progress||'Reading photo…'):'Scan photo with OCR'}</button>
        <p className="text-xs mt-2 text-slate-500">English-text OCR via Tesseract.js; model files may need downloading on first use. PDFs and Arabic-only scans are not supported in this version.</p>
        {!!ocrWarnings.length&&<ul className="mt-3 px-4 list-disc text-sm text-amber-800">{ocrWarnings.map((w,i)=><li key={i}>{w}</li>)}</ul>}
        {error&&<p role="alert" className="mt-4 text-sm bg-red-50 border border-red-200 text-red-800 p-3 rounded-md">{error}</p>}
        {message&&<p role="status" className="mt-4 text-sm bg-teal-50 border border-teal-200 text-teal-800 p-3 rounded-md">{message}</p>}
      </section>
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-1">Review extracted details</h2>
        <p className="text-sm text-slate-500 mb-4">Correct misread details for personal tracking. Corrections never count as proof or unlock points.</p>
        {!text&&<div className="rounded-lg bg-slate-50 p-5 text-sm text-slate-600">Scan an image on the left to populate this form.</div>}
        {text&& <div className="space-y-3">
          {kind==='bill'?<>
            <label className="text-sm block">Account identifier (unverified; required for month-to-month comparison)<input className={inputClass} value={accountId} onChange={e=>setAccountId(e.target.value)} autoComplete="off"/></label>
            <div className="grid grid-cols-2 gap-3"><label className="text-sm">Billing month<select className={inputClass} value={month} onChange={e=>setMonth(e.target.value)}><option value="">Select month</option>{months.map((m,i)=><option key={m} value={i}>{m}</option>)}</select></label>
              <label className="text-sm">Billing year<input type="number" className={inputClass} min="2000" max="2100" value={year} onChange={e=>setYear(e.target.value)} placeholder="2026"/></label></div>
            <div className="grid grid-cols-2 gap-3"><label className="text-sm">Water quantity<input type="number" className={inputClass} min="0" step="any" value={water} onChange={e=>setWater(e.target.value)}/></label>
              <label className="text-sm">Water unit<select className={inputClass} value={waterUnit} onChange={e=>setWaterUnit(e.target.value as WaterUnit | '')}><option value="">Select unit</option><option value="m3">m³ (DEWA since March 2025)</option><option value="L">Litres</option><option value="IG">Imperial gallons</option><option value="USgal">US gallons</option></select></label></div>
            {waterUnit && Number.isFinite(num(water))&& <p className="text-xs text-sky-800 bg-sky-50 rounded p-2">Normalized water usage: {fmt(waterToLitres(num(water),waterUnit))} L ({fmt(waterToLitres(num(water),waterUnit)/1000)} m³)</p>}
            <label className="text-sm block">Electricity usage (kWh)<input type="number" className={inputClass} min="0" step="any" value={energy} onChange={e=>setEnergy(e.target.value)}/></label>
            <div className="grid grid-cols-2 gap-3"><label className="text-sm">Water charges (AED)<input type="number" className={inputClass} min="0" step="any" value={waterCost} onChange={e=>setWaterCost(e.target.value)}/></label>
              <label className="text-sm">Electricity charges (AED)<input type="number" className={inputClass} min="0" step="any" value={energyCost} onChange={e=>setEnergyCost(e.target.value)}/></label></div>
          </>:<>
            <label className="text-sm block">Merchant<input className={inputClass} value={merchant} onChange={e=>setMerchant(e.target.value)} /></label>
            <label className="text-sm block">Receipt/invoice number<input className={inputClass} value={receiptNumber} onChange={e=>setReceiptNumber(e.target.value)} /></label>
            <label className="text-sm block">Total (AED)<input type="number" min="0" step="any" className={inputClass} value={amount} onChange={e=>setAmount(e.target.value)} /></label>
            <label className="text-sm block">Product bought (reviewed description)<input className={inputClass} value={product} onChange={e=>setProduct(e.target.value)} placeholder="e.g. Water-saving showerhead" /></label>
          </>}
          <button type="button" onClick={save} className="w-full rounded-lg bg-teal-700 text-white font-semibold px-4 py-3">Save as pending review — no points issued</button>
        </div>}
      </section>
    </div>
    <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm mt-6">
      <div className="flex items-center justify-between gap-3 mb-3"><h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><LockKeyhole className="w-5 h-5"/> Local submissions ({records.length})</h2><button className="text-xs text-red-700 flex gap-1 items-center disabled:opacity-40" disabled={!records.length} onClick={clearEvidence}><Trash2 className="w-4 h-4"/> Clear records</button></div>
      {!records.length?<p className="text-sm text-slate-500">No submissions yet. Document photos are never kept in this browser's storage.</p>:<ul className="divide-y divide-slate-100">{records.map(r=><li key={r.id} className="py-3 flex justify-between gap-3 text-sm"><div><div className="font-semibold text-slate-800">{r.kind==='bill'?`Utility bill: ${months[r.bill?.month??0]} ${r.bill?.year}`:`Receipt: ${r.receipt?.merchant}`}</div><div className="text-slate-500 mt-1">{r.kind==='bill'?`${fmt(r.bill?.waterLitres??0)} L · ${fmt(r.bill?.energyKwh??0)} kWh`:`${r.receipt?.receiptNumber} · AED ${fmt(r.receipt?.totalAed??0)}`}</div></div><span className="shrink-0 self-start text-xs rounded-md border border-amber-200 bg-amber-50 text-amber-800 py-1 px-2">Pending review</span></li>)}</ul>}
    </section>
  </main>;
}
