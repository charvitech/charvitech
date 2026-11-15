import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X, Phone } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';

const SOLUTION_LINKS = [
  { label: 'All Services', to: '/services' },
  { label: 'Residential Solar', to: '/residential-solar' },
  { label: 'Commercial Solar', to: '/commercial-solar' },
  { label: 'Industrial Solar', to: '/industrial-solar' },
  { label: 'On-Grid Solar System', to: '/on-grid-solar' },
  { label: 'Off-Grid Solar System', to: '/off-grid-solar' },
  { label: 'Hybrid Solar System', to: '/hybrid-solar' },
];

export function Navbar() {
  const { pathname } = useLocation();
  const { siteSettings } = useSiteData();
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSolutionsOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSolutionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const isSolutionActive = SOLUTION_LINKS.some((s) => s.to === pathname);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line brand wordmark */}
        <Link
          to="/"
          className="font-display text-lg font-bold tracking-tight text-[#0B1D39] whitespace-nowrap shrink-0 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] rounded"
        >
          <span
            className="w-2.5 h-2.5 bg-[#F97316] rounded-xs inline-block shrink-0"
            aria-hidden="true"
          />
          <span>{siteSettings.brandName || 'CHARVI SOLAR'}</span>
        </Link>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          <Link
            to="/about"
            className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
              pathname === '/about'
                ? 'text-[#0B1D39] border-[#F97316]'
                : 'border-transparent hover:text-[#0B1D39] hover:border-slate-300'
            }`}
          >
            About Us
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setSolutionsOpen((prev) => !prev)}
              aria-expanded={solutionsOpen}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors inline-flex items-center gap-1 cursor-pointer ${
                isSolutionActive
                  ? 'text-[#0B1D39] border-[#F97316]'
                  : 'border-transparent hover:text-[#0B1D39] hover:border-slate-300'
              }`}
            >
              <span>Solar Solutions</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-150 ${
                  solutionsOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>

            {solutionsOpen && (
              <div className="absolute left-0 top-full mt-2 w-60 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
                {SOLUTION_LINKS.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`block px-4 py-2 text-sm transition-colors ${
                      pathname === item.to
                        ? 'text-[#F97316] font-semibold bg-slate-50'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-[#0B1D39]'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="border-t border-slate-100 my-1" />
                <Link
                  to="/products"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#0B1D39]"
                >
                  Solar Products &amp; Brands
                </Link>
                <Link
                  to="/reviews"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#0B1D39]"
                >
                  Customer Reviews
                </Link>
                <Link
                  to="/faq"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#0B1D39]"
                >
                  Solar FAQs
                </Link>
              </div>
            )}
          </div>

          <Link
            to="/pm-surya-ghar-subsidy"
            className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
              pathname === '/pm-surya-ghar-subsidy'
                ? 'text-[#0B1D39] border-[#F97316]'
                : 'border-transparent hover:text-[#0B1D39] hover:border-slate-300'
            }`}
          >
            Subsidy
          </Link>

          <Link
            to="/projects"
            className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
              pathname.startsWith('/projects')
                ? 'text-[#0B1D39] border-[#F97316]'
                : 'border-transparent hover:text-[#0B1D39] hover:border-slate-300'
            }`}
          >
            Projects
          </Link>

          <Link
            to="/contact"
            className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
              pathname === '/contact'
                ? 'text-[#0B1D39] border-[#F97316]'
                : 'border-transparent hover:text-[#0B1D39] hover:border-slate-300'
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* Zone 3: 1 primary action + mobile menu toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/get-quote"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#F97316] hover:bg-[#EA580C] rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Get Free Quote
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-slate-200 text-[#0B1D39] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white max-h-[82vh] overflow-y-auto">
          <nav aria-label="Mobile Navigation" className="px-4 py-4 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#0B1D39] hover:bg-slate-50"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#0B1D39] hover:bg-slate-50"
            >
              About Us
            </Link>
            <div className="pt-2 pb-1 px-3 text-xs font-semibold text-slate-400">
              Solar Solutions
            </div>
            {SOLUTION_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-slate-100 my-2" />
            <Link
              to="/pm-surya-ghar-subsidy"
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#0B1D39] hover:bg-slate-50"
            >
              PM Surya Ghar Subsidy
            </Link>
            <Link
              to="/projects"
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#0B1D39] hover:bg-slate-50"
            >
              Our Projects
            </Link>
            <Link
              to="/products"
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#0B1D39] hover:bg-slate-50"
            >
              Solar Products &amp; Brands
            </Link>
            <Link
              to="/reviews"
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#0B1D39] hover:bg-slate-50"
            >
              Customer Reviews
            </Link>
            <Link
              to="/faq"
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#0B1D39] hover:bg-slate-50"
            >
              FAQ
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#0B1D39] hover:bg-slate-50"
            >
              Contact Us
            </Link>
            <div className="pt-3 flex flex-col gap-2">
              <Link
                to="/get-quote"
                className="w-full py-3 px-4 text-center text-sm font-semibold text-white bg-[#F97316] rounded-lg"
              >
                Get Free Solar Quote
              </Link>
              <a
                href="tel:+917906573807"
                className="w-full py-3 px-4 text-center text-sm font-semibold text-[#0B1D39] border border-slate-200 rounded-lg inline-flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                <span>Meerut: 7906573807</span>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
