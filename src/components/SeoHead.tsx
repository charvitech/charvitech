import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteData } from '../context/SiteDataContext';

interface SeoHeadProps {
  title: string;
  description: string;
  breadcrumbs?: { name: string; path: string }[];
  faqItems?: { question: string; answer: string }[];
  serviceName?: string;
}

export function SeoHead({
  title,
  description,
  breadcrumbs,
  faqItems,
  serviceName,
}: SeoHeadProps) {
  const { pathname } = useLocation();
  const { siteSettings, branches, seoSettings } = useSiteData();

  useEffect(() => {
    const fullTitle = title.includes('Charvi')
      ? title
      : `${title} | ${siteSettings.brandName}`;
    document.title = fullTitle;

    const setMeta = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    const canonicalUrl = `${window.location.origin}${pathname}`;
    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.rel = 'canonical';
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.href = canonicalUrl;

    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    if (seoSettings.defaultOgImage) {
      setMeta(
        'meta[property="og:image"]',
        'property',
        'og:image',
        `${window.location.origin}${seoSettings.defaultOgImage}`
      );
    }
    if (seoSettings.gscVerificationCode) {
      setMeta(
        'meta[name="google-site-verification"]',
        'name',
        'google-site-verification',
        seoSettings.gscVerificationCode
      );
    }

    const existingJsonLd = document.getElementById('charvi-json-ld');
    if (existingJsonLd) existingJsonLd.remove();

    const graph: Record<string, unknown>[] = [
      {
        '@type': 'Organization',
        name: siteSettings.companyName,
        alternateName: siteSettings.brandName,
        url: window.location.origin,
        email: siteSettings.primaryEmail,
        sameAs: [siteSettings.linkedinUrl, siteSettings.googleBusinessUrl].filter(Boolean),
      },
      ...branches
        .filter((b) => b.isAddressVerified)
        .map((b) => ({
          '@type': 'LocalBusiness',
          name: b.name,
          telephone: `+91-${b.phone}`,
          email: b.email || siteSettings.primaryEmail,
          address: {
            '@type': 'PostalAddress',
            streetAddress: b.address,
            addressLocality: b.city,
            addressRegion: 'UP',
            addressCountry: 'IN',
          },
          url: window.location.origin,
        })),
    ];

    if (serviceName) {
      graph.push({
        '@type': 'Service',
        name: serviceName,
        provider: {
          '@type': 'Organization',
          name: siteSettings.companyName,
        },
        areaServed: ['Meerut', 'Aligarh', 'Uttar Pradesh'],
        description,
      });
    }

    if (breadcrumbs && breadcrumbs.length > 0) {
      graph.push({
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((b, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: b.name,
          item: `${window.location.origin}${b.path}`,
        })),
      });
    }

    if (faqItems && faqItems.length > 0) {
      graph.push({
        '@type': 'FAQPage',
        mainEntity: faqItems.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.answer,
          },
        })),
      });
    }

    const script = document.createElement('script');
    script.id = 'charvi-json-ld';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': graph,
    });
    document.head.appendChild(script);
  }, [title, description, pathname, siteSettings, branches, seoSettings, breadcrumbs, faqItems, serviceName]);

  return null;
}
