import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { SiteDataProvider, useSiteData } from './context/SiteDataContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { SolutionPage } from './pages/SolutionPage';
import { SubsidyPage } from './pages/SubsidyPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProductsPage } from './pages/ProductsPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { FaqPage } from './pages/FaqPage';
import { ContactPage } from './pages/ContactPage';
import { LocalSeoPage } from './pages/LocalSeoPage';
import { GetQuotePage } from './pages/GetQuotePage';
import { PrivacyPolicyPage, TermsPage } from './pages/LegalPages';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

function Ga4Injector() {
  const { seoSettings } = useSiteData();

  useEffect(() => {
    const id = seoSettings.ga4MeasurementId?.trim();
    if (!id || !/^G-[A-Z0-9]+$/i.test(id)) return;
    if (document.getElementById('charvi-ga4-script')) return;

    const s1 = document.createElement('script');
    s1.id = 'charvi-ga4-script';
    s1.async = true;
    s1.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(s1);

    const s2 = document.createElement('script');
    s2.id = 'charvi-ga4-inline';
    s2.textContent = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${id}');`;
    document.head.appendChild(s2);
  }, [seoSettings.ga4MeasurementId]);

  return null;
}

function AppShell() {
  const { pathname } = useLocation();
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  useEffect(() => {
    const onQuotaExceeded = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuotaExceeded);
  }, []);

  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <ScrollToTop />
      <Ga4Injector />

      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {!isAdminRoute && <Navbar />}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<SolutionPage slug="services" />} />
          <Route path="/residential-solar" element={<SolutionPage slug="residential" />} />
          <Route path="/commercial-solar" element={<SolutionPage slug="commercial" />} />
          <Route path="/industrial-solar" element={<SolutionPage slug="industrial" />} />
          <Route path="/on-grid-solar" element={<SolutionPage slug="on-grid" />} />
          <Route path="/off-grid-solar" element={<SolutionPage slug="off-grid" />} />
          <Route path="/hybrid-solar" element={<SolutionPage slug="hybrid" />} />
          <Route path="/pm-surya-ghar-subsidy" element={<SubsidyPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:slug" element={<ProjectsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/get-quote" element={<GetQuotePage />} />
          <Route path="/meerut-solar" element={<LocalSeoPage citySlug="meerut" />} />
          <Route path="/aligarh-solar" element={<LocalSeoPage citySlug="aligarh" />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-and-conditions" element={<TermsPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <FloatingWhatsApp />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SiteDataProvider>
        <AppShell />
      </SiteDataProvider>
    </BrowserRouter>
  );
}
