import React, { useState, useMemo } from 'react';
import { Database, Search, Tag, Clock, Activity, ChevronDown, ChevronUp, Info, Utensils } from 'lucide-react';
import { DrugRegistryItem } from '../types';

interface DrugRegistryViewProps {
  drugRegistry: DrugRegistryItem[];
}

export const DrugRegistryView: React.FC<DrugRegistryViewProps> = ({ drugRegistry }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedCodes, setExpandedCodes] = useState<Set<string>>(new Set());

  const toggleExpand = (atcCode: string) => {
    setExpandedCodes(prev => {
      const next = new Set(prev);
      if (next.has(atcCode)) next.delete(atcCode);
      else next.add(atcCode);
      return next;
    });
  };

  const filtered = useMemo(() => {
    return drugRegistry.filter(item => {
      const matchSearch =
        item.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.atcCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brandNames.some(b => b.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;

      return matchSearch && matchCat;
    });
  }, [drugRegistry, searchTerm, selectedCategory]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-md p-4 border border-slate-200 dark:border-zinc-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-700 dark:text-zinc-300" />
            <h1 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
              Curated Drug Registry &amp; Pharmacokinetics
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 max-w-2xl">
            Reference clinical knowledge base for the normalization step (WHO ATC classification), pharmacokinetic profiles, and chronotherapy guidelines.
          </p>
        </div>

        <div className="text-left md:text-right">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Screened Medications</span>
          <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100 font-mono">{drugRegistry.length} Active Records</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by generic, ATC code, or brand..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 rounded focus:ring-1 focus:ring-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <span className="text-slate-500 dark:text-zinc-400">Category:</span>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded px-2.5 py-1 text-slate-700 dark:text-zinc-300 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="hypertension">Hypertension</option>
            <option value="diabetes">Diabetes Mellitus</option>
            <option value="hiv">HIV Management</option>
            <option value="asthma">Asthma / Respiratory</option>
            <option value="general">General Co-Prescribed</option>
          </select>
        </div>
      </div>

      {/* Grid of Medications */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(drug => {
          const isExpanded = expandedCodes.has(drug.atcCode);

          return (
            <div
              key={drug.atcCode}
              className="bg-white dark:bg-zinc-900 rounded-md p-4 border border-slate-200 dark:border-zinc-800 shadow-2xs flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">{drug.genericName}</h3>
                    <span className="font-mono text-xs font-medium text-slate-600 dark:text-zinc-400">{drug.atcCode}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium uppercase bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-700">
                    {drug.category}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-normal">
                  {drug.description}
                </p>

                {/* Best time to take summary badge */}
                {drug.bestTimeToTake && (
                  <div className="p-2 rounded bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 flex items-start gap-2 text-xs">
                    <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 shrink-0 mt-0.5" />
                    <span className="text-slate-800 dark:text-zinc-200 text-[11px] leading-snug">
                      <strong className="font-semibold text-slate-900 dark:text-zinc-100">Best Time:</strong> {drug.bestTimeToTake}
                    </span>
                  </div>
                )}

                {/* Brand Names */}
                <div className="pt-1">
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium uppercase block mb-1">
                    Brand Name Aliases (Normalized)
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {drug.brandNames.map(b => (
                      <span
                        key={b}
                        className="px-1.5 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 font-normal"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Allergen group if any */}
                {drug.allergenGroup && (
                  <div className="pt-1 flex items-center gap-1.5 text-[11px] text-rose-700 dark:text-rose-400">
                    <Tag className="w-3 h-3" />
                    <span>Allergen Class: <strong>{drug.allergenGroup}</strong></span>
                  </div>
                )}

                {/* Expandable PK & Clinical Monograph */}
                {drug.pharmacokinetics && (
                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
                    <button
                      onClick={() => toggleExpand(drug.atcCode)}
                      className="w-full py-1 text-left flex items-center justify-between text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 transition"
                    >
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                        <span>Pharmacokinetic Parameters</span>
                      </span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 space-y-2 text-xs bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-md border border-slate-200 dark:border-zinc-800">
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="bg-white dark:bg-zinc-900 p-1.5 rounded border border-slate-200/80 dark:border-zinc-800">
                            <span className="text-[9px] text-slate-500 dark:text-zinc-400 uppercase block">Half-life (t½)</span>
                            <span className="font-mono font-medium text-slate-900 dark:text-zinc-200 text-[11px]">{drug.pharmacokinetics.halfLife}</span>
                          </div>
                          <div className="bg-white dark:bg-zinc-900 p-1.5 rounded border border-slate-200/80 dark:border-zinc-800">
                            <span className="text-[9px] text-slate-500 dark:text-zinc-400 uppercase block">Peak Plasma (Tmax)</span>
                            <span className="font-mono font-medium text-slate-900 dark:text-zinc-200 text-[11px]">{drug.pharmacokinetics.peakPlasmaTime}</span>
                          </div>
                          <div className="bg-white dark:bg-zinc-900 p-1.5 rounded border border-slate-200/80 dark:border-zinc-800">
                            <span className="text-[9px] text-slate-500 dark:text-zinc-400 uppercase block">Bioavailability (F)</span>
                            <span className="font-mono font-medium text-slate-900 dark:text-zinc-200 text-[11px]">{drug.pharmacokinetics.bioavailability}</span>
                          </div>
                          <div className="bg-white dark:bg-zinc-900 p-1.5 rounded border border-slate-200/80 dark:border-zinc-800">
                            <span className="text-[9px] text-slate-500 dark:text-zinc-400 uppercase block">Clearance</span>
                            <span className="text-slate-800 dark:text-zinc-200 text-[11px] truncate block">{drug.pharmacokinetics.clearanceRoute}</span>
                          </div>
                        </div>

                        {drug.foodAdvice && (
                          <div className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-zinc-400 pt-1">
                            <Utensils className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                            <span>{drug.foodAdvice}</span>
                          </div>
                        )}

                        {drug.clinicalPearl && (
                          <div className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 p-2 rounded border border-slate-200 dark:border-zinc-800">
                            <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                            <span>{drug.clinicalPearl}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500">
                <span>Forms: {drug.commonForms.join(', ')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
