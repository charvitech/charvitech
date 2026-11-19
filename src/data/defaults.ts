import {
  BranchRecord,
  FaqRecord,
  ProductRecord,
  ProjectRecord,
  SeoSettings,
  SiteSettings,
  SubsidySettings,
} from '../types/solar';

import heroRooftopImg from '../assets/images/hero_indian_rooftop_solar_1794555962208.jpg';
import commercialBuildingImg from '../assets/images/commercial_indian_building_solar_1794555963177.jpg';
import industrialFactoryImg from '../assets/images/industrial_indian_factory_solar_1794555963967.jpg';
import engineersTeamImg from '../assets/images/indian_solar_engineers_team_1794555964763.jpg';
import inverterAcdbImg from '../assets/images/solar_inverter_acdb_setup_1794555963914.jpg';
import hybridHomeImg from '../assets/images/indian_hybrid_home_solar_1794555964406.jpg';
import leadershipSolarImg from '../assets/images/leadership_indian_solar_engineer_1795066379463.jpg';
import aboutEpcTeamImg from '../assets/images/about_epc_solar_installation_1795066380019.jpg';
import offgridBatteryImg from '../assets/images/offgrid_solar_battery_setup_1795066379992.jpg';
import topconPanelsImg from '../assets/images/topcon_solar_panels_closeup_1795066381632.jpg';
import hdgiStructureImg from '../assets/images/hdgi_mounting_structure_detail_1795066381641.jpg';

export const SOLAR_MEDIA = {
  heroRooftop: heroRooftopImg,
  commercialBuilding: commercialBuildingImg,
  industrialFactory: industrialFactoryImg,
  engineersTeam: engineersTeamImg,
  inverterAcdb: inverterAcdbImg,
  hybridHome: hybridHomeImg,
  leadershipSolar: leadershipSolarImg,
  aboutEpcTeam: aboutEpcTeamImg,
  offgridBattery: offgridBatteryImg,
  topconPanels: topconPanelsImg,
  hdgiStructure: hdgiStructureImg,
};

export const LEGACY_MEDIA_MAP: Record<string, string> = {
  '/src/assets/images/hero_indian_rooftop_solar_1794555962208.jpg': heroRooftopImg,
  '/src/assets/images/commercial_indian_building_solar_1794555963177.jpg': commercialBuildingImg,
  '/src/assets/images/industrial_indian_factory_solar_1794555963967.jpg': industrialFactoryImg,
  '/src/assets/images/indian_solar_engineers_team_1794555964763.jpg': engineersTeamImg,
  '/src/assets/images/solar_inverter_acdb_setup_1794555963914.jpg': inverterAcdbImg,
  '/src/assets/images/indian_hybrid_home_solar_1794555964406.jpg': hybridHomeImg,
  '/src/assets/images/leadership_indian_solar_engineer_1795066379463.jpg': leadershipSolarImg,
  '/src/assets/images/about_epc_solar_installation_1795066380019.jpg': aboutEpcTeamImg,
  '/src/assets/images/offgrid_solar_battery_setup_1795066379992.jpg': offgridBatteryImg,
  '/src/assets/images/topcon_solar_panels_closeup_1795066381632.jpg': topconPanelsImg,
  '/src/assets/images/hdgi_mounting_structure_detail_1795066381641.jpg': hdgiStructureImg,
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  companyName: 'CHARVI TECHNOLOGIES AND SERVICES',
  brandName: 'CHARVI SOLAR',
  tagline: 'Your Trusted Solar Partner',
  primaryEmail: 'charvisolarenergy@gmail.com',
  contactPerson: 'Chandra Prakash',
  founderBio:
    'Chandra Prakash leads Charvi Technologies and Services across Meerut, Aligarh, and surrounding districts of Uttar Pradesh, overseeing site engineering, component procurement, safety standards, and customer handover.',
  googleBusinessUrl: 'https://share.google/tBD5BMj8Oq885VdMe',
  linkedinUrl: 'http://www.linkedin.com/in/charvi-technologies-and-services-6028473ba',
  whatsappNumber: '917906573807',
  heroTitle: 'Power Your Future With Smart Solar Energy',
  heroSubtitle:
    'Complete Residential, Commercial & Industrial Solar Solutions. From Expert Consultation to Professional Installation, Charvi Is Your Trusted Solar Partner.',
  heroImage: SOLAR_MEDIA.heroRooftop,
  aboutOverview:
    'Charvi Technologies and Services (Charvi Solar) is a solar EPC company serving homes, businesses, institutions, and industrial facilities across Meerut, Aligarh, and Western Uttar Pradesh. Every installation is engineered around site load profiles, roof geometry, HDGI mounting structural stability, and long-term generation reliability.',
  vision:
    'To make dependable, cleanly engineered rooftop solar power accessible to every household, commercial complex, and manufacturing unit across Uttar Pradesh.',
  mission:
    'Deliver transparent quotations, compliant DC/AC protection architecture, neat civil-and-electrical workmanship, and responsive local branch support from consultation through commissioning.',
  qualityCommitment:
    'We design systems around established Tier-1 solar modules, BIS-compliant inverters, hot-dip galvanized iron (HDGI) elevated or flush structures, properly rated ACDB/DCDB surge protection, and dedicated copper/chemical earthing.',
  servicePhilosophy:
    'Every quotation is preceded by an on-site shading and load inspection—never guesswork. Customers receive clear bill-of-materials documentation before installation begins.',
  announcementText:
    'Serving Meerut, Aligarh & Western Uttar Pradesh — Schedule a Technical Rooftop Survey',
  offersBanner: '',
  footerCopyright:
    '© 2026 CHARVI TECHNOLOGIES AND SERVICES. All rights reserved.',
};

export const DEFAULT_SUBSIDY_SETTINGS: SubsidySettings = {
  central1Kw: 30000,
  central2Kw: 60000,
  central3KwPlus: 78000,
  statePerKw: 15000,
  stateMax: 30000,
  deadlineNote:
    'Scheme terms, portal timelines, and UPNEDA state incentive availability are governed by active government notifications at the time of consumer registration.',
  disclaimer:
    'Indicative estimate only. Central Financial Assistance (CFA) under PM Surya Ghar: Muft Bijli Yojana applies to eligible residential grid-connected rooftop solar installations subject to National Portal verification, technical feasibility, DISCOM approval, and active government guidelines. UP State subsidy is checked separately against UPNEDA scheme conditions and availability. Standalone off-grid systems, battery components, commercial establishments, and industrial units are not eligible for residential PM Surya Ghar CFA.',
  costPerKwOnGridMin: 52000,
  costPerKwOnGridMax: 62000,
  costPerKwHybridMin: 74000,
  costPerKwHybridMax: 92000,
  costPerKwOffGridMin: 68000,
  costPerKwOffGridMax: 85000,
  unitsPerKwMonthly: 120,
  sqftPerKw: 90,
  tariffPerUnitInr: 7.5,
};

export const DEFAULT_SEO_SETTINGS: SeoSettings = {
  ga4MeasurementId: '',
  gscVerificationCode: '',
  defaultOgImage: SOLAR_MEDIA.heroRooftop,
  robotsPolicy: 'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/',
};

export const DEFAULT_BRANCHES: BranchRecord[] = [
  {
    id: 'meerut',
    name: 'Charvi Technologies and Services — Meerut Branch',
    city: 'Meerut',
    phone: '7906573807',
    address: '[VERIFIED COMPLETE MEERUT OFFICE ADDRESS PENDING — UPDATE IN ADMIN]',
    isAddressVerified: false,
    email: 'charvisolarenergy@gmail.com',
    timings: 'Monday – Saturday · Confirm hours via branch phone',
    lat: 28.9845,
    lng: 77.7064,
    mapDirectionsUrl: 'https://www.google.com/maps/search/?api=1&query=Meerut+Uttar+Pradesh',
    photoUrl: SOLAR_MEDIA.commercialBuilding,
    localSeoHeadline: 'Solar Company & Rooftop EPC Services in Meerut, Uttar Pradesh',
    localSeoSummary:
      'Charvi Technologies and Services provides residential rooftop solar, commercial showroom solar systems, industrial EPC installations, and PM Surya Ghar documentation assistance across Meerut district and nearby NCR corridors.',
  },
  {
    id: 'aligarh',
    name: 'Charvi Technologies and Services — Aligarh Branch',
    city: 'Aligarh',
    phone: '8476030036',
    address: 'Haiwatpur Siya, Siya Khas, Aligarh, Uttar Pradesh – 202001',
    isAddressVerified: true,
    email: 'charvisolarenergy@gmail.com',
    timings: 'Monday – Saturday · Confirm hours via branch phone',
    lat: 27.8974,
    lng: 78.088,
    mapDirectionsUrl:
      'https://www.google.com/maps/search/?api=1&query=Haiwatpur+Siya+Siya+Khas+Aligarh+Uttar+Pradesh+202001',
    photoUrl: SOLAR_MEDIA.heroRooftop,
    localSeoHeadline: 'Solar Panel Installation & EPC Company in Aligarh, Uttar Pradesh',
    localSeoSummary:
      'From residential homes in Aligarh and surrounding tehsils to commercial complexes and workshops, our Aligarh branch at Haiwatpur Siya, Siya Khas handles site surveys, HDGI structural mounting, net metering coordination, and after-sales technical support.',
  },
];

// Notice: No fake customer installation projects or fabricated testimonials are pre-seeded.
// Actual Charvi installations uploaded via Admin Dashboard appear automatically.
// Here we provide clear sample architectural capability showcase entries marked clearly, OR empty real projects?
// Wait: Prompt rule: "Do not use fake installation photographs as actual Charvi projects. Prioritize original photographs uploaded through the admin panel."
// "Never invent business facts, installation counts, testimonials, certifications, government approvals or subsidy guarantees."
// So in Projects & Reviews, we start clean with an informative state inviting the admin to publish verified Charvi installations, AND we showcase real EPC system configurations & technical capabilities across service pages!
export const DEFAULT_PROJECTS: ProjectRecord[] = [];

export const DEFAULT_PRODUCTS: ProductRecord[] = [
  {
    id: 'prod-mono-perc-topcon-panels',
    name: 'Mono-PERC & N-Type TOPCon Solar PV Modules (540Wp – 585Wp)',
    brand: 'Waaree / Adani Solar / Tata Power Solar',
    category: 'Solar Panels',
    description:
      'High-efficiency monocrystalline and bifacial PV modules selected based on roof layout, shading profile, and system voltage architecture.',
    specifications:
      'Output Range: 540Wp to 585Wp · Half-cut cell architecture · IP68 junction box · PID resistant · Anodized aluminum frame',
    imageUrl: SOLAR_MEDIA.topconPanels,
    datasheetUrl: '',
    availability: 'Available',
    published: true,
  },
  {
    id: 'prod-ongrid-string-inverter',
    name: 'Single-Phase & Three-Phase On-Grid String Inverters',
    brand: 'Growatt / Sungrow / Havells / Polycab',
    category: 'Solar Inverters',
    description:
      'Grid-tied solar inverters engineered for high conversion efficiency, multi-MPPT string tracking, and Wi-Fi generation monitoring.',
    specifications:
      'Capacities: 3 kW to 100 kW · IP65/IP66 outdoor rated · Built-in DC SPD & anti-islanding protection · Mobile app monitoring',
    imageUrl: SOLAR_MEDIA.inverterAcdb,
    datasheetUrl: '',
    availability: 'Available',
    published: true,
  },
  {
    id: 'prod-hybrid-solar-inverter',
    name: 'Grid-Interactive Hybrid Solar Inverter & Battery Architecture',
    brand: 'Growatt / Sungrow / Havells',
    category: 'Hybrid Inverters',
    description:
      'Dual-mode inverter combining rooftop solar generation, grid synchronization, and intelligent lithium or tubular battery charging.',
    specifications:
      'Seamless backup switchover · Programmable grid export/import priority · Compatible with LiFePO4 & lead-acid banks',
    imageUrl: SOLAR_MEDIA.hybridHome,
    datasheetUrl: '',
    availability: 'Available',
    published: true,
  },
  {
    id: 'prod-hdgi-structure',
    name: 'Elevated & Flush Hot-Dip Galvanized Iron (HDGI) Mounting Structures',
    brand: 'Charvi EPC Engineered Fabrication',
    category: 'HDGI Mounting Structures',
    description:
      'Custom wind-load engineered terrace structures enabling full rooftop utility below elevated arrays or low-profile shed mounting for industrial roofs.',
    specifications:
      'Hot-dip galvanized steel (80+ micron coating target) · SS304 fasteners · Anchored with chemical/mechanical fasteners & waterproofing',
    imageUrl: SOLAR_MEDIA.hdgiStructure,
    datasheetUrl: '',
    availability: 'Available',
    published: true,
  },
  {
    id: 'prod-acdb-dcdb-protection',
    name: 'ACDB, DCDB, Earthing & DC Solar Cable Protection Assemblies',
    brand: 'Havells / Polycab',
    category: 'ACDB',
    description:
      'Pre-wired AC and DC distribution boxes with Type-II surge protection devices (SPDs), MCB/MCCB isolation, DC fuses, and UV-resistant TUV solar cables.',
    specifications:
      'IP65 polycarbonate enclosure · Type-II AC/DC SPD · 4 sq.mm / 6 sq.mm twin-insulated DC solar cable · Dedicated chemical earthing & LA',
    imageUrl: SOLAR_MEDIA.inverterAcdb,
    datasheetUrl: '',
    availability: 'Available',
    published: true,
  },
  {
    id: 'prod-dcdb-combiner',
    name: 'DC Distribution Box (DCDB) & String Surge Protection',
    brand: 'Havells / Polycab',
    category: 'DCDB',
    description:
      'Multi-string DC protection enclosure safeguarding inverter MPPT inputs against lightning-induced surges and reverse currents.',
    specifications:
      '1000V DC rated · DC fuse holders · Type-II DC SPD · MC4 waterproof input/output glands',
    imageUrl: SOLAR_MEDIA.inverterAcdb,
    datasheetUrl: '',
    availability: 'Available',
    published: true,
  },
  {
    id: 'prod-solar-cables',
    name: 'UV-Stabilized Tinned Copper Solar DC & Armored AC Cables',
    brand: 'Polycab / Havells',
    category: 'Solar Cables',
    description:
      'Electron-beam cross-linked DC solar cabling designed for 25-year rooftop UV and thermal exposure alongside armored AC evacuation cables.',
    specifications:
      '1.5kV DC rated · Tinned copper conductor · Flame-retardant halogen-free outer sheath',
    imageUrl: SOLAR_MEDIA.aboutEpcTeam,
    datasheetUrl: '',
    availability: 'Available',
    published: true,
  },
  {
    id: 'prod-solar-batteries',
    name: 'Solar Lithium (LiFePO4) & C10 Tubular Battery Banks',
    brand: 'System Configured',
    category: 'Batteries',
    description:
      'Deep-cycle energy storage banks sized strictly to critical backup load hours for Off-Grid and Hybrid solar installations.',
    specifications:
      'High cycle life · BMS protection (LiFePO4) · Matched charge/discharge curves for hybrid and off-grid inverters',
    imageUrl: SOLAR_MEDIA.offgridBattery,
    datasheetUrl: '',
    availability: 'On Order',
    published: true,
  },
];

export const DEFAULT_FAQS: FaqRecord[] = [
  {
    id: 'faq-1',
    question: 'What is the difference between On-Grid, Off-Grid, and Hybrid solar systems?',
    answer:
      'An On-Grid system connects directly to your utility electricity grid and exports surplus daytime power via net metering without batteries. An Off-Grid system operates independently using batteries and does not export to the grid—suitable where grid supply is absent or highly unreliable. A Hybrid system connects to the grid while also maintaining a battery bank so essential home or office loads stay powered during outages.',
    category: 'General',
    sortOrder: 1,
    published: true,
  },
  {
    id: 'faq-2',
    question: 'Who is eligible for the PM Surya Ghar Muft Bijli Yojana subsidy?',
    answer:
      'Central Financial Assistance (CFA) under PM Surya Ghar is available for eligible residential grid-connected rooftop solar installations registered on the National Portal (pmsuryaghar.gov.in), subject to valid domestic electricity connection, DISCOM feasibility, and portal guidelines. Commercial, industrial, and standalone off-grid systems are not eligible for residential CFA.',
    category: 'Subsidy',
    sortOrder: 2,
    published: true,
  },
  {
    id: 'faq-3',
    question: 'How does the UP State (UPNEDA) subsidy combine with the Central subsidy?',
    answer:
      'For eligible residential grid-connected consumers in Uttar Pradesh, UPNEDA provides an additional state incentive structure (₹15,000 per kW up to a maximum of ₹30,000), checked separately from the Central subsidy (up to ₹78,000 for 3 kW and above). Together, eligible 3 kW+ residential grid-connected installations may qualify for combined potential support up to ₹1,08,000, subject to active scheme rules, availability, and final verification.',
    category: 'Subsidy',
    sortOrder: 3,
    published: true,
  },
  {
    id: 'faq-4',
    question: 'Are Hybrid solar systems eligible for PM Surya Ghar subsidy?',
    answer:
      'Hybrid systems may be considered potentially eligible only when they are grid-connected, comply with active National Portal and DISCOM net-metering technical specifications, and use approved components. Battery cost itself is not independently subsidized, and standalone off-grid systems are not eligible.',
    category: 'Hybrid',
    sortOrder: 4,
    published: true,
  },
  {
    id: 'faq-5',
    question: 'How much rooftop shadow-free area is required per kW of solar?',
    answer:
      'Typically, 1 kW of modern monocrystalline or TOPCon solar panels requires approximately 80 to 100 sq. ft. of shadow-free rooftop space. Elevated HDGI structures allow you to continue using your concrete terrace underneath the array.',
    category: 'Residential',
    sortOrder: 5,
    published: true,
  },
  {
    id: 'faq-6',
    question: 'Which cities and districts does Charvi Technologies and Services serve?',
    answer:
      'We operate through our Meerut and Aligarh branches, serving residential, commercial, and industrial clients across Meerut, Aligarh, and surrounding districts of Uttar Pradesh.',
    category: 'General',
    sortOrder: 6,
    published: true,
  },
  {
    id: 'faq-7',
    question: 'Do commercial and industrial solar installations qualify for accelerated depreciation or tax benefits?',
    answer:
      'Commercial and industrial solar projects do not receive residential PM Surya Ghar CFA, though businesses may evaluate applicable commercial financing or tax depreciation provisions with their chartered accountant alongside net-metering/captive regulations.',
    category: 'Commercial',
    sortOrder: 7,
    published: true,
  },
];
