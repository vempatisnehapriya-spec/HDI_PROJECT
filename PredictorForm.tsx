/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CountryData, PredictionInput } from '../types.ts';
import { Search, HelpCircle, RefreshCw } from 'lucide-react';

interface PredictorFormProps {
  countries: CountryData[];
  onPredict: (input: PredictionInput) => void;
  isLoading: boolean;
}

export default function PredictorForm({ countries, onPredict, isLoading }: PredictorFormProps) {
  const [lifeExpectancy, setLifeExpectancy] = useState<number>(72);
  const [expectedSchooling, setExpectedSchooling] = useState<number>(12);
  const [meanSchooling, setMeanSchooling] = useState<number>(8);
  const [gniPerCapita, setGniPerCapita] = useState<number>(14000);

  const [selectedCountryName, setSelectedCountryName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showCountryDropdown, setShowCountryDropdown] = useState<boolean>(false);

  // Filter countries for autocomplete
  const filteredCountries = countries.filter(c =>
    c.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCountrySelect = (c: CountryData) => {
    setLifeExpectancy(c.lifeExpectancy);
    setExpectedSchooling(c.expectedSchooling);
    setMeanSchooling(c.meanSchooling);
    setGniPerCapita(c.gniPerCapita);
    setSelectedCountryName(c.country);
    setSearchTerm(c.country);
    setShowCountryDropdown(false);
  };

  const handleReset = () => {
    setLifeExpectancy(72);
    setExpectedSchooling(12);
    setMeanSchooling(8);
    setGniPerCapita(14000);
    setSelectedCountryName('');
    setSearchTerm('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPredict({
      lifeExpectancy,
      expectedSchooling,
      meanSchooling,
      gniPerCapita,
    });
  };

  // Warn if mean schooling is greater than expected schooling (rare/unlikely anomaly)
  const isSchoolingWarning = meanSchooling > expectedSchooling;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Development Indicators</h2>
          <h3 className="font-sans text-sm font-bold text-slate-800">
            Simulate country parameters or autofill below.
          </h3>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors border border-slate-200 hover:border-slate-300 px-2.5 py-1.5 rounded-lg bg-slate-50 cursor-pointer"
          title="Reset sliders"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Country Autocomplete Select */}
      <div className="mb-6 relative">
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          Benchmark with a Real Country (Autofill)
        </label>
        <div className="relative">
          <input
            type="text"
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-md pl-9 pr-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 transition-all"
            placeholder="Search country (e.g. Switzerland, Brazil, Ghana...)"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowCountryDropdown(true);
              if (selectedCountryName && e.target.value !== selectedCountryName) {
                setSelectedCountryName('');
              }
            }}
            onFocus={() => setShowCountryDropdown(true)}
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>

        {showCountryDropdown && searchTerm && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-56 overflow-y-auto">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => (
                <button
                  key={c.country}
                  type="button"
                  className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex justify-between items-center border-b last:border-0 border-slate-100 cursor-pointer"
                  onClick={() => handleCountrySelect(c)}
                >
                  <span className="font-semibold text-slate-800">{c.country}</span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                    {c.hdiCategory} ({c.hdiValue.toFixed(3)})
                  </span>
                </button>
              ))
            ) : (
              <div className="p-3 text-xs text-slate-500 text-center">No matching countries found</div>
            )}
            <button
              type="button"
              className="w-full text-center py-2 text-xs text-slate-400 hover:text-slate-600 border-t border-slate-100 bg-slate-50 font-medium"
              onClick={() => setShowCountryDropdown(false)}
            >
              Close Dropdown
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sliders Container */}
        <div className="space-y-5">
          {/* Life Expectancy */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                Life Expectancy (Years)
                <span className="text-slate-400 cursor-help" title="Average number of years a newborn is expected to live if mortality patterns remain unchanged.">
                  <HelpCircle className="w-3 h-3" />
                </span>
              </label>
              <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                {lifeExpectancy} yrs
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="85"
              step="1"
              value={lifeExpectancy}
              onChange={(e) => {
                setLifeExpectancy(Number(e.target.value));
                setSelectedCountryName('');
              }}
              className="w-full accent-indigo-600 cursor-pointer scale-95"
            />
            {/* High Density progress bar under the slider */}
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${((lifeExpectancy - 20) / (85 - 20)) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-semibold text-slate-400 px-1 mt-0.5">
              <span>Min: 20 yrs</span>
              <span>Max: 85 yrs</span>
            </div>
          </div>

          {/* Expected Years of Schooling */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                Expected Schooling (Years)
                <span className="text-slate-400 cursor-help" title="Number of years of schooling that a child of school entrance age can expect to receive.">
                  <HelpCircle className="w-3 h-3" />
                </span>
              </label>
              <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                {expectedSchooling} yrs
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="18"
              step="0.5"
              value={expectedSchooling}
              onChange={(e) => {
                setExpectedSchooling(Number(e.target.value));
                setSelectedCountryName('');
              }}
              className="w-full accent-indigo-600 cursor-pointer scale-95"
            />
            {/* High Density progress bar under the slider */}
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${(expectedSchooling / 18) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-semibold text-slate-400 px-1 mt-0.5">
              <span>Min: 0 yrs</span>
              <span>Max: 18 yrs</span>
            </div>
          </div>

          {/* Mean Years of Schooling */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                Mean Schooling (Years)
                <span className="text-slate-400 cursor-help" title="Average number of years of education completed by people aged 25 and older.">
                  <HelpCircle className="w-3 h-3" />
                </span>
              </label>
              <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                {meanSchooling} yrs
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="0.5"
              value={meanSchooling}
              onChange={(e) => {
                setMeanSchooling(Number(e.target.value));
                setSelectedCountryName('');
              }}
              className="w-full accent-indigo-600 cursor-pointer scale-95"
            />
            {/* High Density progress bar under the slider */}
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-blue-400 transition-all duration-300"
                style={{ width: `${(meanSchooling / 15) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-semibold text-slate-400 px-1 mt-0.5">
              <span>Min: 0 yrs</span>
              <span>Max: 15 yrs</span>
            </div>

            {isSchoolingWarning && (
              <div className="mt-2 text-[10px] text-amber-700 bg-amber-50/80 p-2.5 border border-amber-200 rounded-md leading-relaxed">
                ⚠️ <strong>Validation Notice</strong>: Mean Schooling ({meanSchooling}) exceeds Expected Schooling ({expectedSchooling}). Completed schooling normally averages lower or equal to child projections.
              </div>
            )}
          </div>

          {/* GNI per capita */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                GNI Per Capita (USD PPP)
                <span className="text-slate-400 cursor-help" title="Gross National Income per capita converted to international dollars using purchasing power parity (PPP) rates.">
                  <HelpCircle className="w-3 h-3" />
                </span>
              </label>
              <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                ${gniPerCapita.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="75000"
              step="100"
              value={gniPerCapita}
              onChange={(e) => {
                setGniPerCapita(Number(e.target.value));
                setSelectedCountryName('');
              }}
              className="w-full accent-indigo-600 cursor-pointer scale-95"
            />
            {/* High Density progress bar under the slider */}
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${((Math.log(gniPerCapita) - Math.log(100)) / (Math.log(75000) - Math.log(100))) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-semibold text-slate-400 px-1 mt-0.5">
              <span>Min: $100</span>
              <span>Max: $75,000</span>
            </div>
          </div>
        </div>

        {/* Prediction Trigger Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full mt-4 text-white font-bold py-3 rounded-lg shadow-md transition-all uppercase text-xs tracking-widest cursor-pointer flex justify-center items-center gap-2 ${
            isLoading
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
              : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-indigo-200" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Predicting...
            </>
          ) : (
            'Predict HDI Category'
          )}
        </button>
      </form>
    </div>
  );
}
