import { Award } from 'lucide-react';
export default function PointsSummary({hypotheticalPoints}: {hypotheticalPoints: number}) {
  return <section className="bg-gradient-to-r from-teal-700 to-cyan-700 rounded-xl shadow-lg p-6 text-white">
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div><h2 className="text-xl font-bold mb-1">Conservation concept points</h2>
        <p className="text-teal-100 text-sm">+10 if water consumption decreases; +10 if electricity consumption decreases, compared with a prior consecutive scanned bill for the same entered account.</p>
        <p className="mt-2 text-xs text-teal-100">Demonstration only · no verified bills · no official DEWA rewards · no cash value</p></div>
      <div className="flex items-center gap-2 bg-white/15 rounded-xl px-5 py-3"><Award className="w-6 h-6"/><strong className="text-3xl">{hypotheticalPoints}</strong><span className="text-sm">simulated points</span></div>
    </div>
  </section>;
}
