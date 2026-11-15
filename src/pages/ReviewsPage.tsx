import { ExternalLink, CheckCircle2, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteData } from '../context/SiteDataContext';
import { SeoHead } from '../components/SeoHead';
import { SafeImage } from '../components/SafeImage';

export function ReviewsPage() {
  const { reviews, siteSettings } = useSiteData();

  return (
    <div>
      <SeoHead
        title="Customer Reviews — Charvi Technologies and Services"
        description="Read verified customer reviews and visit the official Google Business Profile for Charvi Technologies and Services (Charvi Solar)."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Customer Reviews', path: '/reviews' },
        ]}
      />

      <section className="bg-[#0B1D39] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold text-[#F97316]">Client Feedback</p>
            <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight mt-2">
              Customer Reviews
            </h1>
            <p className="text-slate-300 mt-3 max-w-2xl text-base">
              Authentic reviews published with customer consent alongside direct access to our Google Business Profile.
            </p>
          </div>
          <a
            href={siteSettings.googleBusinessUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg transition-colors whitespace-nowrap self-start"
          >
            <span>View Google Business Profile</span>
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((rev) => (
                <article
                  key={rev.id}
                  className="border border-slate-200 rounded-xl p-6 bg-white flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                      <span>
                        {rev.city} {rev.systemSize ? `· ${rev.systemSize}` : ''}
                      </span>
                      {rev.verified && (
                        <span className="inline-flex items-center gap-1 text-[#15803D] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                          Verified
                        </span>
                      )}
                    </div>

                    {rev.rating > 0 && (
                      <div className="flex items-center gap-1 mt-3" aria-label={`Rated ${rev.rating} out of 5`}>
                        {Array.from({ length: Math.round(rev.rating) }).map((_, idx) => (
                          <Star
                            key={idx}
                            className="w-4 h-4 fill-[#F97316] text-[#F97316]"
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                    )}

                    <p className="text-sm text-slate-700 mt-3 leading-relaxed">
                      &ldquo;{rev.reviewText}&rdquo;
                    </p>

                    {rev.screenshotUrl && (
                      <div className="mt-4 h-40 rounded-lg overflow-hidden border border-slate-200">
                        <SafeImage src={rev.screenshotUrl} alt={`Review screenshot from ${rev.customerName}`} />
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {rev.customerPhotoUrl && rev.consentObtained && (
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 shrink-0">
                          <SafeImage src={rev.customerPhotoUrl} alt={rev.customerName} />
                        </div>
                      )}
                      <div>
                        <p className="font-display text-sm font-bold text-[#0B1D39]">
                          {rev.customerName}
                        </p>
                        {rev.reviewDate && (
                          <p className="text-xs text-slate-500">{rev.reviewDate}</p>
                        )}
                      </div>
                    </div>

                    {rev.googleReviewUrl && (
                      <a
                        href={rev.googleReviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-[#0B1D39] hover:text-[#F97316] inline-flex items-center gap-1"
                      >
                        <span>Source</span>
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl p-10 bg-slate-50 text-center max-w-2xl mx-auto">
              <h2 className="font-display text-xl font-bold text-[#0B1D39]">
                Verified Reviews Are Published Directly From Customer Submissions
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                We do not display fabricated testimonials or synthetic ratings. Visit our official Google Business Profile to inspect live customer feedback, or request a quotation to connect with our branch team.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <a
                  href={siteSettings.googleBusinessUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 text-xs font-semibold bg-[#0B1D39] text-white rounded-lg inline-flex items-center gap-2"
                >
                  <span>Visit Google Business Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
                <Link
                  to="/get-quote"
                  className="px-5 py-2.5 text-xs font-semibold bg-[#F97316] text-white rounded-lg"
                >
                  Get Free Solar Quote
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
