import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, ArrowRight, Info } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { PropertyCategory, SolarSystemType } from '../types/solar';

export function SolarCalculator() {
  const { subsidySettings } = useSiteData();

  const [inputMode, setInputMode] = useState<'bill' | 'units'>('bill');
  const [monthlyBill, setMonthlyBill] = useState<number>(5000);
  const [monthlyUnits, setMonthlyUnits] = useState<number>(650);
  const [propertyType, setPropertyType] = useState<PropertyCategory>('Residential');
  const [rooftopArea, setRooftopArea] = useState<number>(500);
  const [city, setCity] = useState<string>('Meerut');
  const [phase, setPhase] = useState<'Single Phase' | 'Three Phase'>('Single Phase');
  const [systemType, setSystemType] = useState<SolarSystemType>('On-Grid');
  const [backupNeed, setBackupNeed] = useState<'None' | 'Essential (4-6 hrs)' | 'Extended'>('None');

  const effectiveUnits =
    inputMode === 'bill'
      ? Math.max(0, monthlyBill) / (subsidySettings.tariffPerUnitInr || 7.5)
      : Math.max(0, monthlyUnits);

  const rawKw = Math.max(1, Math.round(effectiveUnits / (subsidySettings.unitsPerKwMonthly || 120)));
  const maxRoofKw = Math.max(1, Math.floor(rooftopArea / (subsidySettings.sqftPerKw || 90)));
  const indicativeKw = Math.min(rawKw, 100);
  const panelWattage = 550;
  const estimatedPanels = Math.ceil((indicativeKw * 1000) / panelWattage);
  const estimatedRoofAreaSqFt = indicativeKw * (subsidySettings.sqftPerKw || 90);
  const estimatedMonthlyGen = indicativeKw * (subsidySettings.unitsPerKwMonthly || 120);
  const estimatedAnnualGen = estimatedMonthlyGen * 12;

  const [costMinPerKw, costMaxPerKw] =
    systemType === 'On-Grid'
      ? [subsidySettings.costPerKwOnGridMin, subsidySettings.costPerKwOnGridMax]
      : systemType === 'Hybrid'
      ? [subsidySettings.costPerKwHybridMin, subsidySettings.costPerKwHybridMax]
      : [subsidySettings.costPerKwOffGridMin, subsidySettings.costPerKwOffGridMax];

  const backupAdderMin =
    systemType === 'On-Grid' ? 0 : backupNeed === 'Extended' ? 25000 : backupNeed === 'Essential (4-6 hrs)' ? 12000 : 0;
  const indicativeCostMin = indicativeKw * costMinPerKw + backupAdderMin;
  const indicativeCostMax = indicativeKw * costMaxPerKw + backupAdderMin * 1.5;

  const isSubsidyEligible = propertyType === 'Residential' && systemType !== 'Off-Grid';
  const centralSubsidy = !isSubsidyEligible
    ? 0
    : indicativeKw === 1
    ? subsidySettings.central1Kw
    : indicativeKw === 2
    ? subsidySettings.central2Kw
    : subsidySettings.central3KwPlus;
  const stateSubsidy = !isSubsidyEligible
    ? 0
    : Math.min(indicativeKw * subsidySettings.statePerKw, subsidySettings.stateMax);
  const potentialSubsidy = centralSubsidy + stateSubsidy;

  const netMin = Math.max(0, indicativeCostMin - potentialSubsidy);
  const netMax = Math.max(0, indicativeCostMax - potentialSubsidy);

  const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F97316]">
            <Calculator className="w-4 h-4" aria-hidden="true" />
            <span>Interactive Solar Requirement Estimator</span>
          </div>
          <h3 className="font-display text-2xl font-bold text-[#0B1D39] mt-1">
            Calculate Your Solar Capacity &amp; Indicative Budget
          </h3>
        </div>
        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
          <button
            type="button"
            onClick={() => setInputMode('bill')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              inputMode === 'bill' ? 'bg-white text-[#0B1D39] shadow-sm' : 'text-slate-600'
            }`}
          >
            By Monthly Bill (₹)
          </button>
          <button
            type="button"
            onClick={() => setInputMode('units')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              inputMode === 'units' ? 'bg-white text-[#0B1D39] shadow-sm' : 'text-slate-600'
            }`}
          >
            By Units (kWh)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
        {/* Inputs */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {inputMode === 'bill' ? (
            <div className="sm:col-span-2">
              <label htmlFor="calc-bill" className="block text-xs font-semibold text-[#0B1D39] mb-1.5">
                Average Monthly Electricity Bill (₹)
              </label>
              <input
                id="calc-bill"
                type="number"
                min={500}
                max={1000000}
                step={500}
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              />
            </div>
          ) : (
            <div className="sm:col-span-2">
              <label htmlFor="calc-units" className="block text-xs font-semibold text-[#0B1D39] mb-1.5">
                Monthly Units Consumed (kWh)
              </label>
              <input
                id="calc-units"
                type="number"
                min={50}
                max={150000}
                step={50}
                value={monthlyUnits}
                onChange={(e) => setMonthlyUnits(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              />
            </div>
          )}

          <div>
            <label htmlFor="calc-prop" className="block text-xs font-semibold text-[#0B1D39] mb-1.5">
              Property Category
            </label>
            <select
              id="calc-prop"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as PropertyCategory)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            >
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Industrial">Industrial</option>
            </select>
          </div>

          <div>
            <label htmlFor="calc-roof" className="block text-xs font-semibold text-[#0B1D39] mb-1.5">
              Available Rooftop Area (sq. ft.)
            </label>
            <input
              id="calc-roof"
              type="number"
              min={80}
              max={100000}
              step={50}
              value={rooftopArea}
              onChange={(e) => setRooftopArea(Number(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>

          <div>
            <label htmlFor="calc-city" className="block text-xs font-semibold text-[#0B1D39] mb-1.5">
              City
            </label>
            <select
              id="calc-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            >
              <option value="Meerut">Meerut</option>
              <option value="Aligarh">Aligarh</option>
              <option value="Bulandshahr">Bulandshahr</option>
              <option value="Hapur">Hapur</option>
              <option value="Muzaffarnagar">Muzaffarnagar</option>
              <option value="Hathras">Hathras</option>
              <option value="Ghaziabad / NCR">Ghaziabad / NCR</option>
              <option value="Other UP City">Other Uttar Pradesh City</option>
            </select>
          </div>

          <div>
            <label htmlFor="calc-phase" className="block text-xs font-semibold text-[#0B1D39] mb-1.5">
              Electricity Phase
            </label>
            <select
              id="calc-phase"
              value={phase}
              onChange={(e) => setPhase(e.target.value as 'Single Phase' | 'Three Phase')}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            >
              <option value="Single Phase">Single Phase</option>
              <option value="Three Phase">Three Phase</option>
            </select>
          </div>

          <div>
            <label htmlFor="calc-system" className="block text-xs font-semibold text-[#0B1D39] mb-1.5">
              System Architecture
            </label>
            <select
              id="calc-system"
              value={systemType}
              onChange={(e) => {
                const next = e.target.value as SolarSystemType;
                setSystemType(next);
                if (next === 'On-Grid') setBackupNeed('None');
                if (next !== 'On-Grid' && backupNeed === 'None') setBackupNeed('Essential (4-6 hrs)');
              }}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            >
              <option value="On-Grid">On-Grid (Net Metering)</option>
              <option value="Hybrid">Hybrid (Grid + Battery)</option>
              <option value="Off-Grid">Off-Grid (Independent Battery)</option>
            </select>
          </div>

          <div>
            <label htmlFor="calc-backup" className="block text-xs font-semibold text-[#0B1D39] mb-1.5">
              Battery Backup Requirement
            </label>
            <select
              id="calc-backup"
              value={backupNeed}
              disabled={systemType === 'On-Grid'}
              onChange={(e) => setBackupNeed(e.target.value as 'None' | 'Essential (4-6 hrs)' | 'Extended')}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg disabled:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            >
              <option value="None">No Battery Backup</option>
              <option value="Essential (4-6 hrs)">Essential Loads (4–6 hrs)</option>
              <option value="Extended">Extended Backup</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-6 bg-[#0B1D39] text-white rounded-xl p-6 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 border-b border-slate-700 pb-3">
              <span>Indicative Estimate · {city} ({phase})</span>
              <span>{systemType}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-xs text-slate-400">Indicative Capacity</p>
                <p className="font-mono-tabular text-2xl font-bold text-[#F97316] mt-0.5">
                  {indicativeKw} kW
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Est. Panels (550Wp)</p>
                <p className="font-mono-tabular text-2xl font-bold text-white mt-0.5">
                  {estimatedPanels} Nos.
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Est. Roof Area</p>
                <p className="font-mono-tabular text-2xl font-bold text-white mt-0.5">
                  {estimatedRoofAreaSqFt} <span className="text-xs font-normal">sq.ft</span>
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-300">Estimated Generation</span>
                <span className="font-mono-tabular font-semibold">
                  ~{estimatedMonthlyGen.toLocaleString('en-IN')} kWh/mo ({estimatedAnnualGen.toLocaleString('en-IN')} kWh/yr)
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-300">Indicative Project Cost</span>
                <span className="font-mono-tabular font-semibold">
                  {fmt(indicativeCostMin)} – {fmt(indicativeCostMax)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-300">Potential Subsidy (If Eligible)</span>
                <span className="font-mono-tabular font-semibold text-emerald-400">
                  {isSubsidyEligible ? `Up to ${fmt(potentialSubsidy)}` : 'Not Applicable'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-800">
                <span className="font-semibold text-white">Indicative Net Contribution</span>
                <span className="font-mono-tabular text-lg font-bold text-[#F97316]">
                  {fmt(netMin)} – {fmt(netMax)}
                </span>
              </div>
            </div>

            {rooftopArea < estimatedRoofAreaSqFt && (
              <div className="mt-3 p-2.5 rounded-lg bg-amber-500/15 border border-amber-400/30 text-xs text-amber-200 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Entered roof area ({rooftopArea} sq.ft) fits approx. {maxRoofKw} kW cleanly; elevated HDGI structure or high-wattage modules can be evaluated during site survey.
                </span>
              </div>
            )}

            <p className="mt-3 text-[11px] text-slate-400 leading-relaxed">
              All values above are indicative estimates for preliminary planning. Actual capacity, structure design, and pricing depend on physical site inspection, DISCOM sanction, and brand selection.
            </p>
          </div>

          <Link
            to={`/get-quote?capacity=${indicativeKw}kW&system=${encodeURIComponent(
              systemType
            )}&property=${propertyType}&city=${encodeURIComponent(city)}&bill=${monthlyBill}`}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 text-sm font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg transition-colors"
          >
            <span>Request Detailed Quotation</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
