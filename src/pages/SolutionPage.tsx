import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, MessageCircle, AlertTriangle } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { SeoHead } from '../components/SeoHead';
import { SafeImage } from '../components/SafeImage';
import { EnquiryForm } from '../components/EnquiryForm';
import { SOLAR_MEDIA } from '../data/defaults';
import { PropertyCategory, SolarSystemType } from '../types/solar';

export type SolutionPageSlug =
  | 'services'
  | 'residential'
  | 'commercial'
  | 'industrial'
  | 'on-grid'
  | 'off-grid'
  | 'hybrid';

interface SolutionConfig {
  title: string;
  subtitle: string;
  seoDescription: string;
  image: string;
  imageAlt: string;
  overview: string;
  benefits: string[];
  technicalOverview: { label: string; value: string }[];
  applications: string[];
  faqCategory: string;
  defaultProperty: PropertyCategory;
  defaultSystem: SolarSystemType;
  distinctionNote?: string;
}

const SOLUTIONS: Record<SolutionPageSlug, SolutionConfig> = {
  services: {
    title: 'Our Solar EPC Services',
    subtitle: 'End-to-end engineering, procurement, installation, and commissioning across Meerut, Aligarh & UP.',
    seoDescription:
      'Complete Residential, Commercial, and Industrial solar EPC services by Charvi Technologies and Services across Meerut and Aligarh.',
    image: SOLAR_MEDIA.aboutEpcTeam,
    imageAlt: 'Indian solar EPC technicians assembling rooftop mounting structure and PV panels',
    overview:
      'Charvi Technologies and Services executes complete rooftop solar installations from shadow analysis and structural fabrication to electrical protection and DISCOM net metering coordination.',
    benefits: [
      'On-site roof measurement and load profiling before quotation',
      'Hot-Dip Galvanized Iron (HDGI) elevated or flush mounting structures',
      'Dedicated ACDB, DCDB, Type-II SPDs, and copper/chemical earthing',
      'Support for residential PM Surya Ghar portal documentation where eligible',
      'Local branch engineers stationed in Meerut and Aligarh',
    ],
    technicalOverview: [
      { label: 'PV Modules', value: 'Mono-PERC & N-Type TOPCon (540Wp – 585Wp+)' },
      { label: 'System Types', value: 'On-Grid, Hybrid Grid-Connected & Standalone Off-Grid' },
      { label: 'Mounting', value: 'HDGI Elevated / Flush RCC & Metal Roof Structures' },
      { label: 'Safety & Earthing', value: 'ACDB/DCDB, SPD, LA & 3-Pit Earthing Architecture' },
    ],
    applications: [
      'Independent Homes & Villas',
      'Shops, Showrooms & Offices',
      'Schools, Colleges & Hospitals',
      'Factories, Warehouses & Cold Storages',
    ],
    faqCategory: 'General',
    defaultProperty: 'Residential',
    defaultSystem: 'On-Grid',
  },
  residential: {
    title: 'Residential Solar Solutions',
    subtitle: 'Cut household electricity bills with clean, custom-sized rooftop solar systems for Indian homes.',
    seoDescription:
      'Residential rooftop solar installation in Meerut and Aligarh by Charvi Solar with custom sizing, HDGI structures, and PM Surya Ghar subsidy guidance.',
    image: SOLAR_MEDIA.heroRooftop,
    imageAlt: 'Indian independent residence with elevated rooftop solar installation',
    overview:
      'Designed specifically for Indian independent houses and residential colonies, our home solar systems reduce monthly DISCOM bills while keeping your concrete terrace usable with elevated HDGI structures.',
    benefits: [
      'Right-sized 1 kW to 10 kW+ systems matched to your monthly kWh consumption',
      'Elevated structure options so terrace walking and household use remain open',
      'Choice of On-Grid (maximum bill savings) or Hybrid (grid + battery backup)',
      'Guided assistance for eligible PM Surya Ghar Muft Bijli Yojana registration',
      'Clean concealed conduit routing and digital monitoring setup',
    ],
    technicalOverview: [
      { label: 'Typical Capacities', value: '2 kW, 3 kW, 5 kW, 7 kW, 10 kW' },
      { label: 'Roof Area Needed', value: '~80–100 sq. ft. shadow-free area per kW' },
      { label: 'Connection Type', value: 'Single-Phase or Three-Phase Domestic Connection' },
      { label: 'Subsidy Support', value: 'Eligible residential grid-connected systems only' },
    ],
    applications: [
      'Independent 1–3 Storey Houses',
      'Duplex Villas & Kothis',
      'Residential Colonies & Farmhouses',
      'Home Offices with Daytime AC Loads',
    ],
    faqCategory: 'Residential',
    defaultProperty: 'Residential',
    defaultSystem: 'On-Grid',
  },
  commercial: {
    title: 'Commercial Solar Solutions',
    subtitle: 'Lower daytime operating costs for shops, showrooms, schools, hospitals, and office buildings.',
    seoDescription:
      'Commercial rooftop solar installation in Meerut and Aligarh for offices, showrooms, schools, and hospitals by Charvi Technologies and Services.',
    image: SOLAR_MEDIA.commercialBuilding,
    imageAlt: 'Indian commercial office and showroom building with rooftop solar panels',
    overview:
      'Commercial properties operate primarily during peak sunlight hours—making rooftop solar an immediate operational expense reducer for high commercial electricity tariffs.',
    benefits: [
      'Significant daytime electricity tariff offset for commercial meters',
      'Three-phase grid-tie inverter sizing with balanced phase export',
      'Non-intrusive installation scheduled to avoid business disruption',
      'High-wind-rated structures tailored for commercial parapets and slabs',
    ],
    technicalOverview: [
      { label: 'Typical Capacities', value: '10 kW to 100 kW+' },
      { label: 'Inverter Architecture', value: 'Multi-MPPT Three-Phase String Inverters' },
      { label: 'Monitoring', value: 'Remote string-level generation portal' },
      { label: 'Subsidy Note', value: 'Residential PM Surya Ghar CFA does not apply to commercial' },
    ],
    applications: [
      'Retail Showrooms & Commercial Complexes',
      'Schools, Coaching Institutes & Colleges',
      'Clinics, Nursing Homes & Hospitals',
      'Hotels, Banquet Halls & Petrol Pumps',
    ],
    faqCategory: 'Commercial',
    defaultProperty: 'Commercial',
    defaultSystem: 'On-Grid',
  },
  industrial: {
    title: 'Industrial Solar EPC',
    subtitle: 'Turnkey rooftop solar engineering for factories, warehouses, cold storages, and manufacturing units.',
    seoDescription:
      'Industrial solar EPC solutions in Meerut, Aligarh, and Western UP for factories, warehouses, and manufacturing plants.',
    image: SOLAR_MEDIA.industrialFactory,
    imageAlt: 'Indian industrial factory warehouse roof equipped with solar PV modules',
    overview:
      'Our Industrial Solar EPC division delivers high-capacity solar power plants engineered for trapezoidal/standing-seam tin sheds and large RCC industrial roofs with strict electrical safety and walkway access.',
    benefits: [
      'Non-penetrating or sealed industrial shed mounting preserving roof waterproofing',
      'Dedicated FRP/GI maintenance walkways and safety lifelines where specified',
      'LT/HT synchronization design aligned with factory transformer and DG sets',
      'Comprehensive earthing, lightning arresters, and surge protection',
    ],
    technicalOverview: [
      { label: 'Typical Capacities', value: '30 kW to 1 MW+ Captive / Net-Metered' },
      { label: 'Roof Types', value: 'Galvalume Tin Sheds, RCC Slabs & Carports' },
      { label: 'Protection', value: 'Industrial LT Panel Integration, DCDB, ACDB & SPD' },
      { label: 'Subsidy Note', value: 'Not covered under residential PM Surya Ghar CFA' },
    ],
    applications: [
      'Manufacturing Plants & Rolling Mills',
      'Warehouses & Logistics Hubs',
      'Cold Storages & Agro-Processing Units',
      'Dairy, Flour Mills & Packaging Factories',
    ],
    faqCategory: 'Commercial',
    defaultProperty: 'Industrial',
    defaultSystem: 'On-Grid',
  },
  'on-grid': {
    title: 'On-Grid Solar System',
    subtitle: 'Grid-connected solar power with net metering for maximum bill reduction and zero battery maintenance.',
    seoDescription:
      'On-Grid solar system installation in Meerut and Aligarh with net metering coordination and PM Surya Ghar eligibility support.',
    image: SOLAR_MEDIA.inverterAcdb,
    imageAlt: 'Grid-tied solar inverter with ACDB, DCDB, and bi-directional net meter',
    overview:
      'An On-Grid (grid-tied) solar system operates in synchronization with your local electricity utility (PVVNL / UPPCL). Solar power supplies your daytime loads first, and surplus units are exported to the grid through a bi-directional net meter.',
    benefits: [
      'Lowest upfront cost per kW with no battery replacement cycle',
      'Bi-directional net metering credits exported solar energy against your bill',
      'Eligible residential installations qualify for PM Surya Ghar subsidy evaluation',
      'High conversion efficiency and minimal ongoing maintenance',
    ],
    technicalOverview: [
      { label: 'Grid Dependency', value: 'Requires active grid reference (anti-islanding safety)' },
      { label: 'Battery Bank', value: 'None — Grid acts as virtual energy bank via net metering' },
      { label: 'Power Cut Behaviour', value: 'Shuts down safely during grid outage unless paired with hybrid/DG' },
      { label: 'Subsidy Eligibility', value: 'Primary eligible architecture for residential PM Surya Ghar' },
    ],
    applications: [
      'Urban & Semi-Urban Homes with Reliable Grid',
      'Commercial Offices & Showrooms',
      'Industrial Factories Operating During Daytime',
    ],
    faqCategory: 'General',
    defaultProperty: 'Residential',
    defaultSystem: 'On-Grid',
  },
  'off-grid': {
    title: 'Off-Grid Solar System',
    subtitle: 'Independent battery-backed solar power designed for areas without grid supply or frequent outages.',
    seoDescription:
      'Off-Grid standalone solar system with battery bank in Meerut and Aligarh by Charvi Technologies and Services.',
    image: SOLAR_MEDIA.offgridBattery,
    imageAlt: 'Standalone off-grid battery bank and solar inverter installation',
    overview:
      'An Off-Grid solar system operates completely independently of the utility grid. Solar energy charges a dedicated battery bank through an MPPT charge controller/inverter and runs your appliances day and night without exporting to any utility meter.',
    benefits: [
      'Works independently even where no utility grid connection exists',
      'Reliable power backup sized specifically to your critical appliance hours',
      'Zero dependency on net-metering approvals',
      'Supports lithium (LiFePO4) or C10 tubular solar battery configurations',
    ],
    technicalOverview: [
      { label: 'Grid Export', value: 'None — Standalone independent operation' },
      { label: 'Storage', value: 'C10 Solar Tubular or LiFePO4 Lithium Battery Bank' },
      { label: 'Sizing Focus', value: 'Daily kWh load + autonomous backup hours' },
      { label: 'Subsidy Notice', value: 'NOT eligible for PM Surya Ghar grid-connected CFA' },
    ],
    applications: [
      'Remote Farmhouses & Agricultural Premises',
      'Rural Homes with Extended Grid Outages',
      'Telecom, Security Cabins & Isolated Facilities',
    ],
    faqCategory: 'General',
    defaultProperty: 'Residential',
    defaultSystem: 'Off-Grid',
    distinctionNote:
      'Important Distinction: Standalone Off-Grid systems do NOT connect to or export to the utility grid and must NOT be confused with grid-connected Hybrid systems. Standalone Off-Grid systems are NOT eligible for PM Surya Ghar grid-connected subsidy.',
  },
  hybrid: {
    title: 'Hybrid Solar System',
    subtitle: 'Grid-connected solar generation combined with intelligent battery backup for uninterrupted power.',
    seoDescription:
      'Grid-connected Hybrid solar system with lithium or tubular battery storage in Meerut and Aligarh by Charvi Solar.',
    image: SOLAR_MEDIA.hybridHome,
    imageAlt: 'Indian home equipped with rooftop solar and hybrid battery storage system',
    overview:
      'A Grid-Connected Hybrid solar system combines the bill-saving benefits of an On-Grid system with the outage resilience of battery backup. During normal grid availability, it powers loads, keeps batteries charged, and can export surplus power where net-metered.',
    benefits: [
      'Automatic, fast switchover keeping critical loads running during grid cuts',
      'Programmable energy priority (Solar → Battery → Grid)',
      'Supports net metering where DISCOM-compliant hybrid inverter is installed',
      'Custom battery bank capacity tailored to your evening/night backup hours',
    ],
    technicalOverview: [
      { label: 'Operation Mode', value: 'Grid-synchronized + Battery Backup Islanding Mode' },
      { label: 'Battery Options', value: 'LiFePO4 Lithium or Tubular C10 Battery Banks' },
      { label: 'Protection', value: 'Critical Load Sub-Panel + AC/DC Surge Protection' },
      { label: 'Subsidy Note', value: 'Potentially eligible ONLY if grid-connected & portal-compliant; battery is not subsidized' },
    ],
    applications: [
      'Homes Experiencing Frequent Daytime/Evening Outages',
      'Clinics, Labs & Home Offices Needing Zero Downtime',
      'Modern Residences Seeking Both Savings & Backup',
    ],
    faqCategory: 'Hybrid',
    defaultProperty: 'Residential',
    defaultSystem: 'Hybrid',
    distinctionNote:
      'Grid-Connected Hybrid vs. Standalone Off-Grid: A grid-connected hybrid system synchronizes with the utility grid and supports net metering, whereas a standalone off-grid system operates completely isolated from the grid. Hybrid systems may qualify for PM Surya Ghar subsidy only if all grid-connected portal and DISCOM technical conditions are satisfied; battery cost is never independently subsidized.',
  },
};

export function SolutionPage({ slug }: { slug: SolutionPageSlug }) {
  const { projects, faqs, siteSettings } = useSiteData();
  const cfg = SOLUTIONS[slug];

  const relatedFaqs = faqs
    .filter((f) => f.category === cfg.faqCategory || f.category === 'General')
    .slice(0, 4);

  const relatedProjects = projects
    .filter(
      (p) =>
        slug === 'services' ||
        p.category.toLowerCase() === slug ||
        p.solarType.toLowerCase() === slug
    )
    .slice(0, 3);

  return (
    <div>
      <SeoHead
        title={`${cfg.title} — Charvi Solar`}
        description={cfg.seoDescription}
        serviceName={cfg.title}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Solar Solutions', path: '/services' },
          { name: cfg.title, path: `/${slug === 'services' ? 'services' : `${slug}-solar`}` },
        ]}
        faqItems={relatedFaqs}
      />

      <section className="bg-[#0B1D39] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold text-[#F97316]">Charvi Solar EPC Solutions</p>
            <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight mt-2">
              {cfg.title}
            </h1>
            <p className="text-slate-300 mt-4 text-base sm:text-lg leading-relaxed max-w-2xl">
              {cfg.subtitle}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#solution-enquiry"
                className="px-5 py-3 text-sm font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg transition-colors"
              >
                Request {cfg.title} Quote
              </a>
              <a
                href={`https://wa.me/${siteSettings.whatsappNumber}?text=${encodeURIComponent(
                  `Hello Charvi Solar, I am interested in ${cfg.title}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 text-sm font-semibold bg-[#15803D] hover:bg-[#166534] text-white rounded-lg inline-flex items-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span>WhatsApp Specialist</span>
              </a>
            </div>
          </div>
          <div className="lg:col-span-5 h-72 sm:h-80 rounded-2xl overflow-hidden border border-slate-700">
            <SafeImage src={cfg.image} alt={cfg.imageAlt} loading="eager" />
          </div>
        </div>
      </section>

      {cfg.distinctionNote && (
        <section className="bg-amber-50 border-b border-amber-200 py-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-start gap-3 text-sm text-amber-950">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="leading-relaxed">{cfg.distinctionNote}</p>
          </div>
        </section>
      )}

      {/* Overview & Technical Table */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-6">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B1D39]">
              System Overview &amp; Key Benefits
            </h2>
            <p className="text-slate-600 leading-relaxed">{cfg.overview}</p>
            <ul className="space-y-3">
              {cfg.benefits.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <h3 className="font-display text-lg font-bold text-[#0B1D39] mb-3">
                Suitable Applications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cfg.applications.map((app) => (
                  <div
                    key={app}
                    className="px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium text-[#0B1D39]"
                  >
                    {app}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
              <h3 className="font-display text-lg font-bold text-[#0B1D39]">
                Technical Overview
              </h3>
              <dl className="divide-y divide-slate-200">
                {cfg.technicalOverview.map((row) => (
                  <div key={row.label} className="py-3">
                    <dt className="text-xs font-semibold text-slate-500">{row.label}</dt>
                    <dd className="text-sm font-medium text-[#0B1D39] mt-0.5">{row.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="pt-2">
                <Link
                  to="/pm-surya-ghar-subsidy"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F97316]"
                >
                  <span>Check PM Surya Ghar Subsidy Rules</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
              <div className="h-52 overflow-hidden">
                <SafeImage
                  src={
                    slug === 'industrial' || slug === 'residential'
                      ? SOLAR_MEDIA.hdgiStructure
                      : SOLAR_MEDIA.topconPanels
                  }
                  alt={
                    slug === 'industrial' || slug === 'residential'
                      ? 'Hot-dip galvanized iron HDGI elevated rooftop solar structure'
                      : 'High-efficiency TOPCon monocrystalline solar PV modules'
                  }
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-xs font-semibold text-[#F97316]">Charvi EPC Build Standard</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Every plant combines Tier-1 PV modules, HDGI mounting structures, and neat ACDB/DCDB surge protection.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="py-14 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-bold text-[#0B1D39] mb-6">
              Related Charvi Installations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProjects.map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.slug}`}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-[#0B1D39]"
                >
                  <div className="h-44 overflow-hidden">
                    <SafeImage src={p.images?.[0]} alt={p.title} />
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-slate-500">
                      {p.capacityKw} kW · {p.location}
                    </p>
                    <h3 className="font-display font-bold text-[#0B1D39] mt-1">{p.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      {relatedFaqs.length > 0 && (
        <section className="py-14 bg-slate-50 border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-bold text-[#0B1D39] mb-6">
              Common Technical Questions
            </h2>
            <div className="space-y-4">
              {relatedFaqs.map((faq) => (
                <div key={faq.id} className="bg-white border border-slate-200 rounded-xl p-5">
                  <h3 className="font-display text-base font-bold text-[#0B1D39]">{faq.question}</h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Enquiry Form */}
      <section id="solution-enquiry" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-xs font-semibold text-[#F97316]">Get Custom Proposal</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B1D39] mt-1">
              Request a Site Survey for {cfg.title}
            </h2>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
            <EnquiryForm
              defaultPropertyType={cfg.defaultProperty}
              defaultSystemType={cfg.defaultSystem}
              leadSource={`Solution Page: ${cfg.title}`}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
