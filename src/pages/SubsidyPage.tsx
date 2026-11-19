import { ExternalLink, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { SeoHead } from '../components/SeoHead';
import { SafeImage } from '../components/SafeImage';
import { SubsidyCalculator } from '../components/SubsidyCalculator';
import { EnquiryForm } from '../components/EnquiryForm';
import { SOLAR_MEDIA } from '../data/defaults';

const SUBSIDY_STEPS = [
  { step: '01', title: 'Consumer Registration', desc: 'Register on the National PM Surya Ghar Portal using your consumer number and mobile OTP.' },
  { step: '02', title: 'Electricity Connection Verification', desc: 'Confirm domestic residential electricity connection details with your local DISCOM (PVVNL/UPPCL).' },
  { step: '03', title: 'Vendor Selection', desc: 'Select an eligible registered solar EPC vendor to execute the compliant rooftop installation.' },
  { step: '04', title: 'Feasibility & Approvals', desc: 'DISCOM checks technical load feasibility and approves the proposed rooftop capacity.' },
  { step: '05', title: 'Installation', desc: 'Complete installation of approved DCR modules, inverter, ACDB/DCDB, earthing, and structure.' },
  { step: '06', title: 'Inspection & Documentation', desc: 'Upload installation photos, serial numbers, and commissioning documents for DISCOM inspection.' },
  { step: '07', title: 'Net Metering, where applicable', desc: 'Bi-directional net meter installation and synchronization with the utility grid.' },
  { step: '08', title: 'Subsidy Claim & Disbursement', desc: 'Upon successful verification and approval, subsidy is processed to the consumer bank account.' },
];

const REQUIRED_DOCS = [
  'Latest Domestic Electricity Bill (showing Consumer Number & Sanctioned Load)',
  'Aadhaar Card of Electricity Consumer',
  'Cancelled Cheque / Bank Account Passbook Details (linked for DBT)',
  'Consumer Photograph & Contact Details for Portal Registration',
  'Geotagged Installation & Module Serial Photographs',
  'Additional Undertaking / Commissioning Forms per Active Portal Guidelines',
];

const OFFICIAL_LINKS = [
  { label: 'PM Surya Ghar National Portal', url: 'https://pmsuryaghar.gov.in/' },
  { label: 'UPNEDA Official Website', url: 'https://upneda.org.in/' },
  { label: 'UPNEDA Rooftop Portal', url: 'https://www.upnedasolarrooftopportal.com/' },
  { label: 'UPPCL Official Portal', url: 'https://www.uppcl.org/' },
];

export function SubsidyPage() {
  const { subsidySettings } = useSiteData();
  const fmt = (val: number) => `₹${val.toLocaleString('en-IN')}`;
  const combinedMax = subsidySettings.central3KwPlus + subsidySettings.stateMax;

  return (
    <div>
      <SeoHead
        title="PM Surya Ghar Muft Bijli Yojana Subsidy — UP & Central Guide"
        description="Check PM Surya Ghar Central Subsidy (up to ₹78,000) and UPNEDA UP State Subsidy (up to ₹30,000) eligibility, calculator, documents, and official links."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'PM Surya Ghar Subsidy', path: '/pm-surya-ghar-subsidy' },
        ]}
      />

      <section className="bg-[#0B1D39] text-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold text-[#F97316]">
              Residential Rooftop Solar Subsidy Guide
            </p>
            <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight mt-2">
              PM Surya Ghar Muft Bijli Yojana – Get Assistance Up To {fmt(combinedMax)}*
            </h1>
            <p className="text-slate-300 mt-4 text-base sm:text-lg max-w-2xl leading-relaxed">
              Explore Eligible Central Government Subsidy and Uttar Pradesh State Subsidy for Residential Rooftop Solar Installations.
            </p>
          </div>
          <div className="lg:col-span-5 h-72 sm:h-80 rounded-2xl overflow-hidden border border-slate-700">
            <SafeImage
              src={SOLAR_MEDIA.heroRooftop}
              alt="Residential rooftop solar installation eligible for PM Surya Ghar grid-connected evaluation"
              loading="eager"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* A, B, C Structure Breakdown */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-slate-200 rounded-xl p-6 bg-slate-50">
              <p className="text-xs font-semibold text-[#F97316]">A. Central Government Subsidy</p>
              <h2 className="font-display text-xl font-bold text-[#0B1D39] mt-1">
                PM Surya Ghar CFA Structure
              </h2>
              <dl className="mt-4 space-y-3 text-sm divide-y divide-slate-200">
                <div className="flex justify-between pt-2">
                  <dt className="text-slate-600">1 kW System</dt>
                  <dd className="font-mono-tabular font-bold text-[#0B1D39]">{fmt(subsidySettings.central1Kw)}</dd>
                </div>
                <div className="flex justify-between pt-2">
                  <dt className="text-slate-600">2 kW System</dt>
                  <dd className="font-mono-tabular font-bold text-[#0B1D39]">{fmt(subsidySettings.central2Kw)}</dd>
                </div>
                <div className="flex justify-between pt-2">
                  <dt className="text-slate-600">3 kW &amp; Above (Max Cap)</dt>
                  <dd className="font-mono-tabular font-bold text-[#0B1D39]">{fmt(subsidySettings.central3KwPlus)}</dd>
                </div>
              </dl>
            </div>

            <div className="border border-slate-200 rounded-xl p-6 bg-slate-50">
              <p className="text-xs font-semibold text-[#F97316]">B. Uttar Pradesh State Subsidy</p>
              <h2 className="font-display text-xl font-bold text-[#0B1D39] mt-1">
                UPNEDA State Incentive
              </h2>
              <dl className="mt-4 space-y-3 text-sm divide-y divide-slate-200">
                <div className="flex justify-between pt-2">
                  <dt className="text-slate-600">Incentive Rate</dt>
                  <dd className="font-mono-tabular font-bold text-[#0B1D39]">{fmt(subsidySettings.statePerKw)} / kW</dd>
                </div>
                <div className="flex justify-between pt-2">
                  <dt className="text-slate-600">Maximum Per Consumer</dt>
                  <dd className="font-mono-tabular font-bold text-[#0B1D39]">{fmt(subsidySettings.stateMax)}</dd>
                </div>
                <div className="pt-2 text-xs text-slate-600">
                  Checked separately against UPNEDA scheme availability, registration, and state approval.
                </div>
              </dl>
            </div>

            <div className="border border-[#0B1D39] rounded-xl p-6 bg-[#0B1D39] text-white">
              <p className="text-xs font-semibold text-[#F97316]">C. Combined Potential Subsidy</p>
              <h2 className="font-display text-xl font-bold mt-1">
                Eligible 3 kW+ Residential Grid-Connected
              </h2>
              <dl className="mt-4 space-y-3 text-sm divide-y divide-slate-800">
                <div className="flex justify-between pt-2">
                  <dt className="text-slate-300">Central Subsidy</dt>
                  <dd className="font-mono-tabular font-semibold">Up to {fmt(subsidySettings.central3KwPlus)}</dd>
                </div>
                <div className="flex justify-between pt-2">
                  <dt className="text-slate-300">UP State Subsidy</dt>
                  <dd className="font-mono-tabular font-semibold">Up to {fmt(subsidySettings.stateMax)}</dd>
                </div>
                <div className="flex justify-between pt-2">
                  <dt className="font-semibold">Combined Potential Support*</dt>
                  <dd className="font-mono-tabular font-bold text-[#F97316]">Up to {fmt(combinedMax)}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Important Conditions */}
          <div className="mt-8 p-6 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-2 text-xs sm:text-sm text-amber-950">
                <h3 className="font-display font-bold text-base">
                  *Important Subsidy Conditions &amp; Eligibility Rules
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
                  <li>The combined amount ({fmt(combinedMax)}) is a maximum potential benefit for eligible residential grid-connected systems, not a guaranteed payout.</li>
                  <li>Central and UP State subsidy eligibility are verified separately and remain subject to active scheme conditions, budget availability, portal registration, and government approval.</li>
                  <li>Hybrid systems may be presented as potentially eligible only when they satisfy applicable grid-connected, portal registration, and DISCOM technical requirements.</li>
                  <li>Standalone Off-Grid systems are NOT eligible for PM Surya Ghar grid-connected subsidy, and battery costs are NOT independently subsidized.</li>
                  <li>Commercial and industrial customers are NOT eligible for residential PM Surya Ghar CFA.</li>
                  <li>{subsidySettings.deadlineNote}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* D. Interactive Subsidy Calculator */}
      <section className="py-16 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SubsidyCalculator />
        </div>
      </section>

      {/* E. Process & F. Documents */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B1D39] mb-8">
              Step-by-Step Subsidy Process
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {SUBSIDY_STEPS.map((s) => (
                <div key={s.step} className="p-5 border border-slate-200 rounded-xl bg-white">
                  <span className="font-mono-tabular text-lg font-bold text-[#F97316]">{s.step}</span>
                  <h3 className="font-display font-bold text-[#0B1D39] mt-2">{s.title}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8">
              <div className="flex items-center gap-2 text-[#0B1D39] mb-4">
                <FileText className="w-5 h-5 text-[#F97316]" aria-hidden="true" />
                <h2 className="font-display text-xl font-bold">Document Requirements</h2>
              </div>
              <ul className="space-y-3">
                {REQUIRED_DOCS.map((doc) => (
                  <li key={doc} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-1" aria-hidden="true" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-5 space-y-5">
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="h-44 overflow-hidden">
                  <SafeImage
                    src={SOLAR_MEDIA.inverterAcdb}
                    alt="Grid-tied solar inverter and net metering protection assembly for DISCOM inspection"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold text-[#0B1D39]">
                    DISCOM Net Metering &amp; Inspection Ready
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Compliant DCR solar modules, ACDB/DCDB protection, and geotagged commissioning documentation.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
                <h2 className="font-display text-xl font-bold text-[#0B1D39] mb-4">
                  Official Government Links
                </h2>
                <div className="space-y-3">
                  {OFFICIAL_LINKS.map((lnk) => (
                    <a
                      key={lnk.url}
                      href={lnk.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 hover:border-[#0B1D39] text-sm font-semibold text-[#0B1D39] transition-colors"
                    >
                      <span>{lnk.label}</span>
                      <ExternalLink className="w-4 h-4 text-[#F97316]" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enquiry */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B1D39] mb-6 text-center">
            Request Subsidy &amp; Rooftop Feasibility Assistance
          </h2>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
            <EnquiryForm
              defaultPropertyType="Residential"
              defaultSystemType="On-Grid"
              leadSource="PM Surya Ghar Subsidy Page"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
