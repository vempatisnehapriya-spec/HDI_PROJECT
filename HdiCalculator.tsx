/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { HelpCircle, Equal, Sparkles } from 'lucide-react';

export default function HdiCalculator() {
  const [le, setLe] = useState<number>(75);
  const [es, setEs] = useState<number>(12);
  const [ms, setMs] = useState<number>(8);
  const [gni, setGni] = useState<number>(15000);

  // Math indices
  const clampedLE = Math.max(20, Math.min(85, le));
  const clampedES = Math.max(0, Math.min(18, es));
  const clampedMS = Math.max(0, Math.min(15, ms));
  const clampedGNI = Math.max(100, Math.min(75000, gni));

  const lei = (clampedLE - 20) / (85 - 20);
  const eysi = clampedES / 18;
  const mysi = clampedMS / 15;
  const ei = (eysi + mysi) / 2;
  const ii = (Math.log(clampedGNI) - Math.log(100)) / (Math.log(75000) - Math.log(100));
  const hdiValue = Math.pow(lei * ei * ii, 1 / 3);

  // Determine category
  let category = 'Low';
  let categoryColor = 'text-rose-400 bg-rose-950/50 border border-rose-800';
  if (hdiValue >= 0.800) {
    category = 'Very High';
    categoryColor = 'text-emerald-400 bg-emerald-950/50 border border-emerald-800';
  } else if (hdiValue >= 0.700) {
    category = 'High';
    categoryColor = 'text-indigo-400 bg-indigo-950/50 border border-indigo-800';
  } else if (hdiValue >= 0.550) {
    category = 'Medium';
    categoryColor = 'text-amber-400 bg-amber-950/50 border border-amber-800';
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-8">
      {/* Introduction */}
      <div>
        <h3 className="font-sans font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-wider">
          <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
          Interactive UNDP HDI Formula Laboratory
        </h3>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          The Human Development Index (HDI) is a summary measure of average achievement in key dimensions of human development: a long and healthy life, being knowledgeable, and a decent standard of living. Follow the step-by-step math below.
        </p>
      </div>

      {/* Simulator Panel */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Sliders in mini-format */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Life Expectancy</span>
            <span className="font-mono text-indigo-600 font-bold">{le} yrs</span>
          </div>
          <input
            type="range"
            min="20"
            max="85"
            value={le}
            onChange={(e) => setLe(Number(e.target.value))}
            className="w-full accent-indigo-600 scale-95"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Expected Schooling</span>
            <span className="font-mono text-indigo-600 font-bold">{es} yrs</span>
          </div>
          <input
            type="range"
            min="0"
            max="18"
            step="0.5"
            value={es}
            onChange={(e) => setEs(Number(e.target.value))}
            className="w-full accent-indigo-600 scale-95"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Mean Schooling</span>
            <span className="font-mono text-indigo-600 font-bold">{ms} yrs</span>
          </div>
          <input
            type="range"
            min="0"
            max="15"
            step="0.5"
            value={ms}
            onChange={(e) => setMs(Number(e.target.value))}
            className="w-full accent-indigo-600 scale-95"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>GNI per Capita (PPP)</span>
            <span className="font-mono text-indigo-600 font-bold">${gni.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="100"
            max="75000"
            step="500"
            value={gni}
            onChange={(e) => setGni(Number(e.target.value))}
            className="w-full accent-indigo-600 scale-95"
          />
        </div>
      </div>

      {/* Step by Step Math */}
      <div className="space-y-6">
        {/* Step 1: Health Index */}
        <div className="border border-slate-100 rounded-xl p-4 bg-white/50 space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide font-mono">Step 1 — Long and Healthy Life</span>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-mono font-bold px-2 py-0.5 rounded border border-indigo-100">
              LEI = {lei.toFixed(4)}
            </span>
          </div>
          <h4 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wide">Life Expectancy Index (LEI)</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Measures longevity based on a minimum value of 20 years and a maximum value of 85 years.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-700 flex flex-wrap items-center gap-1.5">
            <span>LEI =</span>
            <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">(Life Expectancy - 20)</span>
            <span>/</span>
            <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">(85 - 20)</span>
            <span>=</span>
            <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">({clampedLE} - 20)</span>
            <span>/</span>
            <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">65</span>
            <Equal className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-indigo-600">{lei.toFixed(4)}</span>
          </div>
        </div>

        {/* Step 2: Education Index */}
        <div className="border border-slate-100 rounded-xl p-4 bg-white/50 space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide font-mono">Step 2 — Knowledge Dimensions</span>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-mono font-bold px-2 py-0.5 rounded border border-indigo-100">
              EI = {ei.toFixed(4)}
            </span>
          </div>
          <h4 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wide">Education Index (EI)</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Combines two indices: Expected Years of Schooling (normalized by 18 yrs max) and Mean Years of Schooling (normalized by 15 yrs max).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-700">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Expected Schooling Index (EYSI)</span>
              <div>EYSI = {clampedES} / 18 = <span className="font-bold text-indigo-600">{eysi.toFixed(4)}</span></div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Mean Schooling Index (MYSI)</span>
              <div>MYSI = {clampedMS} / 15 = <span className="font-bold text-indigo-600">{mysi.toFixed(4)}</span></div>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-700 flex flex-wrap items-center gap-1.5">
            <span>EI =</span>
            <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">(EYSI + MYSI)</span>
            <span>/</span>
            <span>2</span>
            <span>=</span>
            <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">({eysi.toFixed(4)} + {mysi.toFixed(4)})</span>
            <span>/</span>
            <span>2</span>
            <Equal className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-indigo-600">{ei.toFixed(4)}</span>
          </div>
        </div>

        {/* Step 3: Income Index */}
        <div className="border border-slate-100 rounded-xl p-4 bg-white/50 space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide font-mono">Step 3 — Decent Standard of Living</span>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-mono font-bold px-2 py-0.5 rounded border border-indigo-100">
              II = {ii.toFixed(4)}
            </span>
          </div>
          <h4 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wide">Income Index (II)</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Uses natural logarithm of GNI per Capita to reflect the diminishing marginal utility of income. Normalized with a min of $100 and a max of $75,000 PPP.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-700 flex flex-wrap items-center gap-1.5 leading-loose">
            <span>II =</span>
            <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">[ln(GNI) - ln(100)]</span>
            <span>/</span>
            <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">[ln(75,000) - ln(100)]</span>
            <br className="md:hidden" />
            <span>=</span>
            <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">[ln({clampedGNI}) - 4.6052]</span>
            <span>/</span>
            <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">[11.2252 - 4.6052]</span>
            <br className="md:hidden" />
            <span>=</span>
            <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">{(Math.log(clampedGNI) - Math.log(100)).toFixed(4)}</span>
            <span>/</span>
            <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">6.6201</span>
            <Equal className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-indigo-600">{ii.toFixed(4)}</span>
          </div>
        </div>

        {/* Step 4: Overall HDI Value */}
        <div className="border border-slate-800 rounded-xl p-5 bg-slate-900 text-white space-y-4 shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide font-mono">Step 4 — Final Aggregation</span>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${categoryColor}`}>
              {category} Development
            </span>
          </div>
          <h4 className="font-sans font-bold text-white text-xs uppercase tracking-wider">Human Development Index (Geometric Mean)</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            The final HDI value is computed as the geometric mean of the health, education, and income indices.
          </p>
          <div className="bg-slate-800 rounded-lg p-4 text-xs font-mono text-slate-300 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span>HDI =</span>
              <span className="bg-slate-700 px-1.5 py-0.5 rounded text-white">(LEI * EI * II) ^ (1/3)</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-slate-200">
              <span>HDI =</span>
              <span>({lei.toFixed(4)} * {ei.toFixed(4)} * {ii.toFixed(4)}) ^ (1/3)</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-slate-100">
              <span>HDI =</span>
              <span>({(lei * ei * ii).toFixed(6)}) ^ (1/3)</span>
              <Equal className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-indigo-400 font-extrabold text-base font-sans">{hdiValue.toFixed(4)}</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 italic">
            *This mathematical calculation is a deterministic international standard set by the United Nations Development Programme (UNDP). It acts as the exact theoretical benchmark for our machine learning model.
          </p>
        </div>
      </div>
    </div>
  );
}
