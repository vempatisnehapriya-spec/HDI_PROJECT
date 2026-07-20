/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ModelStats, HdiCategory } from '../types.ts';
import { Cpu, ShieldAlert, BarChart3, TrendingUp, Grid3X3, Layers } from 'lucide-react';

interface ModelEvaluationProps {
  modelStats: ModelStats;
  treeRoot: any;
}

export default function ModelEvaluation({ modelStats, treeRoot }: ModelEvaluationProps) {
  const { trainAccuracy, testAccuracy, featureImportances, confusionMatrix, treeDepth, totalSamples } = modelStats;

  // Let's find the max feature importance value to scale the bars
  const maxImportance = Math.max(...featureImportances.map(f => f.importance), 0.01);

  // Render a simple recursive nested visualizer for the Decision Tree
  const renderTreeNode = (node: any, path = 'Root', depth = 1): React.ReactNode => {
    if (!node) return null;

    const isLeaf = node.feature === undefined;

    if (isLeaf) {
      return (
        <div className="bg-indigo-50/70 border border-indigo-200 rounded-lg p-3 text-center min-w-44 shadow-xs">
          <span className="text-[9px] uppercase font-bold tracking-wider text-indigo-600 font-mono">Leaf Node</span>
          <div className="font-sans font-bold text-slate-900 text-xs mt-1">
            {node.category}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            Samples: {node.samples}
          </div>
        </div>
      );
    }

    const featureLabels: Record<string, string> = {
      lifeExpectancy: 'Life Expectancy',
      expectedSchooling: 'Expected Schooling',
      meanSchooling: 'Mean Schooling',
      gniPerCapita: 'GNI per Capita',
    };

    return (
      <div className="flex flex-col items-center">
        {/* Current Split Node */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs text-center min-w-52 relative">
          <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono">Depth {depth}</span>
          <div className="font-sans font-bold text-slate-800 text-xs mt-1">
            {featureLabels[node.feature] || node.feature}
          </div>
          <div className="text-xs font-mono text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded inline-block mt-1">
            &lt;= {node.threshold}
          </div>
          <div className="text-[9px] text-slate-400 font-mono mt-1">
            Gain: {node.gain} | Samples: {node.samples}
          </div>
        </div>

        {/* Draw connectors if we haven't reached too deep */}
        {depth < 3 && (
          <div className="flex justify-between w-full max-w-lg mt-4 relative">
            {/* Left Child (True/Left branch) */}
            <div className="flex flex-col items-center w-1/2 pr-2 border-r border-dashed border-slate-200">
              <span className="text-[10px] font-mono font-bold text-slate-500 mb-2">
                &lt;= {node.threshold}
              </span>
              {renderTreeNode(node.left, 'Left', depth + 1)}
            </div>

            {/* Right Child (False/Right branch) */}
            <div className="flex flex-col items-center w-1/2 pl-2">
              <span className="text-[10px] font-mono font-bold text-slate-500 mb-2">
                &gt; {node.threshold}
              </span>
              {renderTreeNode(node.right, 'Right', depth + 1)}
            </div>
          </div>
        )}

        {depth >= 3 && (
          <div className="text-[10px] text-slate-400 italic mt-1.5 font-medium">
            [Tree continues down to depth {treeDepth}...]
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Test Accuracy */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Test Accuracy</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-3xl font-sans font-extrabold text-slate-900">
            {(testAccuracy * 100).toFixed(1)}%
          </h3>
          <p className="text-[10px] leading-relaxed text-slate-500 mt-1">
            Accuracy evaluated on 20% unseen test data split.
          </p>
        </div>

        {/* Train Accuracy */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Train Accuracy</span>
            <ShieldAlert className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="text-3xl font-sans font-extrabold text-slate-900">
            {(trainAccuracy * 100).toFixed(1)}%
          </h3>
          <p className="text-[10px] leading-relaxed text-slate-500 mt-1">
            Performance of classifier on training dataset.
          </p>
        </div>

        {/* Tree Depth */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tree Depth</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="text-3xl font-sans font-extrabold text-slate-900">
            {treeDepth}
          </h3>
          <p className="text-[10px] leading-relaxed text-slate-500 mt-1">
            Max consecutive nodes allowed from root to leaf.
          </p>
        </div>

        {/* Total Training size */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dataset Size</span>
            <Cpu className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="text-3xl font-sans font-extrabold text-slate-900">
            {totalSamples}
          </h3>
          <p className="text-[10px] leading-relaxed text-slate-500 mt-1">
            Total historical country data rows analyzed.
          </p>
        </div>
      </div>

      {/* Feature Importances & Confusion Matrix Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h4 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <BarChart3 className="w-4 h-4 text-indigo-600 shrink-0" />
            Decision Tree Feature Importance Weights
          </h4>
          <p className="text-xs leading-relaxed text-slate-500 mb-6">
            Importance represents the normalized reduction in Gini Impurity (Gini Gain) contributed by splits on that indicator across the tree.
          </p>

          <div className="space-y-5">
            {featureImportances.map((feat) => {
              const widthPct = (feat.importance / maxImportance) * 100;
              return (
                <div key={feat.feature} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">{feat.label}</span>
                    <span className="font-mono text-slate-500">{(feat.importance * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-lg overflow-hidden relative">
                    <div
                      className="h-full bg-indigo-600 rounded-lg transition-all duration-700"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Confusion Matrix (Heatmap) */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h4 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Grid3X3 className="w-4 h-4 text-indigo-600 shrink-0" />
            Evaluation Confusion Matrix (Test Split)
          </h4>
          <p className="text-xs leading-relaxed text-slate-500 mb-4">
            Compares true country classifications (rows) with decision tree model predictions (columns). Highlighted diagonal boxes indicate correct predictions.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr>
                  <th className="p-2"></th>
                  <th colSpan={4} className="p-2 border-b border-slate-200 text-center font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                    Predicted Class
                  </th>
                </tr>
                <tr className="border-b border-slate-200">
                  <th className="p-2 text-left font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Actual Class</th>
                  {confusionMatrix.labels.map(l => (
                    <th key={l} className="p-2 text-center font-bold text-slate-800 w-24">
                      {l}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {confusionMatrix.labels.map((rowLabel, rIdx) => (
                  <tr key={rowLabel} className="border-b border-slate-100">
                    <td className="p-2 font-bold text-slate-800 text-left bg-slate-50 uppercase tracking-wider text-[9px] w-24">
                      {rowLabel}
                    </td>
                    {confusionMatrix.labels.map((colLabel, cIdx) => {
                      const count = confusionMatrix.matrix[rIdx][cIdx];
                      const isCorrect = rIdx === cIdx;
                      const opacity = count > 0 ? Math.min(1.0, 0.2 + (count * 0.15)) : 0;

                      return (
                        <td
                          key={colLabel}
                          className="p-3 text-center text-sm transition-all"
                          style={{
                            backgroundColor: count > 0 ? (isCorrect ? `rgba(79, 70, 229, ${opacity})` : `rgba(239, 68, 68, ${opacity})`) : 'transparent',
                            color: count > 0 ? (isCorrect ? '#312e81' : '#991b1b') : '#94a3b8',
                            fontWeight: count > 0 ? 'bold' : 'normal'
                          }}
                        >
                          {count}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Graphical Tree Schema Visualizer */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm overflow-x-auto">
        <h4 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Cpu className="w-4 h-4 text-indigo-600 shrink-0" />
          Trained Classification Tree Graph
        </h4>
        <p className="text-xs leading-relaxed text-slate-500 mb-6">
          Interactive schematic showing node thresholds and decision splits. Click Predict HDI on the input panel to see active paths highlighted on the predictor report!
        </p>

        <div className="flex justify-center p-4 min-w-[650px]">
          {treeRoot ? (
            renderTreeNode(treeRoot)
          ) : (
            <div className="text-xs text-slate-400 font-mono italic">No decision tree loaded.</div>
          )}
        </div>
      </div>
    </div>
  );
}
