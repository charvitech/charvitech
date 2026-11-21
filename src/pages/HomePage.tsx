import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  Phone,
  MessageCircle,
  ExternalLink,
  Check,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { SeoHead } from '../components/SeoHead';
import { SafeImage } from '../components/SafeImage';
import { SolarCalculator } from '../components/SolarCalculator';
import { SOLAR_MEDIA } from '../data/defaults';

const TRUST_PILLARS = [
  'Residential Solar Solutions',
  'Commercial Solar Solutions',
  'Industrial Solar EPC',
  'On-Grid Solar Systems',
  'Off-Grid Solar Systems',
  'Hybrid Solar Systems',
  'PM Surya Ghar Assistance',
  'Professional Installation',
];

const WHY_CHARVI = [
  {
    title: 'Quality Components',
    detail: 'High-efficiency monocrystalline/TOPCon PV modules, BIS-compliant inverters, and certified ACDB/DCDB protection.',
  },
  {
    title: 'Professional Installation',
    detail: 'Trained solar technicians following neat DC string routing, proper crimping, and dedicated earthing.',
  },
  {
    title: 'Customized System Design',
    detail: 'Every rooftop is assessed for shadow patterns, load profile, phase capacity, and HDGI structural elevation.',
  },
  {
    title: 'Transparent Quotations',
    detail: 'Itemized bill of materials showing module wattage, inverter make, cable gauge, and structure specification.',
  },
  {
    title: 'Technical Support',
    detail: 'Responsive diagnostics, generation monitoring setup, and preventive maintenance guidance.',
  },
  {
    title: 'Subsidy Documentation Assistance',
    detail: 'Guided support for eligible residential PM Surya Ghar portal registration and DISCOM inspection workflows.',
  },
  {
    title: 'Local Branch Support',
    detail: 'Dedicated teams operating out of Meerut and Aligarh for fast on-site visits across Western UP.',
  },
  {
    title: 'End-to-End Project Execution',
    detail: 'Single-point accountability from initial site survey through net metering coordination and handover.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Free Consultation',
    desc: 'Discuss your monthly electricity bill, backup priorities, and roof availability with our solar specialists.',
  },
  {
    step: '02',
    title: 'Site Survey & Load Analysis',
    desc: 'Our engineers visit your property to measure shadow-free area, roof condition, and sanctioned electrical load.',
  },
  {
    step: '03',
    title: 'System Design & Quotation',
    desc: 'Receive a tailored kW sizing proposal, HDGI structure layout, component specification, and clear pricing.',
  },
  {
    step: '04',
    title: 'Professional Installation',
    desc: 'Structured civil anchoring, module mounting, inverter setup, ACDB/DCDB protection, and earthing completion.',
  },
  {
    step: '05',
    title: 'Testing, Net Metering and Activation, where applicable',
    desc: 'Multi-point safety testing, DISCOM net-meter coordination for grid-tied systems, and full system commissioning.',
  },
];

export function HomePage() {
  const { siteSettings, branches, projects, reviews } = useSiteData();
  const shouldReduceMotion = useReducedMotion();

  const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);
  const displayProjects = featuredProjects.length > 0 ? featuredProjects : projects.slice(0, 3);
  const visibleReviews = reviews.slice(0, 3);
  const meerut = branches.find((b) => b.id === 'meerut') || branches[0];

  return (
    <div>
      <SeoHead
        title="Charvi Technologies and Services | Charvi Solar — Meerut & Aligarh"
        description="Charvi Technologies and Services (Charvi Solar) delivers residential, commercial, and industrial rooftop solar EPC solutions across Meerut, Aligarh, and Uttar Pradesh."
      />

      {/* Cinematic Full-Width Hero */}
      <section className="relative min-h-[600px] lg:min-h-[680px] flex items-center bg-[#0B1D39] overflow-hidden">
        <div className="absolute inset-0">
          <SafeImage
            src={siteSettings.heroImage || SOLAR_MEDIA.heroRooftop}
            alt="Indian independent house with elevated rooftop solar panels installed on HDGI mounting structure"
            loading="eager"
            className="w-full h-full object-cover object-center"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#0B1D39]/95 via-[#0B1D39]/75 to-[#0B1D39]/35"
            aria-hidden="true"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 w-full">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <p className="text-xs sm:text-sm font-semibold text-[#F97316] tracking-wide mb-3">
              {siteSettings.companyName} · Meerut &amp; Aligarh, Uttar Pradesh
            </p>
            <h1
              className="font-display font-extrabold text-white tracking-tight leading-[1.1]"
              style={{ fontSize: 'clamp(2.25rem, 4.2vw, 3.75rem)' }}
            >
              {siteSettings.heroTitle}
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-200 leading-relaxed max-w-xl">
              {siteSettings.heroSubtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/get-quote"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-[#F97316] hover:bg-[#EA580C] rounded-lg transition-colors whitespace-nowrap"
              >
                <span>Get Free Solar Quote</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                to="/projects"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white border border-white/30 hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap"
              >
                <span>Explore Our Projects</span>
              </Link>
            </div>
          </motion.div>
        </div>

        <a
          href="#capabilities"
          aria-label="Scroll to solar capabilities"
          className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/25 text-white/80 hover:text-white absolute bottom-6 left-1/2 -translate-x-1/2 transition-colors"
        >
          <ChevronDown className="w-5 h-5" aria-hidden="true" />
        </a>
      </section>

      {/* Trust Strip */}
      <section id="capabilities" className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-6">
            {TRUST_PILLARS.map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#0B1D39]">
                <Check className="w-4 h-4 text-[#15803D] shrink-0" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Overview + Asymmetric Bento */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
              <p className="text-xs font-semibold text-[#F97316] tracking-wide">
                About {siteSettings.brandName}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0B1D39] tracking-tight">
                Engineered Rooftop Solar Built for Indian Conditions
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                {siteSettings.aboutOverview}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Leadership Contact</p>
                  <p className="text-sm font-bold text-[#0B1D39] mt-0.5">{siteSettings.contactPerson}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Regional Presence</p>
                  <p className="text-sm font-bold text-[#0B1D39] mt-0.5">Meerut &amp; Aligarh, UP</p>
                </div>
              </div>
              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1D39] hover:text-[#F97316] transition-colors"
                >
                  <span>Read Company Profile &amp; Branch Details</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="col-span-2 h-60 sm:h-72 rounded-xl overflow-hidden border border-slate-200">
                <SafeImage
                  src={SOLAR_MEDIA.aboutEpcTeam}
                  alt="Indian solar EPC team installing HDGI rooftop mounting structure and PV modules"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-44 rounded-xl overflow-hidden border border-slate-200">
                <SafeImage
                  src={SOLAR_MEDIA.hdgiStructure}
                  alt="Elevated hot-dip galvanized iron solar mounting structure on concrete terrace"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-44 rounded-xl overflow-hidden border border-slate-200">
                <SafeImage
                  src={SOLAR_MEDIA.engineersTeam}
                  alt="Charvi Solar engineers inspecting solar array and DC cabling"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solar Solutions Bento Grid */}
      <section className="py-16 lg:py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold text-[#F97316] tracking-wide">
              Complete Solar EPC Portfolio
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0B1D39] tracking-tight mt-2">
              Tailored Systems for Every Roof &amp; Load Profile
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              to="/residential-solar"
              className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-[#0B1D39] transition-colors flex flex-col"
            >
              <div className="h-48 overflow-hidden">
                <SafeImage
                  src={SOLAR_MEDIA.heroRooftop}
                  alt="Residential rooftop solar installation on an Indian home"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-slate-500">Homes · Independent Houses · Colonies</p>
                  <h3 className="font-display text-xl font-bold text-[#0B1D39] mt-1">
                    Residential Solar
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    Custom 1 kW to 10 kW+ rooftop plants with elevated HDGI options and PM Surya Ghar subsidy guidance where eligible.
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#F97316]">
                  Explore Residential <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </div>
            </Link>

            <Link
              to="/commercial-solar"
              className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-[#0B1D39] transition-colors flex flex-col"
            >
              <div className="h-48 overflow-hidden">
                <SafeImage
                  src={SOLAR_MEDIA.commercialBuilding}
                  alt="Commercial building rooftop solar installation in India"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-slate-500">Showrooms · Schools · Hospitals · Offices</p>
                  <h3 className="font-display text-xl font-bold text-[#0B1D39] mt-1">
                    Commercial Solar
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    High-yield daytime power offset for commercial tariffs with clean three-phase grid synchronization.
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#F97316]">
                  Explore Commercial <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </div>
            </Link>

            <Link
              to="/industrial-solar"
              className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-[#0B1D39] transition-colors flex flex-col"
            >
              <div className="h-48 overflow-hidden">
                <SafeImage
                  src={SOLAR_MEDIA.industrialFactory}
                  alt="Industrial factory metal shed solar PV array in India"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-slate-500">Factories · Warehouses · Cold Storages</p>
                  <h3 className="font-display text-xl font-bold text-[#0B1D39] mt-1">
                    Industrial Solar EPC
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    Turnkey industrial rooftop EPC designed for tin-shed and RCC roofs with engineered walkways and safety protection.
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#F97316]">
                  Explore Industrial <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Link
              to="/on-grid-solar"
              className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-[#0B1D39] transition-colors flex flex-col"
            >
              <div className="h-44 overflow-hidden">
                <SafeImage
                  src={SOLAR_MEDIA.inverterAcdb}
                  alt="On-grid solar string inverter with ACDB, DCDB and bi-directional net meter"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <p className="text-xs text-slate-500">Net Metering · Zero Battery</p>
                <h3 className="font-display text-lg font-bold text-[#0B1D39] mt-1">
                  On-Grid Solar System
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Export surplus daytime generation to the utility grid for maximum electricity bill savings.
                </p>
              </div>
            </Link>

            <Link
              to="/hybrid-solar"
              className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-[#0B1D39] transition-colors flex flex-col"
            >
              <div className="h-44 overflow-hidden">
                <SafeImage
                  src={SOLAR_MEDIA.hybridHome}
                  alt="Hybrid grid-interactive solar inverter and rooftop PV home setup"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <p className="text-xs text-slate-500">Grid + Battery Backup</p>
                <h3 className="font-display text-lg font-bold text-[#0B1D39] mt-1">
                  Hybrid Solar System
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Grid-connected generation paired with lithium or tubular battery storage for power-cut resilience.
                </p>
              </div>
            </Link>

            <Link
              to="/off-grid-solar"
              className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-[#0B1D39] transition-colors flex flex-col"
            >
              <div className="h-44 overflow-hidden">
                <SafeImage
                  src={SOLAR_MEDIA.offgridBattery}
                  alt="Standalone off-grid solar battery bank and charge controller installation"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <p className="text-xs text-slate-500">Standalone · Battery-Based</p>
                <h3 className="font-display text-lg font-bold text-[#0B1D39] mt-1">
                  Off-Grid Solar System
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Independent solar power and battery storage for farms, remote sites, and erratic grid areas.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Charvi */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold text-[#F97316]">Engineering &amp; Service Standards</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0B1D39] tracking-tight mt-2">
              Why Homeowners &amp; Businesses Choose Charvi
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_CHARVI.map((item, idx) => (
              <div
                key={item.title}
                className="p-6 border border-slate-200 rounded-xl bg-white"
              >
                <span className="font-mono-tabular text-xs font-semibold text-[#F97316]">
                  0{idx + 1}.
                </span>
                <h3 className="font-display text-base font-bold text-[#0B1D39] mt-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-24 bg-[#0B1D39] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold text-[#F97316]">Structured EPC Workflow</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-2">
              How Your Solar Installation Progresses
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {HOW_IT_WORKS.map((item, index) => (
              <motion.div
                key={item.step}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className="p-5 rounded-xl bg-[#132B52] border border-slate-700/70"
              >
                <span className="font-mono-tabular text-2xl font-bold text-[#F97316]">
                  {item.step}
                </span>
                <h3 className="font-display text-base font-bold text-white mt-3">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Solar Calculator */}
      <section className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SolarCalculator />
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-semibold text-[#F97316]">Installation Portfolio</p>
              <h2 className="font-display text-3xl font-bold text-[#0B1D39] tracking-tight mt-1">
                Charvi Solar Projects
              </h2>
            </div>
            <Link
              to="/projects"
              className="text-sm font-semibold text-[#0B1D39] hover:text-[#F97316] inline-flex items-center gap-1.5"
            >
              <span>View All Projects</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {displayProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="border border-slate-200 rounded-xl overflow-hidden bg-white flex flex-col"
                >
                  <div className="h-52 overflow-hidden">
                    <SafeImage
                      src={proj.images?.[0] || proj.afterImage}
                      alt={`${proj.title} — ${proj.capacityKw} kW ${proj.solarType} in ${proj.location}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-slate-500">
                        {proj.capacityKw} kW · {proj.solarType} · {proj.location}
                      </p>
                      <h3 className="font-display text-lg font-bold text-[#0B1D39] mt-1">
                        {proj.title}
                      </h3>
                      {proj.clientName && (
                        <p className="text-xs font-medium text-[#0B1D39]/80 mt-0.5">
                          Site: {proj.clientName}
                        </p>
                      )}
                      <p className="text-sm text-slate-600 mt-2 line-clamp-3">
                        {proj.description}
                      </p>
                    </div>
                    <Link
                      to={`/projects/${proj.slug}`}
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#F97316]"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <div className="h-48 overflow-hidden">
                    <SafeImage
                      src={SOLAR_MEDIA.topconPanels}
                      alt="Mono-PERC and N-Type TOPCon rooftop solar panel array"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-slate-500">Module Architecture</p>
                    <h3 className="font-display text-base font-bold text-[#0B1D39] mt-0.5">
                      High-Efficiency N-Type TOPCon Arrays
                    </h3>
                  </div>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <div className="h-48 overflow-hidden">
                    <SafeImage
                      src={SOLAR_MEDIA.hdgiStructure}
                      alt="Elevated HDGI steel mounting structure preserving usable concrete terrace"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-slate-500">Structural Standards</p>
                    <h3 className="font-display text-base font-bold text-[#0B1D39] mt-0.5">
                      Elevated Hot-Dip Galvanized Mounting
                    </h3>
                  </div>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <div className="h-48 overflow-hidden">
                    <SafeImage
                      src={SOLAR_MEDIA.inverterAcdb}
                      alt="Solar inverter and ACDB DCDB safety distribution setup"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-slate-500">Protection &amp; Grid Sync</p>
                    <h3 className="font-display text-base font-bold text-[#0B1D39] mt-0.5">
                      ACDB/DCDB &amp; Net Metering Commissioning
                    </h3>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-8 bg-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="max-w-2xl">
                  <h3 className="font-display text-lg font-bold text-[#0B1D39]">
                    Verified Charvi Installation Photographs Published Directly by Our Engineering Team
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    We never display fabricated customer project photos. Verified installation case studies, site photos, and customer-approved project videos uploaded via our admin gallery appear here. Contact our Meerut or Aligarh office to inspect recent local installations near you.
                  </p>
                </div>
                <Link
                  to="/contact"
                  className="px-5 py-2.5 text-xs font-semibold bg-[#0B1D39] text-white rounded-lg hover:bg-[#132B52] whitespace-nowrap shrink-0"
                >
                  Schedule a Site Reference
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-16 lg:py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-semibold text-[#F97316]">Verified Feedback</p>
              <h2 className="font-display text-3xl font-bold text-[#0B1D39] tracking-tight mt-1">
                Customer Reviews
              </h2>
            </div>
            <a
              href={siteSettings.googleBusinessUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-white border border-slate-300 text-[#0B1D39] rounded-lg hover:border-[#0B1D39] transition-colors"
            >
              <span>Visit Charvi&apos;s Google Business Profile</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>

          {visibleReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {visibleReviews.map((rev) => (
                <div key={rev.id} className="bg-white border border-slate-200 rounded-xl p-6">
                  <p className="text-xs text-slate-500">
                    {rev.city} · {rev.systemSize || 'Solar Installation'}
                    {rev.verified ? ' · Verified Customer' : ''}
                  </p>
                  <p className="text-sm text-slate-700 mt-3 leading-relaxed">
                    &ldquo;{rev.reviewText}&rdquo;
                  </p>
                  <p className="font-display text-sm font-bold text-[#0B1D39] mt-4">
                    {rev.customerName}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h3 className="font-display text-lg font-bold text-[#0B1D39]">
                  Read Verified Customer Reviews on Google
                </h3>
                <p className="text-sm text-slate-600 mt-1 max-w-xl">
                  Only authentic, consent-approved customer reviews are published on our site. You can view our live Google Business Profile directly at any time.
                </p>
              </div>
              <a
                href={siteSettings.googleBusinessUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 text-xs font-semibold bg-[#0B1D39] text-white rounded-lg hover:bg-[#132B52] inline-flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <span>Open Google Business Profile</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 lg:py-20 bg-[#0B1D39] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Start Your Solar Journey With Charvi Today.
          </h2>
          <p className="text-slate-300 mt-3 text-base max-w-2xl mx-auto">
            Speak directly with our Meerut or Aligarh solar engineering desk for a transparent site survey and custom quotation.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href={`tel:+91${meerut?.phone || '7906573807'}`}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold bg-white text-[#0B1D39] hover:bg-slate-100 rounded-lg transition-colors tabular-nums"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              <span>Call Now ({meerut?.phone || '7906573807'})</span>
            </a>
            <a
              href={`https://wa.me/${siteSettings.whatsappNumber}?text=${encodeURIComponent(
                'Hello Charvi Solar, I would like to start my solar installation consultation.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold bg-[#15803D] hover:bg-[#166534] text-white rounded-lg transition-colors"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              <span>WhatsApp Us</span>
            </a>
            <Link
              to="/get-quote"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg transition-colors"
            >
              <span>Request a Free Quote</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <Link to="/meerut-solar" className="inline-flex items-center gap-1 hover:text-white">
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" /> Meerut Solar Services
            </Link>
            <Link to="/aligarh-solar" className="inline-flex items-center gap-1 hover:text-white">
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" /> Aligarh Solar Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
