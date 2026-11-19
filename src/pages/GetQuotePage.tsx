import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, Phone } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { SafeImage } from '../components/SafeImage';
import { EnquiryForm } from '../components/EnquiryForm';
import { SolarCalculator } from '../components/SolarCalculator';
import { useSiteData } from '../context/SiteDataContext';
import { SOLAR_MEDIA } from '../data/defaults';
import { PropertyCategory, SolarSystemType } from '../types/solar';

export function GetQuotePage() {
  const [params] = useSearchParams();
  const { branches } = useSiteData();

  const capacity = params.get('capacity') || '';
  const systemParam = params.get('system') || 'On-Grid';
  const propertyParam = params.get('property') || 'Residential';
  const city = params.get('city') || '';
  const bill = params.get('bill') || '';
  const message = params.get('message') || '';

  const validSystem: SolarSystemType =
    systemParam === 'Hybrid' || systemParam === 'Off-Grid' ? systemParam : 'On-Grid';
  const validProperty: PropertyCategory =
    propertyParam === 'Commercial' || propertyParam === 'Industrial'
      ? propertyParam
      : 'Residential';

  return (
    <div>
      <SeoHead
        title="Get Free Solar Quotation — Charvi Technologies and Services"
        description="Request a free rooftop solar site survey and itemized EPC quotation from Charvi Technologies and Services in Meerut and Aligarh."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Get Free Solar Quotation', path: '/get-quote' },
        ]}
      />

      <section className="bg-[#0B1D39] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-[#F97316]">Transparent Solar Proposal</p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight mt-2">
            Get a Free Solar Quotation
          </h1>
          <p className="text-slate-300 mt-3 max-w-2xl text-base">
            Share your electricity consumption and roof details. Our local engineers prepare an itemized proposal with structure, inverter, and net-metering clarity.
          </p>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
            <EnquiryForm
              defaultCapacity={capacity}
              defaultSystemType={validSystem}
              defaultPropertyType={validProperty}
              defaultCity={city}
              defaultMonthlyBill={bill}
              defaultMessage={message}
              leadSource="Get Free Quote Page"
            />
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="h-52 overflow-hidden">
                <SafeImage
                  src={SOLAR_MEDIA.engineersTeam}
                  alt="Charvi Solar engineers conducting rooftop solar inspection and sizing survey"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-[#15803D] font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                  <span>What Happens After You Submit</span>
                </div>
                <ol className="space-y-3 text-sm text-slate-600 list-decimal pl-5">
                  <li>Your enquiry receives a unique reference ID immediately.</li>
                  <li>Our Meerut or Aligarh engineer contacts you to confirm roof dimensions and sanctioned load.</li>
                  <li>We schedule a physical site survey before issuing your final itemized EPC quotation.</li>
                </ol>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 space-y-3">
              <h2 className="font-display text-lg font-bold text-[#0B1D39]">
                Prefer Speaking Directly?
              </h2>
              {branches.map((b) => (
                <div key={b.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{b.city} Branch</span>
                  <a
                    href={`tel:+91${b.phone}`}
                    className="inline-flex items-center gap-1.5 font-mono-tabular font-bold text-[#0B1D39] hover:text-[#F97316]"
                  >
                    <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{b.phone}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SolarCalculator />
        </div>
      </section>
    </div>
  );
}
