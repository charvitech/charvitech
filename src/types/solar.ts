export type SolarSystemType = 'On-Grid' | 'Off-Grid' | 'Hybrid';
export type PropertyCategory = 'Residential' | 'Commercial' | 'Industrial';
export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Follow-up'
  | 'Quotation Sent'
  | 'Converted'
  | 'Closed';

export interface SiteSettings {
  companyName: string;
  brandName: string;
  tagline: string;
  primaryEmail: string;
  contactPerson: string;
  founderBio: string;
  googleBusinessUrl: string;
  linkedinUrl: string;
  whatsappNumber: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  aboutOverview: string;
  vision: string;
  mission: string;
  qualityCommitment: string;
  servicePhilosophy: string;
  announcementText: string;
  offersBanner: string;
  footerCopyright: string;
  updatedAt?: unknown;
}

export interface SubsidySettings {
  central1Kw: number;
  central2Kw: number;
  central3KwPlus: number;
  statePerKw: number;
  stateMax: number;
  deadlineNote: string;
  disclaimer: string;
  costPerKwOnGridMin: number;
  costPerKwOnGridMax: number;
  costPerKwHybridMin: number;
  costPerKwHybridMax: number;
  costPerKwOffGridMin: number;
  costPerKwOffGridMax: number;
  unitsPerKwMonthly: number;
  sqftPerKw: number;
  tariffPerUnitInr: number;
  updatedAt?: unknown;
}

export interface SeoSettings {
  ga4MeasurementId: string;
  gscVerificationCode: string;
  defaultOgImage: string;
  robotsPolicy: string;
  updatedAt?: unknown;
}

export interface BranchRecord {
  id: string;
  name: string;
  city: string;
  phone: string;
  address: string;
  isAddressVerified: boolean;
  email: string;
  timings: string;
  lat: number;
  lng: number;
  mapDirectionsUrl: string;
  photoUrl: string;
  localSeoHeadline: string;
  localSeoSummary: string;
  updatedAt?: unknown;
}

export interface ProjectRecord {
  id: string;
  slug: string;
  title: string;
  clientName?: string;
  location: string;
  city: string;
  category: PropertyCategory;
  solarType: SolarSystemType;
  capacityKw: number;
  installationDate: string;
  panelBrand: string;
  inverterBrand: string;
  structureDetails: string;
  description: string;
  images: string[];
  beforeImage: string;
  afterImage: string;
  videoUrl: string;
  customerTestimonial: string;
  customerApproved: boolean;
  published: boolean;
  featured: boolean;
  sourceTrackerId?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type ProductCategory =
  | 'Solar Panels'
  | 'Solar Inverters'
  | 'Hybrid Inverters'
  | 'Batteries'
  | 'HDGI Mounting Structures'
  | 'ACDB'
  | 'DCDB'
  | 'Solar Cables'
  | 'Electrical Accessories';

export interface ProductRecord {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  description: string;
  specifications: string;
  imageUrl: string;
  datasheetUrl: string;
  availability: 'Available' | 'On Order' | 'Out of Stock';
  published: boolean;
  updatedAt?: unknown;
}

export interface ReviewRecord {
  id: string;
  customerName: string;
  city: string;
  systemSize: string;
  rating: number;
  reviewText: string;
  googleReviewUrl: string;
  screenshotUrl: string;
  customerPhotoUrl: string;
  consentObtained: boolean;
  verified: boolean;
  published: boolean;
  reviewDate: string;
  updatedAt?: unknown;
}

export interface FaqRecord {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  published: boolean;
  updatedAt?: unknown;
}

export interface MediaAsset {
  id: string;
  name: string;
  folder: string;
  mediaType: 'image' | 'video' | 'pdf';
  url: string;
  altText: string;
  sizeBytes: number;
  uploadedBy: string;
  createdAt?: unknown;
}

export interface EnquiryRecord {
  id: string;
  enquiryCode: string;
  customerName: string;
  mobile: string;
  email: string;
  city: string;
  propertyType: PropertyCategory;
  monthlyBill: string;
  requiredCapacity: string;
  systemType: SolarSystemType;
  branchPreference: string;
  message: string;
  leadSource: string;
  status: LeadStatus;
  internalNotes: string;
  followUpHistory: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AdminUserRecord {
  uid: string;
  email: string;
  displayName: string;
  role: 'super_admin' | 'editor';
  active: boolean;
  createdAt?: unknown;
}

export interface AdminLogRecord {
  id: string;
  actorEmail: string;
  actorUid: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt?: unknown;
}

export interface SiteTrackerRecord {
  id: string;
  srNo: number;
  regSession: string;
  regMonth: string;
  regDate: string;
  customerName: string;
  mobileNo: string;
  cashLoan: string;
  loanStatus: string;
  currentStatus: string;
  applicationNo: string;
  consumerNo: string;
  registration: string;
  agreement: string;
  installedDate: string;
  siteInstalled: string;
  dcrCreate: string;
  netmetering: string;
  subsidyApply: string;
  subsidyDisbursal: string;
  plant: string;
  reference: string;
  plantType: string;
  solarPanel: string;
  inverter: string;
  battery: string;
  plantKw: string;
  categoryPlant: string;
  pendingPay: string;
  firstPayAmt: string;
  firstPayDate: string;
  secondPayAmt: string;
  secondPayDate: string;
  party: string;
  vendor: string;
  dailyNotes: string;
  siteLocation?: string;
  siteTitle?: string;
  siteDescription?: string;
  sitePhotos?: string[];
  publishedToProjects?: boolean;
  featuredOnHome?: boolean;
  linkedProjectId?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}
