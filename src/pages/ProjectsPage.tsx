import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search, Share2, X, ArrowLeft, PlayCircle, CheckCircle2 } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { SeoHead } from '../components/SeoHead';
import { SafeImage } from '../components/SafeImage';

const FILTER_OPTIONS = ['All', 'Residential', 'Commercial', 'Industrial', 'On-Grid', 'Off-Grid', 'Hybrid'];

export function ProjectsPage() {
  const { slug } = useParams<{ slug?: string }>();
  const { projects } = useSiteData();
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleShare = (projectSlug: string, id: string) => {
    const url = `${window.location.origin}/projects/${projectSlug}`;
    if (navigator.share) {
      navigator.share({ title: 'Charvi Solar Project', url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      });
    }
  };

  if (slug) {
    const project = projects.find((p) => p.slug === slug);
    if (!project) {
      return (
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <SeoHead title="Project Not Found — Charvi Solar" description="Project details." />
          <h1 className="font-display text-2xl font-bold text-[#0B1D39]">Project Not Found</h1>
          <p className="text-slate-600 mt-2 text-sm">
            This project may have been archived or is pending publication.
          </p>
          <Link
            to="/projects"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[#0B1D39] text-white rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to All Projects</span>
          </Link>
        </div>
      );
    }

    const allImages = [
      ...(project.images || []),
      ...(project.afterImage ? [project.afterImage] : []),
    ].filter(Boolean);

    return (
      <div>
        <SeoHead
          title={`${project.title} — ${project.capacityKw} kW ${project.solarType}`}
          description={project.description || `${project.capacityKw} kW solar installation in ${project.location} by Charvi Technologies and Services.`}
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'Projects', path: '/projects' },
            { name: project.title, path: `/projects/${project.slug}` },
          ]}
        />

        <section className="bg-[#0B1D39] text-white py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              to="/projects"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white mb-4"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>All Projects</span>
            </Link>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-xs text-[#F97316] font-semibold">
                  {project.category} · {project.solarType} · {project.capacityKw} kW
                </p>
                <h1 className="font-display text-3xl sm:text-4xl font-bold mt-1">
                  {project.title}
                </h1>
                <p className="text-slate-300 text-sm mt-2">
                  {project.location}
                  {project.installationDate ? ` · Installed ${project.installationDate}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleShare(project.slug, project.id)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer self-start"
              >
                <Share2 className="w-4 h-4" aria-hidden="true" />
                <span>{copiedId === project.id ? 'Link Copied' : 'Share Project'}</span>
              </button>
            </div>
          </div>
        </section>

        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-8">
              {/* Gallery */}
              {allImages.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {allImages.map((img, i) => (
                    <button
                      key={`${img}-${i}`}
                      type="button"
                      onClick={() => setLightboxImg(img)}
                      className={`${
                        i === 0 ? 'sm:col-span-2 h-80' : 'h-56'
                      } rounded-xl overflow-hidden border border-slate-200 cursor-pointer text-left`}
                    >
                      <SafeImage src={img} alt={`${project.title} installation photo ${i + 1}`} />
                    </button>
                  ))}
                </div>
              )}

              {/* Before & After */}
              {(project.beforeImage || project.afterImage) && (
                <div>
                  <h2 className="font-display text-xl font-bold text-[#0B1D39] mb-4">
                    Before &amp; After Site Comparison
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {project.beforeImage && (
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="h-52">
                          <SafeImage src={project.beforeImage} alt={`${project.title} before installation`} />
                        </div>
                        <p className="p-3 text-xs font-semibold text-slate-600 bg-slate-50">
                          Before Installation
                        </p>
                      </div>
                    )}
                    {project.afterImage && (
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="h-52">
                          <SafeImage src={project.afterImage} alt={`${project.title} after installation`} />
                        </div>
                        <p className="p-3 text-xs font-semibold text-[#15803D] bg-slate-50">
                          After Commissioning
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Video */}
              {project.videoUrl && (
                <div>
                  <h2 className="font-display text-xl font-bold text-[#0B1D39] mb-3 flex items-center gap-2">
                    <PlayCircle className="w-5 h-5 text-[#F97316]" aria-hidden="true" />
                    <span>Installation Walkthrough Video</span>
                  </h2>
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-black">
                    <video src={project.videoUrl} controls className="w-full max-h-[420px]" />
                  </div>
                </div>
              )}

              <div>
                <h2 className="font-display text-xl font-bold text-[#0B1D39]">Project Overview</h2>
                <p className="text-slate-600 mt-3 leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </div>

              {project.customerApproved && project.customerTestimonial && (
                <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#15803D]">
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    <span>Customer Approved Testimonial</span>
                  </div>
                  <p className="text-slate-700 mt-2 italic leading-relaxed">
                    &ldquo;{project.customerTestimonial}&rdquo;
                  </p>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                <h3 className="font-display text-lg font-bold text-[#0B1D39] mb-4">
                  System Specifications
                </h3>
                <dl className="divide-y divide-slate-200 text-sm">
                  <div className="py-2.5 flex justify-between gap-2">
                    <dt className="text-slate-500">Capacity</dt>
                    <dd className="font-mono-tabular font-semibold text-[#0B1D39]">{project.capacityKw} kW</dd>
                  </div>
                  <div className="py-2.5 flex justify-between gap-2">
                    <dt className="text-slate-500">System Type</dt>
                    <dd className="font-semibold text-[#0B1D39]">{project.solarType}</dd>
                  </div>
                  <div className="py-2.5 flex justify-between gap-2">
                    <dt className="text-slate-500">Category</dt>
                    <dd className="font-semibold text-[#0B1D39]">{project.category}</dd>
                  </div>
                  {project.panelBrand && (
                    <div className="py-2.5 flex justify-between gap-2">
                      <dt className="text-slate-500">Solar Panels</dt>
                      <dd className="font-semibold text-[#0B1D39] text-right">{project.panelBrand}</dd>
                    </div>
                  )}
                  {project.inverterBrand && (
                    <div className="py-2.5 flex justify-between gap-2">
                      <dt className="text-slate-500">Inverter</dt>
                      <dd className="font-semibold text-[#0B1D39] text-right">{project.inverterBrand}</dd>
                    </div>
                  )}
                  {project.structureDetails && (
                    <div className="py-2.5">
                      <dt className="text-slate-500 mb-1">Mounting Structure</dt>
                      <dd className="font-medium text-[#0B1D39]">{project.structureDetails}</dd>
                    </div>
                  )}
                </dl>
                <Link
                  to={`/get-quote?capacity=${project.capacityKw}kW&system=${project.solarType}&property=${project.category}`}
                  className="mt-6 w-full inline-flex items-center justify-center py-3 px-4 text-xs font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg"
                >
                  Request Similar System Quote
                </Link>
              </div>
            </div>
          </div>
        </section>

        {lightboxImg && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightboxImg(null)}
          >
            <button
              type="button"
              onClick={() => setLightboxImg(null)}
              aria-label="Close image preview"
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxImg}
              alt="Enlarged project installation view"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    );
  }

  const filtered = projects.filter((p) => {
    const matchesFilter =
      filter === 'All' || p.category === filter || p.solarType === filter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.panelBrand.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const videoProjects = projects.filter((p) => p.videoUrl);

  return (
    <div>
      <SeoHead
        title="Our Solar Projects — Charvi Technologies and Services"
        description="Explore Residential, Commercial, and Industrial solar PV installations executed by Charvi Technologies and Services in Meerut, Aligarh, and Uttar Pradesh."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Projects', path: '/projects' },
        ]}
      />

      <section className="bg-[#0B1D39] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-[#F97316]">Installation Portfolio</p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight mt-2">
            Our Solar Projects
          </h1>
          <p className="text-slate-300 mt-3 max-w-2xl text-base">
            Authentic rooftop solar projects published directly by the Charvi Solar engineering team with customer consent.
          </p>
        </div>
      </section>

      <section className="py-10 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-lg">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setFilter(opt)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  filter === opt
                    ? 'bg-[#0B1D39] text-white'
                    : 'text-slate-600 hover:text-[#0B1D39]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search city, title, or brand..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((proj) => (
                <div
                  key={proj.id}
                  className="border border-slate-200 rounded-xl overflow-hidden bg-white flex flex-col"
                >
                  <button
                    type="button"
                    onClick={() => setLightboxImg(proj.images?.[0] || proj.afterImage)}
                    className="h-52 overflow-hidden cursor-pointer block w-full text-left"
                  >
                    <SafeImage
                      src={proj.images?.[0] || proj.afterImage}
                      alt={`${proj.title} — ${proj.location}`}
                    />
                  </button>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-slate-500">
                        {proj.category} · {proj.solarType} · {proj.capacityKw} kW
                      </p>
                      <h2 className="font-display text-lg font-bold text-[#0B1D39] mt-1">
                        {proj.title}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">{proj.location}</p>
                      <p className="text-sm text-slate-600 mt-2 line-clamp-3">
                        {proj.description}
                      </p>
                    </div>
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        to={`/projects/${proj.slug}`}
                        className="text-xs font-semibold text-[#F97316] hover:underline"
                      >
                        View Full Case Study
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleShare(proj.slug, proj.id)}
                        className="text-xs text-slate-500 hover:text-[#0B1D39] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{copiedId === proj.id ? 'Copied' : 'Share'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl p-10 bg-slate-50 text-center max-w-2xl mx-auto">
              <h2 className="font-display text-xl font-bold text-[#0B1D39]">
                No Published Projects Match This Filter Yet
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Charvi Technologies and Services publishes only real, verified installation photographs uploaded through our administrator gallery. Request a consultation to view local site references in Meerut or Aligarh.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  to="/get-quote"
                  className="px-5 py-2.5 text-xs font-semibold bg-[#F97316] text-white rounded-lg"
                >
                  Request Free Site Survey
                </Link>
                {filter !== 'All' && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilter('All');
                      setSearch('');
                    }}
                    className="px-5 py-2.5 text-xs font-semibold border border-slate-300 text-[#0B1D39] rounded-lg cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {videoProjects.length > 0 && (
            <div className="mt-16 pt-12 border-t border-slate-200">
              <h2 className="font-display text-2xl font-bold text-[#0B1D39] mb-6">
                Installation Video Gallery
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videoProjects.map((vp) => (
                  <div key={vp.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <video src={vp.videoUrl} controls className="w-full h-64 bg-black" />
                    <div className="p-4">
                      <p className="text-xs text-slate-500">
                        {vp.capacityKw} kW · {vp.location}
                      </p>
                      <h3 className="font-display font-bold text-[#0B1D39] mt-1">{vp.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {lightboxImg && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImg(null)}
            aria-label="Close lightbox"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightboxImg}
            alt="Project preview"
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
