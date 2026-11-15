import { Link } from 'react-router-dom';
import { Phone, MapPin, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { SeoHead } from '../components/SeoHead';
import { BranchMap } from '../components/BranchMap';
import { EnquiryForm } from '../components/EnquiryForm';

export function LocalSeoPage({ citySlug }: { citySlug: 'meerut' | 'aligarh' }) {
  const { branches } = useSiteData();
  const branch = branches.find((b) => b.id === citySlug) || branches[0];
  const cityName = citySlug === 'meerut' ? 'Meerut' : 'Aligarh';

  const localServices =
    citySlug === 'meerut'
      ? [
          'Residential Rooftop Solar in Meerut Colonies & Independent Houses',
          'Commercial Solar for Showrooms, Schools & Hospitals on Delhi Road, Garh Road & Ganga Nagar',
          'Industrial Solar EPC for Partapur, Mohkampur & Modipuram Units',
          'PVVNL Net Metering & PM Surya Ghar Portal Documentation Assistance',
        ]
      : [
          'Residential Rooftop Solar across Aligarh City, Siya Khas, Ramghat Road & Civil Lines',
          'Commercial Solar for Shops, Educational Institutions & Clinics in Aligarh District',
          'Industrial & Agro-Processing Rooftop Solar EPC in Tala Nagri & Nearby Estates',
          'Grid-Connected On-Grid, Hybrid Battery Backup & Standalone Off-Grid Installations',
        ];

  return (
    <div>
      <SeoHead
        title={`Solar Company in ${cityName} — Panel Installation & EPC | Charvi Solar`}
        description={`Looking for a trusted solar company in ${cityName}? Charvi Technologies and Services delivers residential, commercial & industrial solar EPC in ${cityName}, UP. Call ${branch?.phone}.`}
        serviceName={`Solar Panel Installation in ${cityName}`}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: `${cityName} Solar`, path: `/${citySlug}-solar` },
        ]}
      />

      <section className="bg-[#0B1D39] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-[#F97316]">
            Local Solar EPC Desk · {cityName}, Uttar Pradesh
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight mt-2 max-w-4xl">
            {branch?.localSeoHeadline || `Solar Company & Rooftop EPC in ${cityName}`}
          </h1>
          <p className="text-slate-300 mt-4 max-w-2xl text-base leading-relaxed">
            {branch?.localSeoSummary}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={`tel:+91${branch?.phone}`}
              className="px-5 py-3 text-sm font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg inline-flex items-center gap-2 tabular-nums"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              <span>Call {cityName} Desk: {branch?.phone}</span>
            </a>
            <Link
              to="/pm-surya-ghar-subsidy"
              className="px-5 py-3 text-sm font-semibold border border-white/30 hover:bg-white/10 text-white rounded-lg inline-flex items-center gap-2"
            >
              <span>Check UP Solar Subsidy</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B1D39]">
              Solar Services Available in {cityName}
            </h2>
            <ul className="space-y-3">
              {localServices.map((srv) => (
                <li key={srv} className="flex items-start gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{srv}</span>
                </li>
              ))}
            </ul>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="font-display text-lg font-bold text-[#0B1D39]">
                {branch?.name}
              </h3>
              {!branch?.isAddressVerified && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-950">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Verified complete street address for Meerut branch is pending admin confirmation.</span>
                </div>
              )}
              <p className="text-sm text-slate-700 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#F97316] shrink-0 mt-0.5" aria-hidden="true" />
                <span>{branch?.address}</span>
              </p>
              <p className="text-sm font-semibold text-[#0B1D39] tabular-nums">
                Phone: {branch?.phone} · Email: {branch?.email}
              </p>
            </div>

            {branch && <BranchMap branch={branch} />}
          </div>

          <div className="lg:col-span-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
              <h2 className="font-display text-2xl font-bold text-[#0B1D39] mb-2">
                Book a Free Site Survey in {cityName}
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Our {cityName} solar engineer will visit your property for shadow measurement and a customized BOM quotation.
              </p>
              <EnquiryForm
                defaultCity={cityName}
                leadSource={`Local SEO Page: /${citySlug}-solar`}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
