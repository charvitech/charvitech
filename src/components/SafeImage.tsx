import { useEffect, useState } from 'react';
import { Sun } from 'lucide-react';
import { LEGACY_MEDIA_MAP } from '../data/defaults';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export function SafeImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  loading = 'lazy',
}: SafeImageProps) {
  const resolvedSrc = src ? LEGACY_MEDIA_MAP[src] || src : undefined;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [resolvedSrc]);

  if (!resolvedSrc || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#0B1D39] via-[#132B52] to-[#1E3A6D] text-white/90 p-6 text-center ${className}`}
      >
        <Sun className="w-8 h-8 text-[#F97316] mb-2" aria-hidden="true" />
        <span className="text-xs font-medium tracking-wide text-white/80 max-w-[220px] line-clamp-2">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
