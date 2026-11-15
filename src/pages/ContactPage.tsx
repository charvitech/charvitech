import { Phone, Mail, MapPin, Clock, MessageCircle, ExternalLink, AlertCircle } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { SeoHead } from '../components/SeoHead';
import { SafeImage } from '../components/SafeImage';
import { BranchMap } from '../components/BranchMap';
import { EnquiryForm } from '../components/EnquiryForm';

export function ContactPage() {
  const { branches, siteSettings } = useSiteData();

  return (
    <div>
      <SeoHead
        title="Contact Us — Meerut & Aligarh Solar Branches | Charvi Solar"
        description="Contact Charvi Technologies and Services (Charvi Solar) in Meerut (7906573807) and Aligarh (8476030036) or email charvisolarenergy@gmail.com."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Contact Us', path: '/contact' },
        ]}
      />

      <section className="bg-[#0B1D39] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-[#F97316]">Regional Offices &amp; Support Desk</p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight mt-2">
            Contact {siteSettings.companyName}
          </h1>
          <p className="text-slate-300 mt-3 max-w-2xl text-base">
            Connect directly with Chandra Prakash and our Meerut or Aligarh engineering branches for site surveys, solar quotations, and subsidy assistance.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-6 text-sm">
            <a
              href={`mailto:${siteSettings.primaryEmail}`}
              className="inline-flex items-center gap-2 text-white hover:text-[#F97316]"
            >
              <Mail className="w-4 h-4 text-[#F97316]" aria-hidden="true" />
              <span>{siteSettings.primaryEmail}</span>
            </a>
            <a
              href={siteSettings.googleBusinessUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white"
            >
              <span>Google Business Profile</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
            <a
              href={siteSettings.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white"
            >
              <span>LinkedIn</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      {/* Branch Cards + Maps */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              <div className="lg:col-span-5 space-y-5">
                <div className="h-48 rounded-xl overflow-hidden border border-slate-200">
                  <SafeImage src={branch.photoUrl} alt={`${branch.name} photo`} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#F97316]">{branch.city} Branch</p>
                  <h2 className="font-display text-2xl font-bold text-[#0B1D39] mt-1">
                    {branch.name}
                  </h2>
                </div>

                {!branch.isAddressVerified && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-950">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>
                      Placeholder notice: Verified complete Meerut office street address is awaiting admin confirmation. Call {branch.phone} before visiting in person.
                    </span>
                  </div>
                )}

                <dl className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#F97316] shrink-0 mt-1" aria-hidden="true" />
                    <dd className="text-slate-700">{branch.address}</dd>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#F97316] shrink-0" aria-hidden="true" />
                    <dd>
                      <a
                        href={`tel:+91${branch.phone}`}
                        className="font-mono-tabular font-bold text-[#0B1D39] hover:text-[#F97316]"
                      >
                        +91 {branch.phone}
                      </a>
                    </dd>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[#F97316] shrink-0" aria-hidden="true" />
                    <dd>
                      <a
                        href={`mailto:${branch.email || siteSettings.primaryEmail}`}
                        className="text-slate-700 hover:text-[#0B1D39]"
                      >
                        {branch.email || siteSettings.primaryEmail}
                      </a>
                    </dd>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-[#F97316] shrink-0" aria-hidden="true" />
                    <dd className="text-slate-600">{branch.timings}</dd>
                  </div>
                </dl>

                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href={`tel:+91${branch.phone}`}
                    className="px-4 py-2.5 text-xs font-semibold bg-[#0B1D39] text-white rounded-lg inline-flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Call {branch.city}</span>
                  </a>
                  <a
                    href={`https://wa.me/91${branch.phone}?text=${encodeURIComponent(
                      `Hello Charvi Solar ${branch.city} Branch, I would like to enquire about solar installation.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 text-xs font-semibold bg-[#15803D] text-white rounded-lg inline-flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={branch.mapDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 text-xs font-semibold border border-slate-300 text-[#0B1D39] rounded-lg inline-flex items-center gap-1.5 hover:bg-slate-50"
                  >
                    <span>Get Directions</span>
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>

              <div className="lg:col-span-7">
                <BranchMap branch={branch} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Branch Enquiry Form */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold text-[#F97316]">Direct Branch Enquiry</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B1D39] mt-1">
              Send a Message to Our Team
            </h2>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
            <EnquiryForm leadSource="Contact Page Branch Form" />
          </div>
        </div>
      </section>
    </div>
  );
}
