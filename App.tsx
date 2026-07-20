/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { CountryData, ModelStats, DatasetStats, PredictionResult, PredictionInput } from './types.ts';
import PredictorForm from './components/PredictorForm.tsx';
import PredictionResults from './components/PredictionResults.tsx';
import ModelEvaluation from './components/ModelEvaluation.tsx';
import DatasetExplorer from './components/DatasetExplorer.tsx';
import HdiCalculator from './components/HdiCalculator.tsx';
import { Globe, Cpu, Database, Landmark, ShieldCheck, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'predictor' | 'model' | 'dataset' | 'lab'>('predictor');
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [modelStats, setModelStats] = useState<ModelStats | null>(null);
  const [treeRoot, setTreeRoot] = useState<any>(null);
  const [datasetStats, setDatasetStats] = useState<DatasetStats | null>(null);

  const [activePrediction, setActivePrediction] = useState<PredictionResult | null>(null);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  // Load all necessary dataset and model statistics on mount
  useEffect(() => {
    async function loadData() {
      setIsLoadingData(true);
      setError(null);
      try {
        const [countriesRes, modelRes, statsRes] = await Promise.all([
          fetch('/api/countries'),
          fetch('/api/model'),
          fetch('/api/stats')
        ]);

        if (!countriesRes.ok || !modelRes.ok || !statsRes.ok) {
          throw new Error('Server returned an error while loading human development profiles.');
        }

        const countriesData = await countriesRes.json();
        const modelData = await modelRes.json();
        const statsData = await statsRes.json();

        setCountries(countriesData);
        setModelStats(modelData.evaluation);
        setTreeRoot(modelData.treeRoot);
        setDatasetStats(statsData);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to sync with full-stack HDI analytics engine.');
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, []);

  // Handle Predict Trigger
  const handlePredict = async (input: PredictionInput) => {
    setIsPredicting(true);
    setError(null);
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to calculate prediction.');
      }

      const result: PredictionResult = await response.json();
      setActivePrediction(result);

      // Smooth scroll to results
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to compute simulated prediction.');
    } finally {
      setIsPredicting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <div className="inline-block relative">
            <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
            <div className="absolute inset-0 w-10 h-10 border-2 border-dashed border-indigo-500 rounded-full animate-pulse" />
          </div>
          <h2 className="font-sans font-bold text-slate-800 text-lg">
            Synergizing Human Development Dataset...
          </h2>
          <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">
            Compiling Decision Tree and initializing ML parameters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      {/* Top Professional Header Bar */}
      <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-200 shadow-sm z-10 sticky top-0">
        <div className="max-w-7xl w-full mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold shrink-0">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-sans text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
                HDI Predictor <span className="text-indigo-600">v2.1</span>
              </h1>
              <p className="hidden sm:block text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                A Comprehensive Machine Learning Classifier of Global Well-Being
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono uppercase bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Model Live • Trained on {countries.length} UNDP Records</span>
          </div>
        </div>
      </header>

      {/* Navigation Sub-Header Bar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('predictor')}
              className={`py-4 text-sm font-semibold border-b-2 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'predictor'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <Cpu className="w-4 h-4" />
              Simulated Predictor
            </button>
            <button
              onClick={() => setActiveTab('model')}
              className={`py-4 text-sm font-semibold border-b-2 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'model'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Model Performance
            </button>
            <button
              onClick={() => setActiveTab('dataset')}
              className={`py-4 text-sm font-semibold border-b-2 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'dataset'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <Database className="w-4 h-4" />
              Historical Dataset
            </button>
            <button
              onClick={() => setActiveTab('lab')}
              className={`py-4 text-sm font-semibold border-b-2 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'lab'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <Landmark className="w-4 h-4" />
              Interactive Formula Lab
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm flex items-center gap-3 shadow-xs">
            <span className="font-bold shrink-0">Error Status:</span>
            <span>{error}</span>
          </div>
        )}

        {/* Tab Router Switch */}
        {activeTab === 'predictor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input Slider Column */}
            <div className="lg:col-span-5">
              <PredictorForm countries={countries} onPredict={handlePredict} isLoading={isPredicting} />
            </div>

            {/* Prediction Output & Insights Column */}
            <div className="lg:col-span-7 space-y-6" ref={resultRef}>
              {activePrediction ? (
                <PredictionResults prediction={activePrediction} />
              ) : (
                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center min-h-[400px] flex flex-col items-center justify-center">
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-full mb-4">
                    <Cpu className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="font-sans font-bold text-slate-800 text-base">
                    Await Decision Tree Analysis
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-1 mx-auto leading-relaxed">
                    Set a simulated profile of life expectancy, schooling and wealth on the left panel, and click Predict to compile the report.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'model' && modelStats && (
          <ModelEvaluation modelStats={modelStats} treeRoot={treeRoot} />
        )}

        {activeTab === 'dataset' && datasetStats && (
          <DatasetExplorer countries={countries} datasetStats={datasetStats} />
        )}

        {activeTab === 'lab' && (
          <HdiCalculator />
        )}
      </main>

      {/* Sincere, Humble Footer matching Design */}
      <footer className="h-auto py-8 px-8 bg-slate-900 flex flex-col md:flex-row items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest font-medium gap-4">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-center md:text-left">
          <span>Architecture: CART Decision Tree Classifier</span>
          <span>Engine: Express & TypeScript bundle</span>
          <span>Dataset: 1990-2023 UNDP Records</span>
        </div>
        <div>Report ID: #HDI-9902-Z</div>
      </footer>
    </div>
  );
}
