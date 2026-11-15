import { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteData } from '../context/SiteDataContext';
import { SeoHead } from '../components/SeoHead';

export function FaqPage() {
  const { faqs } = useSiteData();
  const [category, setCategory] = useState('All');
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);

  const categories = ['All', ...Array.from(new Set(faqs.map((f) => f.category)))];
  const filtered = faqs.filter((f) => category === 'All' || f.category === category);

  return (
    <div>
      <SeoHead
        title="Frequently Asked Questions — Solar EPC & Subsidy FAQ"
        description="Answers to common questions about On-Grid, Off-Grid, Hybrid solar systems, PM Surya Ghar subsidy, rooftop area, and net metering in Uttar Pradesh."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'FAQ', path: '/faq' },
        ]}
        faqItems={filtered.map((f) => ({ question: f.question, answer: f.answer }))}
      />

      <section className="bg-[#0B1D39] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-[#F97316]">Technical &amp; Policy Knowledge Base</p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight mt-2">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-300 mt-3 max-w-2xl text-base">
            Clear answers on system sizing, net metering, battery backup, and PM Surya Ghar subsidy eligibility in Uttar Pradesh.
          </p>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  category === cat
                    ? 'bg-[#0B1D39] text-white border-[#0B1D39]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="border border-slate-200 rounded-xl bg-white overflow-hidden"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <span className="text-xs text-[#F97316] font-semibold">{faq.category}</span>
                      <h2 className="font-display text-base sm:text-lg font-bold text-[#0B1D39] mt-0.5">
                        {faq.question}
                      </h2>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-150 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-12 p-8 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-bold text-[#0B1D39]">
                Have a Site-Specific Question?
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Speak with our Meerut or Aligarh engineering team for load and shadow analysis.
              </p>
            </div>
            <Link
              to="/get-quote"
              className="px-5 py-2.5 text-xs font-semibold bg-[#F97316] text-white rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Request Consultation</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
