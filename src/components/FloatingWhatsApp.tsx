import { MessageCircle } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';

export function FloatingWhatsApp() {
  const { siteSettings } = useSiteData();
  const number = siteSettings.whatsappNumber || '917906573807';
  const href = `https://wa.me/${number}?text=${encodeURIComponent(
    'Hello Charvi Solar, I would like information about a rooftop solar installation.'
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp with Charvi Solar"
      className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[#15803D] hover:bg-[#166534] text-white shadow-lg transition-transform duration-150 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#15803D]"
    >
      <MessageCircle className="w-5 h-5" aria-hidden="true" />
      <span className="hidden sm:inline text-xs font-semibold whitespace-nowrap">
        WhatsApp Us
      </span>
    </a>
  );
}
