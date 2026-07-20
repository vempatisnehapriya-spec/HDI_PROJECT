/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PredictionResult, HdiCategory } from '../types.ts';
import { Award, ShieldCheck, Cpu, ArrowRight, Lightbulb } from 'lucide-react';

interface PredictionResultsProps {
  prediction: PredictionResult;
}

// Simple custom markdown renderer to format Gemini's rich response cleanly
function CustomMarkdown({ text }: { text: string }) {
  if (!text) return null;

  // Split lines
  const lines = text.split('\n');

  return (
    <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Subheadings: ### Heading or #### Heading
        if (trimmed.startsWith('###') || trimmed.startsWith('####')) {
          const content = trimmed.replace(/^#+\s*/, '');
          return (
            <h4 key={idx} className="font-sans font-bold text-slate-800 text-sm mt-5 mb-2 border-b border-slate-100 pb-1">
              {content}
            </h4>
          );
        }

        // Bold headings: **Heading**
        if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 50) {
          const content = trimmed.replace(/\*\*/g, '');
          return (
            <h5 key={idx} className="font-sans font-semibold text-slate-800 text-xs uppercase tracking-wider mt-4">
              {content}
            </h5>
          );
        }

        // Bullet lists: - Item or * Item
        if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          const content = trimmed.substring(1).trim();
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-indigo-500 mt-1.5 shrink-0 block w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>{parseInlineBold(content)}</span>
            </div>
          );
        }

        // Numbered lists: 1. Item
        if (/^\d+\.\s/.test(trimmed)) {
          const content = trimmed.replace(/^\d+\.\s/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-slate-900 font-mono text-xs font-semibold shrink-0 mt-0.5">
                {trimmed.match(/^\d+/)![0]}.
              </span>
              <span>{parseInlineBold(content)}</span>
            </div>
          );
        }

        // Empty line
        if (!trimmed) {
          return <div key={idx} className="h-2" />;
        }

        // Regular paragraph
        return <p key={idx}>{parseInlineBold(trimmed)}</p>;
      })}
    </div>
  );
}

// Helper to render bold segments e.g. "Some **bold** word"
function parseInlineBold(line: string): React.ReactNode[] {
  const parts = line.split('**');
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index} className="font-semibold text-slate-900">{part}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

export default function PredictionResults({ prediction }: PredictionResultsProps) {
  const { predictedCategory, calculatedHdi, confidence, decisionPath, indices, aiAnalysis } = prediction;

  // Category specific styles configured for the High Density Slate/Indigo aesthetic
  const categoryConfigs: Record<HdiCategory, {
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    barColor: string;
    description: string;
  }> = {
    'Very High': {
      bg: 'bg-emerald-50/60',
      text: 'text-emerald-950',
      border: 'border-emerald-200',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      barColor: 'bg-emerald-500',
      description: 'Signifies excellent healthcare, advanced educational systems, and strong national wealth (GNI).'
    },
    'High': {
      bg: 'bg-indigo-50/40',
      text: 'text-indigo-950',
      border: 'border-indigo-200',
      badgeBg: 'bg-indigo-100 text-indigo-800',
      barColor: 'bg-indigo-500',
      description: 'Represents high development, with reliable public services but potential for inequality or historical education deficits.'
    },
    'Medium': {
      bg: 'bg-amber-50/40',
      text: 'text-amber-950',
      border: 'border-amber-200',
      badgeBg: 'bg-amber-100 text-amber-800',
      barColor: 'bg-amber-500',
      description: 'Reflects transitional developing economies. Healthcare and schools are improving but income or adult literacy limits complete capabilities.'
    },
    'Low': {
      bg: 'bg-rose-50/40',
      text: 'text-rose-950',
      border: 'border-rose-200',
      badgeBg: 'bg-rose-100 text-rose-800',
      barColor: 'bg-rose-500',
      description: 'Indicates severe shortages in basic life needs, primary school retention, healthcare reach, and macroeconomic security.'
    }
  };

  const config = categoryConfigs[predictedCategory] || categoryConfigs['Low'];

  return (
    <div className="space-y-6">
      {/* Primary Category Result Card */}
      <div className={`border ${config.border} ${config.bg} rounded-xl p-6 transition-all shadow-sm`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${config.badgeBg} shrink-0`}>
              <Award className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">
                Model Classification Result
              </span>
              <h3 className={`font-sans text-2xl font-bold mt-0.5 ${config.text}`}>
                {predictedCategory} Human Development
              </h3>
              <p className="text-sm text-slate-700 mt-1 max-w-xl">
                {config.description}
              </p>
            </div>
          </div>

          {/* Gauge Score */}
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200 p-4 rounded-xl text-center shadow-xs shrink-0 md:w-44 flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-wider">Calculated HDI</span>
            <span className="text-3xl font-sans font-extrabold text-slate-900 mt-0.5">
              {calculatedHdi.toFixed(3)}
            </span>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className={`h-full ${config.barColor} transition-all duration-1000`}
                style={{ width: `${calculatedHdi * 100}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-500 mt-1.5 font-medium">
              Theoretical range: 0.0 to 1.0
            </span>
          </div>
        </div>

        {/* Confidence rating */}
        <div className="mt-4 pt-4 border-t border-dashed border-slate-200 flex flex-wrap gap-4 justify-between items-center text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium text-slate-600">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Decision Tree Confidence:
            <span className="font-mono text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded-md font-semibold">
              {(confidence * 100).toFixed(0)}%
            </span>
          </span>
          <span className="text-slate-400 text-[10px] uppercase tracking-wide font-semibold leading-none">
            Leaf Class Purity Metric
          </span>
        </div>
      </div>

      {/* Grid of Normalized Dimension Indices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Health */}
        <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Health Index (LEI)</span>
            <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              {indices.lifeExpectancyIndex.toFixed(3)}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${indices.lifeExpectancyIndex * 100}%` }} />
          </div>
          <p className="text-[10px] leading-relaxed text-slate-400 mt-2">
            Normalized using bounds of 20 and 85 years of life expectancy.
          </p>
        </div>

        {/* Education */}
        <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Education Index (EI)</span>
            <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {indices.educationIndex.toFixed(3)}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500" style={{ width: `${indices.educationIndex * 100}%` }} />
          </div>
          <p className="text-[10px] leading-relaxed text-slate-400 mt-2">
            Geometric combination of mean (capped 15) and expected (capped 18) schooling.
          </p>
        </div>

        {/* Income */}
        <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Income Index (II)</span>
            <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
              {indices.incomeIndex.toFixed(3)}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500" style={{ width: `${indices.incomeIndex * 100}%` }} />
          </div>
          <p className="text-[10px] leading-relaxed text-slate-400 mt-2">
            Logarithmic scale normalization bounds ($100 to $75,000 PPP).
          </p>
        </div>
      </div>

      {/* Decision Tree Split Path (Machine Learning in Action) */}
      <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/70 shadow-sm">
        <h4 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-600" />
          Trained Decision Tree Node Traversals
        </h4>
        <div className="space-y-2">
          {decisionPath.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 font-mono">
              <span className="bg-slate-200 text-slate-700 w-5 h-5 rounded-full flex items-center justify-center font-bold font-sans text-[10px]">
                {idx + 1}
              </span>
              <span>{step}</span>
              {idx < decisionPath.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-slate-400" />}
            </div>
          ))}
          <div className="flex items-center gap-2 text-xs text-slate-700 font-mono mt-3 pt-2 border-t border-slate-200">
            <span className="bg-indigo-950 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold font-sans text-[10px]">
              ✓
            </span>
            <span className="font-bold">
              Predicted Class Leaf Node: <span className="text-indigo-600 underline font-extrabold">{predictedCategory}</span>
            </span>
          </div>
        </div>
      </div>

      {/* AI Deep Economic Analysis */}
      <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-50/30 rounded-full filter blur-2xl -z-10" />
        <h4 className="font-sans font-bold text-slate-800 text-sm mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 uppercase tracking-wider">
          <Lightbulb className="w-5 h-5 text-indigo-600 shrink-0" />
          Economic Insight & Strategic Policy Report
        </h4>

        {aiAnalysis ? (
          <CustomMarkdown text={aiAnalysis} />
        ) : (
          <div className="py-6 text-center text-sm text-slate-400 font-mono">
            Generating AI recommendations...
          </div>
        )}
      </div>
    </div>
  );
}
