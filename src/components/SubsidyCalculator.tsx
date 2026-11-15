import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { PropertyCategory } from '../types/solar';

type SubsidySystemOption = 'On-Grid' | 'Hybrid Grid-Connected' | 'Off-Grid';

export function SubsidyCalculator() {
  const { subsidySettings } = useSiteData();
  const [capacityKw, setCapacityKw] = useState<number>(3);
  const [systemType, setSystemType] = useState<SubsidySystemOption>('On-Grid');
  const [customerType, setCustomerType] = useState<PropertyCategory>('Residential');

  const isResidential = customerType === 'Residential';
  const isOffGrid = systemType === 'Off-Grid';
  const isHybrid = systemType === 'Hybrid Grid-Connected';
  const isEligibleChannel = isResidential && !isOffGrid;

  const centralSubsidy = !isEligibleChannel
    ? 0
    : capacityKw === 1
    ? subsidySettings.central1Kw
    : capacityKw === 2
    ? subsidySettings.central2Kw
    : subsidySettings.central3KwPlus;

  const upStateSubsidy = !isEligibleChannel
    ? 0
    : Math.min(capacityKw * subsidySettings.statePerKw, subsidySettings.stateMax);

  const combinedPotential = centralSubsidy + upStateSubsidy;

  const formatInr = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Controls */}
        <div className="lg:w-5/12 space-y-6">
          <div>
            <h3 className="font-display text-xl font-bold text-[#0B1D39]">
              PM Surya Ghar &amp; UP State Subsidy Estimator
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Select capacity, system architecture, and consumer category to check indicative eligibility.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0B1D39] mb-2">
              System Capacity (kW)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => setCapacityKw(kw)}
                  className={`py-2 px-1 text-xs font-semibold rounded-lg border transition-colors tabular-nums cursor-pointer ${
                    capacityKw === kw
                      ? 'bg-[#0B1D39] text-white border-[#0B1D39]'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {kw} kW
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0B1D39] mb-2">
              Solar System Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(['On-Grid', 'Hybrid Grid-Connected', 'Off-Grid'] as SubsidySystemOption[]).map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSystemType(type)}
                    className={`py-2.5 px-3 text-xs font-semibold rounded-lg border text-center transition-colors cursor-pointer ${
                      systemType === type
                        ? 'bg-[#F97316] text-white border-[#F97316]'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {type}
                  </button>
                )
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0B1D39] mb-2">
              Customer Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Residential', 'Commercial', 'Industrial'] as PropertyCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCustomerType(cat)}
                  className={`py-2.5 px-3 text-xs font-semibold rounded-lg border text-center transition-colors cursor-pointer ${
                    customerType === cat
                      ? 'bg-[#0B1D39] text-white border-[#0B1D39]'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:w-7/12 bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs font-semibold text-slate-500">
                Indicative Estimate · {capacityKw} kW {systemType} · {customerType}
              </span>
              <span
                className={`text-xs font-semibold ${
                  isEligibleChannel ? 'text-[#15803D]' : 'text-amber-700'
                }`}
              >
                {!isEligibleChannel
                  ? 'Not Eligible Under Residential CFA'
                  : isHybrid
                  ? 'Conditional Eligibility'
                  : 'Potentially Eligible'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <p className="text-xs text-slate-500">1. Estimated Central Subsidy</p>
                <p className="font-mono-tabular text-2xl font-bold text-[#0B1D39] mt-1">
                  {formatInr(centralSubsidy)}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">PM Surya Ghar CFA</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <p className="text-xs text-slate-500">2. Potential UP State Subsidy</p>
                <p className="font-mono-tabular text-2xl font-bold text-[#0B1D39] mt-1">
                  {formatInr(upStateSubsidy)}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">UPNEDA (Checked Separately)</p>
              </div>

              <div className="bg-[#0B1D39] text-white rounded-lg p-4">
                <p className="text-xs text-slate-300">3. Combined Potential Support</p>
                <p className="font-mono-tabular text-2xl font-bold text-[#F97316] mt-1">
                  {formatInr(combinedPotential)}
                </p>
                <p className="text-[11px] text-slate-300 mt-1">Maximum potential, not guaranteed</p>
              </div>
            </div>

            {/* 4. Eligibility Warning */}
            {!isEligibleChannel ? (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3 text-sm text-amber-950">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold">4. Eligibility Warning</p>
                  <p className="text-xs mt-1 leading-relaxed">
                    {!isResidential
                      ? `${customerType} installations are not eligible for residential PM Surya Ghar Central Financial Assistance (CFA) or residential UP state subsidy unless another applicable government scheme is independently verified.`
                      : 'Standalone Off-Grid solar systems are not eligible for PM Surya Ghar grid-connected subsidy. Battery systems are not independently subsidized under this scheme.'}
                  </p>
                </div>
              </div>
            ) : isHybrid ? (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3 text-sm text-amber-950">
                <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold">4. Hybrid Conditional Eligibility Notice</p>
                  <p className="text-xs mt-1 leading-relaxed">
                    {formatInr(combinedPotential)} is NOT guaranteed for every {capacityKw} kW hybrid system. Hybrid systems are potentially eligible only when grid-connected with net-metering feasibility, National Portal registration, and DISCOM-approved technical compliance. Battery cost is not independently subsidized.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-[#15803D]/5 border border-[#15803D]/20 flex items-start gap-3 text-sm text-[#0B1D39]">
                <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold">4. Eligibility Check Summary</p>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    Residential On-Grid installations qualify for Central and UP State subsidy evaluation separately, subject to National Portal registration, valid domestic electricity connection, and DISCOM inspection.
                  </p>
                </div>
              </div>
            )}

            {/* 5. Final Verification Notice */}
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <span className="font-semibold text-[#0B1D39]">5. Final Verification Notice: </span>
              {subsidySettings.disclaimer}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-500">
              Need help checking DISCOM feasibility in Meerut or Aligarh?
            </span>
            <Link
              to={`/get-quote?capacity=${capacityKw}kW&system=${encodeURIComponent(
                isHybrid ? 'Hybrid' : systemType
              )}&property=${customerType}`}
              className="px-4 py-2.5 text-xs font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg transition-colors whitespace-nowrap"
            >
              Verify Eligibility &amp; Get Quote
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
