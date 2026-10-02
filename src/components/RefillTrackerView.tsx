import React, { useState, useMemo } from 'react';
import {
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  RotateCw,
  PackageCheck,
  ChevronDown,
  ChevronUp,
  Pill,
  Sparkles,
  TrendingDown,
  Info,
  Sliders,
  ShieldAlert,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { RefillNotification, Medication, Patient } from '../types';

interface RefillTrackerViewProps {
  patient: Patient;
  refillNotifications: RefillNotification[];
  medications: Medication[];
  onFulfillRefill: (medicationID: number, quantityRestocked: number) => void;
  onOpenNewPrescription: () => void;
  simulatedTime: Date;
}

// Accessible, distinct palette for trend lines
const DRUG_COLORS = [
  '#0d9488', // Teal
  '#6366f1', // Indigo
  '#f59e0b', // Amber
  '#ec4899', // Rose
  '#0284c7', // Sky
  '#8b5cf6', // Purple
  '#10b981'  // Emerald
];

export const RefillTrackerView: React.FC<RefillTrackerViewProps> = ({
  patient,
  refillNotifications,
  medications,
  onFulfillRefill,
  onOpenNewPrescription,
  simulatedTime
}) => {
  const [showFormulas, setShowFormulas] = useState(false);
  const [timeHorizon, setTimeHorizon] = useState<14 | 30 | 60>(30);
  const [selectedDrugId, setSelectedDrugId] = useState<number | 'all'>('all');

  const patientRefills = refillNotifications.filter(r => r.patientID === patient.patientID);
  const pendingRefills = patientRefills.filter(r => r.status === 'Pending' || r.status === 'Notified');

  // Filter active medications for this patient
  const activeMedications = useMemo(() => {
    return medications.filter(m => m.patientID === patient.patientID && m.status === 'active');
  }, [medications, patient.patientID]);

  // Calculate consumption and days remaining for each active drug
  const drugMetrics = useMemo(() => {
    return activeMedications.map((med, index) => {
      const dailyUsage = Math.max(1, (med.quantityPerDose || 1) * (med.dosesPerDay || 1));
      const daysRemaining = Math.max(0, Math.floor(med.quantityRemaining / dailyUsage));
      const threshold = med.refillThresholdDays || 7;
      const daysUntilThreshold = Math.max(0, daysRemaining - threshold);
      const isBelowThreshold = daysRemaining <= threshold;
      const isDepleted = daysRemaining === 0;

      const runoutDate = new Date(simulatedTime.getTime() + daysRemaining * 86400000);
      const runoutDateString = runoutDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      const thresholdDate = new Date(simulatedTime.getTime() + daysUntilThreshold * 86400000);
      const thresholdDateString = thresholdDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short'
      });

      return {
        med,
        dailyUsage,
        daysRemaining,
        threshold,
        daysUntilThreshold,
        isBelowThreshold,
        isDepleted,
        runoutDateString,
        thresholdDateString,
        color: DRUG_COLORS[index % DRUG_COLORS.length]
      };
    });
  }, [activeMedications, simulatedTime]);

  // Generate trend line points over the chosen time horizon
  const trendData = useMemo(() => {
    if (activeMedications.length === 0) return [];

    // Sample interval based on time horizon for a balanced chart
    const step = timeHorizon === 14 ? 1 : timeHorizon === 30 ? 2 : 3;
    const points = [];

    for (let dayOffset = 0; dayOffset <= timeHorizon; dayOffset += step) {
      const pointDate = new Date(simulatedTime.getTime() + dayOffset * 86400000);
      const displayDate = dayOffset === 0
        ? 'Today'
        : pointDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

      const pointObj: Record<string, any> = {
        dayOffset,
        displayDate,
        dateFull: pointDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
        warningLine: 7
      };

      drugMetrics.forEach(({ med, dailyUsage, daysRemaining }) => {
        // Line value is "Days of supply remaining" at this future day
        const daysLeftAtT = Math.max(0, daysRemaining - dayOffset);
        const unitsLeftAtT = Math.max(0, med.quantityRemaining - (dayOffset * dailyUsage));

        pointObj[`days_${med.medicationID}`] = daysLeftAtT;
        pointObj[`units_${med.medicationID}`] = unitsLeftAtT;
      });

      points.push(pointObj);
    }

    return points;
  }, [activeMedications, drugMetrics, timeHorizon, simulatedTime]);

  // Medications to display in chart
  const displayedMetrics = useMemo(() => {
    if (selectedDrugId === 'all') return drugMetrics;
    return drugMetrics.filter(d => d.med.medicationID === selectedDrugId);
  }, [drugMetrics, selectedDrugId]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]?.payload;
      return (
        <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-2.5 rounded-md shadow-xs text-xs space-y-1.5 min-w-[200px]">
          <div className="border-b border-slate-100 dark:border-zinc-700 pb-1 flex items-center justify-between">
            <span className="font-semibold text-slate-800 dark:text-zinc-100">
              {dataPoint?.dateFull || label}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
              {dataPoint?.dayOffset === 0 ? 'Current' : `+${dataPoint?.dayOffset}d`}
            </span>
          </div>

          <div className="space-y-1">
            {displayedMetrics.map(({ med, color }) => {
              const daysVal = dataPoint?.[`days_${med.medicationID}`];
              const unitsVal = dataPoint?.[`units_${med.medicationID}`];
              if (daysVal === undefined) return null;

              const isLow = daysVal <= 7 && daysVal > 0;
              const isOut = daysVal === 0;

              return (
                <div key={med.medicationID} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2 h-2 rounded-xs shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-medium text-slate-700 dark:text-zinc-300 truncate max-w-[120px]">
                      {med.drugName}
                    </span>
                  </div>
                  <div className="text-right shrink-0 font-mono text-[11px]">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100">
                      {daysVal}d left
                    </span>
                    <span className="text-slate-400 dark:text-zinc-500 ml-1">
                      ({unitsVal}u)
                    </span>
                    {isOut && (
                      <span className="ml-1 text-[10px] font-medium text-rose-600 dark:text-rose-400">
                        • Depleted
                      </span>
                    )}
                    {isLow && (
                      <span className="ml-1 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                        • Refill
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 text-slate-900 dark:text-zinc-100">
      {/* Header & Status Summary */}
      <section
        id="refill-tracker-header"
        className="bg-white dark:bg-zinc-800/60 rounded-md p-3.5 sm:p-4 border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
            Prescription Refill & Supply Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Projected runout trajectories for {patient.fullName} based on daily prescribed dosages
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {pendingRefills.length > 0 ? (
            <div className="px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{pendingRefills.length} medication{pendingRefills.length > 1 ? 's' : ''} require refill</span>
            </div>
          ) : (
            <div className="px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>All supplies adequate</span>
            </div>
          )}
        </div>
      </section>

      {/* TREND LINE VISUALIZATION: Days of Medication Remaining */}
      <section
        id="medication-trend-chart-section"
        aria-label="Days of Medication Remaining Trend Line"
        className="bg-white dark:bg-zinc-800/60 rounded-md p-3.5 sm:p-4 border border-slate-200 dark:border-zinc-800 space-y-3"
      >
        {/* Chart Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-700/80 pb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Days of Medication Remaining (Trend)
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Refill threshold warning activates at 7 days remaining
            </p>
          </div>

          {/* Time Horizon Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-700/70 p-0.5 rounded-md shrink-0 self-start sm:self-auto border border-slate-200 dark:border-zinc-600">
            {([14, 30, 60] as const).map(horizon => (
              <button
                key={horizon}
                id={`horizon-btn-${horizon}`}
                onClick={() => setTimeHorizon(horizon)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  timeHorizon === horizon
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-none font-semibold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                {horizon} Days
              </button>
            ))}
          </div>
        </div>

        {/* Drug Filter Chips */}
        {activeMedications.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 dark:text-zinc-500 font-medium text-[11px] mr-1 shrink-0">
              Display:
            </span>
            <button
              id="filter-all-drugs"
              onClick={() => setSelectedDrugId('all')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition shrink-0 border ${
                selectedDrugId === 'all'
                  ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent font-semibold'
                  : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700'
              }`}
            >
              All Medications ({activeMedications.length})
            </button>

            {drugMetrics.map(({ med, color, daysRemaining }) => (
              <button
                key={med.medicationID}
                id={`filter-drug-${med.medicationID}`}
                onClick={() => setSelectedDrugId(med.medicationID)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition shrink-0 flex items-center gap-1.5 border ${
                  selectedDrugId === med.medicationID
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-700 font-semibold'
                    : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700'
                }`}
              >
                <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: color }} />
                <span>{med.drugName}</span>
                <span className="font-mono text-slate-500 dark:text-zinc-400">({daysRemaining}d)</span>
              </button>
            ))}
          </div>
        )}

        {/* The Recharts Line Graph */}
        {activeMedications.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-zinc-500 text-xs">
            No active medications available to plot trend lines.
          </div>
        ) : (
          <div className="w-full h-60 pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ top: 10, right: 12, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-zinc-700"
                />

                <XAxis
                  dataKey="displayDate"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />

                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  unit="d"
                />

                <Tooltip content={<CustomTooltip />} />

                {/* Refill Safety Alert Horizon (7-day standard threshold) */}
                <ReferenceArea
                  y1={0}
                  y2={7}
                  fill="#fef3c7"
                  fillOpacity={0.2}
                />

                <ReferenceLine
                  y={7}
                  stroke="#d97706"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: '7-Day Refill Line',
                    position: 'insideTopRight',
                    fill: '#b45309',
                    fontSize: 10,
                    fontWeight: 500
                  }}
                />

                {displayedMetrics.map(({ med, color }) => (
                  <Line
                    key={med.medicationID}
                    type="monotone"
                    dataKey={`days_${med.medicationID}`}
                    name={med.drugName}
                    stroke={color}
                    strokeWidth={selectedDrugId === med.medicationID ? 2.5 : 1.75}
                    dot={{ r: 2, fill: color }}
                    activeDot={{ r: 4, stroke: '#ffffff', strokeWidth: 1.5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-zinc-700/80 text-[11px] text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-600 inline-block border-b border-dashed border-amber-700" />
              <span>7-Day Refill Threshold</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-100/60 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800" />
              <span>Depletion Horizon Zone</span>
            </span>
          </div>

          <span className="text-[11px] text-slate-500 dark:text-zinc-400">
            Calculated from prescribed daily dosage rates
          </span>
        </div>
      </section>

      {/* ACTIVE DRUG REFILL CARDS WITH RUNOUT PREDICTIONS */}
      <section
        id="active-drug-runout-grid"
        aria-label="Active Medication Runout Cards"
        className="space-y-2.5"
      >
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Current Supply by Medication
          </h2>
          <button
            onClick={onOpenNewPrescription}
            className="text-xs font-medium text-blue-700 dark:text-blue-400 hover:underline"
          >
            + Add Medication
          </button>
        </div>

        {drugMetrics.length === 0 ? (
          <div className="bg-white dark:bg-zinc-800/60 rounded-md p-8 border border-slate-200 dark:border-zinc-800 text-center space-y-2">
            <Pill className="w-6 h-6 text-slate-400 mx-auto" />
            <h3 className="text-sm font-medium text-slate-800 dark:text-zinc-200">
              No active medications on file
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
              Add prescribed medications to monitor remaining supply and projected depletion dates.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {drugMetrics.map(({
              med,
              dailyUsage,
              daysRemaining,
              daysUntilThreshold,
              isBelowThreshold,
              isDepleted,
              runoutDateString,
              thresholdDateString,
              color
            }) => (
              <div
                key={med.medicationID}
                id={`drug-supply-card-${med.medicationID}`}
                className={`bg-white dark:bg-zinc-800/60 rounded-md p-3.5 border transition-colors space-y-2.5 ${
                  isDepleted
                    ? 'border-rose-300 dark:border-rose-800/80'
                    : isBelowThreshold
                    ? 'border-amber-300 dark:border-amber-700/80'
                    : 'border-slate-200 dark:border-zinc-800'
                }`}
              >
                {/* Drug Header & Color Tag */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className="w-1.5 h-8 rounded-xs shrink-0 mt-0.5"
                      style={{ backgroundColor: color }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-1.5">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                          {med.drugName}
                        </h3>
                        <span className="text-xs text-slate-600 dark:text-zinc-400 shrink-0">
                          {med.dosage}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                        Generic: {med.normalisedGeneric}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded border shrink-0 ${
                      isDepleted
                        ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        : isBelowThreshold
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        : 'bg-slate-50 dark:bg-zinc-700/50 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                    }`}
                  >
                    {isDepleted ? 'Out of stock' : isBelowThreshold ? 'Refill required' : 'Stock adequate'}
                  </span>
                </div>

                {/* Supply Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs p-2.5 bg-slate-50 dark:bg-zinc-800 rounded border border-slate-100 dark:border-zinc-700/60">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Supply Remaining</span>
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 font-mono">
                      {daysRemaining} Days <span className="font-normal text-slate-500">({med.quantityRemaining} units)</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Daily Usage</span>
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 font-mono">
                      {dailyUsage} unit{dailyUsage > 1 ? 's' : ''} / day
                    </span>
                  </div>
                </div>

                {/* Predictive Date Milestones */}
                <div className="text-xs space-y-1 text-slate-600 dark:text-zinc-400">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-zinc-400">Refill Alert Trigger:</span>
                    <span className="font-medium text-slate-700 dark:text-zinc-300">
                      {isBelowThreshold ? 'Immediate attention needed' : `${thresholdDateString} (${daysUntilThreshold}d remaining)`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-zinc-400">Projected Runout Date:</span>
                    <strong className="text-slate-900 dark:text-zinc-100 font-semibold font-mono">
                      {runoutDateString}
                    </strong>
                  </div>
                </div>

                {/* Action Button: Refill Fulfillment */}
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-700/80 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Standard supply pack:
                  </span>
                  <button
                    id={`refill-btn-${med.medicationID}`}
                    onClick={() => onFulfillRefill(med.medicationID, 30)}
                    className="px-3 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-medium text-xs transition flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>Record Refill (+30 units)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Clinical Calculation Method Collapsible */}
      <section
        id="clinical-calculation-method"
        className="bg-white dark:bg-zinc-800/60 rounded-md border border-slate-200 dark:border-zinc-800 overflow-hidden text-xs"
      >
        <button
          onClick={() => setShowFormulas(!showFormulas)}
          className="w-full p-3 flex items-center justify-between font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 transition"
        >
          <span>Supply Depletion Calculation Method</span>
          {showFormulas ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showFormulas && (
          <div className="p-3 pt-0 border-t border-slate-100 dark:border-zinc-700/80 text-slate-500 dark:text-zinc-400 space-y-1.5">
            <p>
              Daily usage is calculated as <code className="font-mono text-slate-700 dark:text-zinc-300">QuantityPerDose × DosesPerDay</code>.
              Days of medication remaining is computed as <code className="font-mono text-slate-700 dark:text-zinc-300">Floor(QuantityRemaining / DailyUsage)</code>.
            </p>
            <p>
              The trend line charts projected stock depletion over the selected time horizon.
              The 7-day advance notice threshold allows sufficient lead time for pharmacy renewal processing before medication supply is exhausted.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
