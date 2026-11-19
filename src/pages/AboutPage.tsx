import { Link } from 'react-router-dom';
import { Phone, MapPin, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { SeoHead } from '../components/SeoHead';
import { SafeImage } from '../components/SafeImage';
import { SOLAR_MEDIA } from '../data/defaults';

export function AboutPage() {
  const { siteSettings, branches } = useSiteData();

  return (
    <div>
      <SeoHead
        title="About Us — Charvi Technologies and Services"
        description="Learn about Charvi Technologies and Services (Charvi Solar), our vision, mission, EPC engineering standards, leadership, and Meerut & Aligarh branches."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'About Us', path: '/about' },
        ]}
      />

      <section className="relative bg-[#0B1D39] text-white py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <SafeImage
            src={SOLAR_MEDIA.aboutEpcTeam}
            alt="Charvi Solar EPC technicians installing rooftop solar mounting structure and PV modules"
            loading="eager"
            className="w-full h-full object-cover object-center"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#0B1D39]/95 via-[#0B1D39]/85 to-[#0B1D39]/55"
            aria-hidden="true"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-[#F97316]">Company Profile</p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight mt-2 max-w-3xl">
            {siteSettings.companyName}
          </h1>
          <p className="text-slate-200 mt-4 max-w-2xl text-base sm:text-lg leading-relaxed">
            {siteSettings.tagline} — Engineering reliable Residential, Commercial, and Industrial solar power plants across Uttar Pradesh.
          </p>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B1D39]">
              Who We Are
            </h2>
            <p className="text-slate-600 leading-relaxed">{siteSettings.aboutOverview}</p>
            <p className="text-slate-600 leading-relaxed">{siteSettings.qualityCommitment}</p>
            <p className="text-slate-600 leading-relaxed">{siteSettings.servicePhilosophy}</p>
          </div>
          <div className="lg:col-span-6 h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-200">
            <SafeImage
              src={SOLAR_MEDIA.engineersTeam}
              alt="Charvi Technologies and Services solar engineers conducting rooftop inspection"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Vision & Mission + Engineering Craftsmanship */}
      <section className="py-16 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <p className="text-xs font-semibold text-[#F97316]">01. Vision</p>
              <h3 className="font-display text-2xl font-bold text-[#0B1D39] mt-2">Our Vision</h3>
              <p className="text-slate-600 mt-3 leading-relaxed">{siteSettings.vision}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <p className="text-xs font-semibold text-[#F97316]">02. Mission</p>
              <h3 className="font-display text-2xl font-bold text-[#0B1D39] mt-2">Our Mission</h3>
              <p className="text-slate-600 mt-3 leading-relaxed">{siteSettings.mission}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="h-52 overflow-hidden">
                <SafeImage
                  src={SOLAR_MEDIA.hdgiStructure}
                  alt="Elevated hot-dip galvanized iron HDGI rooftop solar mounting structure"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold text-[#F97316]">Structural Engineering</p>
                <h3 className="font-display text-base font-bold text-[#0B1D39] mt-1">
                  Elevated HDGI Structures
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  High-zinc galvanized columns with SS304 hardware and waterproofed base anchoring keeping terraces usable.
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="h-52 overflow-hidden">
                <SafeImage
                  src={SOLAR_MEDIA.topconPanels}
                  alt="High-efficiency Mono-PERC and N-Type TOPCon solar modules"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold text-[#F97316]">Module Quality</p>
                <h3 className="font-display text-base font-bold text-[#0B1D39] mt-1">
                  Mono-PERC &amp; N-Type TOPCon
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Tier-1 half-cut PV modules selected for high low-light generation and long-term thermal stability.
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="h-52 overflow-hidden">
                <SafeImage
                  src={SOLAR_MEDIA.inverterAcdb}
                  alt="Solar inverter with ACDB, DCDB surge protection and net metering setup"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold text-[#F97316]">Safety &amp; Protection</p>
                <h3 className="font-display text-base font-bold text-[#0B1D39] mt-1">
                  ACDB, DCDB &amp; Earthing
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  BIS-compliant inverters, Type-II surge protection, proper cable dressing, and dedicated copper earthing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-slate-200 rounded-2xl p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 h-72 rounded-xl overflow-hidden border border-slate-200">
              <SafeImage
                src={SOLAR_MEDIA.leadershipSolar}
                alt="Solar EPC engineering director inspecting rooftop solar site plans"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="lg:col-span-8 space-y-4">
              <p className="text-xs font-semibold text-[#F97316]">Leadership &amp; Primary Contact</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B1D39]">
                {siteSettings.contactPerson}
              </h2>
              <p className="text-slate-600 leading-relaxed">{siteSettings.founderBio}</p>
              <div className="flex flex-wrap items-center gap-6 pt-2 text-sm">
                <a
                  href={`mailto:${siteSettings.primaryEmail}`}
                  className="inline-flex items-center gap-2 font-medium text-[#0B1D39] hover:text-[#F97316]"
                >
                  <Mail className="w-4 h-4 text-[#F97316]" aria-hidden="true" />
                  <span>{siteSettings.primaryEmail}</span>
                </a>
                <Link
                  to="/get-quote"
                  className="inline-flex items-center gap-1.5 font-semibold text-[#F97316]"
                >
                  <span>Schedule Technical Consultation</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Branches */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B1D39] mb-8">
            Our Regional Branches
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {branches.map((branch) => (
              <div key={branch.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="h-52 overflow-hidden">
                  <SafeImage
                    src={branch.photoUrl}
                    alt={`${branch.city} solar branch office`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="font-display text-xl font-bold text-[#0B1D39]">{branch.name}</h3>
                  {!branch.isAddressVerified && (
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>Verified complete office address pending update in Admin Branch Management.</span>
                    </div>
                  )}
                  <p className="text-sm text-slate-600 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#F97316] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{branch.address}</span>
                  </p>
                  <p className="text-sm font-medium text-[#0B1D39] flex items-center gap-2 tabular-nums">
                    <Phone className="w-4 h-4 text-[#F97316]" aria-hidden="true" />
                    <a href={`tel:+91${branch.phone}`}>{branch.phone}</a>
                  </p>
                  <div className="pt-2">
                    <Link
                      to={branch.id === 'meerut' ? '/meerut-solar' : '/aligarh-solar'}
                      className="text-xs font-semibold text-[#F97316] inline-flex items-center gap-1"
                    >
                      <span>View {branch.city} Solar Services</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
