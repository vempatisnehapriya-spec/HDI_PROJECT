/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { CountryData, DatasetStats, HdiCategory } from '../types.ts';
import { Search, ArrowUpDown, Database, BarChart3, ListFilter, Globe } from 'lucide-react';

interface DatasetExplorerProps {
  countries: CountryData[];
  datasetStats: DatasetStats;
}

type SortField = 'country' | 'lifeExpectancy' | 'expectedSchooling' | 'meanSchooling' | 'gniPerCapita' | 'hdiValue';
type SortOrder = 'asc' | 'desc';

export default function DatasetExplorer({ countries, datasetStats }: DatasetExplorerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('hdiValue');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Search & Filter countries
  const filteredCountries = countries
    .filter((c) => {
      const matchSearch = c.country.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = activeCategoryFilter === 'All' || c.hdiCategory === activeCategoryFilter;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else {
        return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      }
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Helper colors for categories in lists
  const categoryColors: Record<HdiCategory, string> = {
    'Very High': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'High': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Medium': 'bg-amber-100 text-amber-800 border-amber-200',
    'Low': 'bg-rose-100 text-rose-800 border-rose-200',
  };

  return (
    <div className="space-y-8">
      {/* Category distribution visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dataset Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-1">
          <h4 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <BarChart3 className="w-4 h-4 text-indigo-600 shrink-0" />
            Category Distribution
          </h4>
          <div className="space-y-4">
            {(Object.keys(datasetStats.categoryBreakdown) as HdiCategory[]).map((cat) => {
              const count = datasetStats.categoryBreakdown[cat];
              const pct = (count / datasetStats.totalCountries) * 100;
              const barColors: Record<HdiCategory, string> = {
                'Very High': 'bg-emerald-500',
                'High': 'bg-indigo-500',
                'Medium': 'bg-amber-500',
                'Low': 'bg-rose-500',
              };

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">{cat}</span>
                    <span className="font-mono text-slate-400 font-bold">
                      {count} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${barColors[cat]} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Development Averages comparator */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-2">
          <h4 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
            Indicators Benchmark by Class Profile
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  <th className="pb-2">Development Tier</th>
                  <th className="pb-2 text-right">Avg Life Exp</th>
                  <th className="pb-2 text-right">Avg Expected Edu</th>
                  <th className="pb-2 text-right">Avg Mean Edu</th>
                  <th className="pb-2 text-right">Avg GNI per Capita</th>
                  <th className="pb-2 text-right">Avg HDI Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {datasetStats.averages.map((avg) => (
                  <tr key={avg.category} className="hover:bg-slate-50/50">
                    <td className="py-2.5 font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                      <span className={`w-2 h-2 rounded-full ${
                        avg.category === 'Very High' ? 'bg-emerald-500' :
                        avg.category === 'High' ? 'bg-indigo-500' :
                        avg.category === 'Medium' ? 'bg-amber-500' : 'bg-rose-500'
                      }`} />
                      {avg.category}
                    </td>
                    <td className="py-2.5 text-right font-mono text-slate-600 font-medium">{avg.avgLifeExpectancy} yrs</td>
                    <td className="py-2.5 text-right font-mono text-slate-600 font-medium">{avg.avgExpectedSchooling} yrs</td>
                    <td className="py-2.5 text-right font-mono text-slate-600 font-medium">{avg.avgMeanSchooling} yrs</td>
                    <td className="py-2.5 text-right font-mono text-slate-700 font-semibold">${avg.avgGniPerCapita.toLocaleString()}</td>
                    <td className="py-2.5 text-right font-mono text-indigo-600 font-bold">{avg.avgHdiValue.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Main Database Table view */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <h4 className="font-sans font-bold text-slate-800 text-sm">Historical Countries Database</h4>
              <p className="text-xs text-slate-500 mt-0.5">Trained dataset with {countries.length} UNDP records.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-48">
              <input
                type="text"
                placeholder="Filter table..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md pl-8 pr-3 py-1.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Category Select Filter */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 shrink-0">
              <ListFilter className="w-3.5 h-3.5 text-slate-400" />
              <select
                className="bg-transparent border-0 text-xs focus:outline-none focus:ring-0 text-slate-700 py-0.5 outline-none cursor-pointer"
                value={activeCategoryFilter}
                onChange={(e) => setActiveCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Very High">Very High</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Countries Data Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-xl max-h-96">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 sticky top-0 border-b border-slate-100">
              <tr className="font-semibold">
                <th onClick={() => handleSort('country')} className="p-3 cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-1.5">
                    Country Name
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('lifeExpectancy')} className="p-3 text-right cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-1.5 justify-end">
                    Life Expectancy
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('expectedSchooling')} className="p-3 text-right cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-1.5 justify-end">
                    Expected Schooling
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('meanSchooling')} className="p-3 text-right cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-1.5 justify-end">
                    Mean Schooling
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('gniPerCapita')} className="p-3 text-right cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-1.5 justify-end">
                    GNI per Capita (PPP)
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('hdiValue')} className="p-3 text-right cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-1.5 justify-end">
                    UN HDI Value
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 text-center">Trained Class Label</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((c) => (
                  <tr key={c.country} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-semibold text-slate-800">{c.country}</td>
                    <td className="p-3 text-right font-mono text-slate-600">{c.lifeExpectancy} yrs</td>
                    <td className="p-3 text-right font-mono text-slate-600">{c.expectedSchooling} yrs</td>
                    <td className="p-3 text-right font-mono text-slate-600">{c.meanSchooling} yrs</td>
                    <td className="p-3 text-right font-mono text-slate-700 font-semibold">${c.gniPerCapita.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono text-indigo-600 font-bold">{c.hdiValue.toFixed(3)}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${categoryColors[c.hdiCategory]}`}>
                        {c.hdiCategory}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-mono italic">No countries found matching filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
