import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileDown, ArrowRight } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { SeoHead } from '../components/SeoHead';
import { SafeImage } from '../components/SafeImage';

const PRODUCT_CATEGORIES = [
  'All',
  'Solar Panels',
  'Solar Inverters',
  'Hybrid Inverters',
  'Batteries',
  'HDGI Mounting Structures',
  'ACDB',
  'DCDB',
  'Solar Cables',
  'Electrical Accessories',
];

const FEATURED_BRANDS = [
  'Adani Solar',
  'Tata Power Solar',
  'Waaree',
  'Havells',
  'Polycab',
  'Growatt',
  'Sungrow',
];

export function ProductsPage() {
  const { products } = useSiteData();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filtered = products.filter(
    (p) => selectedCategory === 'All' || p.category === selectedCategory
  );

  return (
    <div>
      <SeoHead
        title="Solar Products & Brands — Charvi Technologies and Services"
        description="Explore solar panels, on-grid & hybrid inverters, batteries, HDGI mounting structures, ACDB/DCDB protection, and solar cables supplied in Charvi Solar EPC systems."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Products & Brands', path: '/products' },
        ]}
      />

      <section className="bg-[#0B1D39] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-[#F97316]">Component Ecosystem</p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight mt-2">
            Solar Products &amp; Brands
          </h1>
          <p className="text-slate-300 mt-4 max-w-2xl text-base leading-relaxed">
            Every Charvi Solar plant is built around reliable modules, inverters, HDGI mounting hardware, and DC/AC surge protection tailored to site requirements.
          </p>
        </div>
      </section>

      {/* Brand Strip (No unverified dealership claims) */}
      <section className="py-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500 mb-3">
            Brands integrated or available for system configuration subject to project specification &amp; availability:
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            {FEATURED_BRANDS.map((brand) => (
              <span
                key={brand}
                className="font-display text-base font-bold text-[#0B1D39]/80"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {PRODUCT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0B1D39] text-white border-[#0B1D39]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="border border-slate-200 rounded-xl overflow-hidden bg-white flex flex-col"
              >
                <div className="h-48 overflow-hidden">
                  <SafeImage src={item.imageUrl} alt={`${item.name} — ${item.brand}`} />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <p className="text-xs text-slate-500">
                      {item.category} · {item.brand} · {item.availability}
                    </p>
                    <h2 className="font-display text-lg font-bold text-[#0B1D39] mt-1">
                      {item.name}
                    </h2>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                    {item.specifications && (
                      <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
                        {item.specifications}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                    <Link
                      to={`/get-quote?message=${encodeURIComponent(`Interested in ${item.name} (${item.brand})`)}`}
                      className="text-xs font-semibold text-[#F97316] inline-flex items-center gap-1"
                    >
                      <span>Request Pricing</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>

                    {item.datasheetUrl && (
                      <a
                        href={item.datasheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-[#0B1D39] inline-flex items-center gap-1 hover:text-[#F97316]"
                      >
                        <FileDown className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Datasheet PDF</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="p-8 border border-slate-200 rounded-xl bg-slate-50 text-center">
              <p className="text-sm text-slate-600">
                No products listed under {selectedCategory} right now. Contact our engineering team for custom electrical accessory sourcing.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
