import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ExternalLink } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';

export function Footer() {
  const { siteSettings, branches } = useSiteData();
  const meerut = branches.find((b) => b.id === 'meerut') || branches[0];
  const aligarh = branches.find((b) => b.id === 'aligarh') || branches[1];

  return (
    <footer className="bg-[#0B1D39] text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1 */}
          <div className="space-y-4">
            <div>
              <p className="font-display text-lg font-bold text-white tracking-tight">
                {siteSettings.companyName}
              </p>
              <p className="text-sm text-[#F97316] font-medium mt-1">
                {siteSettings.tagline}
              </p>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Solar EPC Partner for residential, commercial, and industrial rooftop solar power plants across Meerut, Aligarh, and Western Uttar Pradesh.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-sm">
              <a
                href={siteSettings.googleBusinessUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#F97316] transition-colors inline-flex items-center gap-1.5"
              >
                <span>Google Business</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <a
                href={siteSettings.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#F97316] transition-colors inline-flex items-center gap-1.5"
              >
                <span>LinkedIn</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Our Services</Link></li>
              <li><Link to="/projects" className="hover:text-white transition-colors">Our Projects</Link></li>
              <li><Link to="/pm-surya-ghar-subsidy" className="hover:text-white transition-colors">PM Surya Ghar Subsidy</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Solar Products &amp; Brands</Link></li>
              <li><Link to="/reviews" className="hover:text-white transition-colors">Customer Reviews</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white mb-4">Solar Solutions</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/residential-solar" className="hover:text-white transition-colors">Residential Solar</Link></li>
              <li><Link to="/commercial-solar" className="hover:text-white transition-colors">Commercial Solar</Link></li>
              <li><Link to="/industrial-solar" className="hover:text-white transition-colors">Industrial Solar EPC</Link></li>
              <li><Link to="/on-grid-solar" className="hover:text-white transition-colors">On-Grid Solar System</Link></li>
              <li><Link to="/off-grid-solar" className="hover:text-white transition-colors">Off-Grid Solar System</Link></li>
              <li><Link to="/hybrid-solar" className="hover:text-white transition-colors">Hybrid Solar System</Link></li>
              <li><Link to="/meerut-solar" className="hover:text-white transition-colors">Solar in Meerut</Link></li>
              <li><Link to="/aligarh-solar" className="hover:text-white transition-colors">Solar in Aligarh</Link></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white mb-4">Contact</h3>
            <div className="space-y-4 text-sm">
              {meerut && (
                <div className="space-y-1">
                  <p className="font-medium text-white">Meerut Branch</p>
                  <a
                    href={`tel:+91${meerut.phone}`}
                    className="inline-flex items-center gap-2 text-slate-300 hover:text-white tabular-nums"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
                    <span>{meerut.phone}</span>
                  </a>
                  <p className="text-xs text-slate-400 flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-500" aria-hidden="true" />
                    <span>{meerut.address}</span>
                  </p>
                </div>
              )}

              {aligarh && (
                <div className="space-y-1">
                  <p className="font-medium text-white">Aligarh Branch</p>
                  <a
                    href={`tel:+91${aligarh.phone}`}
                    className="inline-flex items-center gap-2 text-slate-300 hover:text-white tabular-nums"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
                    <span>{aligarh.phone}</span>
                  </a>
                  <p className="text-xs text-slate-400 flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-500" aria-hidden="true" />
                    <span>{aligarh.address}</span>
                  </p>
                </div>
              )}

              <div className="pt-1 space-y-2">
                <a
                  href={`mailto:${siteSettings.primaryEmail}`}
                  className="inline-flex items-center gap-2 text-slate-300 hover:text-white break-all"
                >
                  <Mail className="w-3.5 h-3.5 text-[#F97316] shrink-0" aria-hidden="true" />
                  <span>{siteSettings.primaryEmail}</span>
                </a>
                <div>
                  <a
                    href={`https://wa.me/${siteSettings.whatsappNumber || '917906573807'}?text=${encodeURIComponent(
                      'Hello Charvi Technologies and Services, I would like a solar consultation.'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-3.5 py-2 text-xs font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors"
                  >
                    WhatsApp Consultation
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
          <p>{siteSettings.footerCopyright}</p>
          <div className="flex flex-wrap items-center gap-5">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-and-conditions" className="hover:text-white transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link to="/admin/login" className="hover:text-white transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
