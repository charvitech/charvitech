import { useState, useCallback } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps';
import { MapPin, ExternalLink, Phone } from 'lucide-react';
import { BranchRecord } from '../types/solar';
import { useSiteData } from '../context/SiteDataContext';

function BranchMarker({ branch }: { branch: BranchRecord }) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [open, setOpen] = useState(false);

  const handleToggle = useCallback(() => setOpen((prev) => !prev), []);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: branch.lat, lng: branch.lng }}
        onClick={handleToggle}
        title={branch.name}
      >
        <Pin background="#F97316" borderColor="#0B1D39" glyphColor="#FFFFFF" />
      </AdvancedMarker>
      {open && marker && (
        <InfoWindow anchor={marker} maxWidth={240} onCloseClick={() => setOpen(false)}>
          <div className="p-1 text-slate-900">
            <p className="font-semibold text-sm">{branch.name}</p>
            <p className="text-xs text-slate-600 mt-1">{branch.address}</p>
            <p className="text-xs font-medium mt-1 tabular-nums">Phone: {branch.phone}</p>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export function BranchMap({ branch }: { branch: BranchRecord }) {
  const { googleMapsApiKey } = useSiteData();

  if (!googleMapsApiKey) {
    return (
      <div className="h-[320px] w-full rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <MapPin className="w-8 h-8 text-[#F97316] mb-3" aria-hidden="true" />
        <p className="font-display font-semibold text-[#0B1D39] text-base">{branch.name}</p>
        <p className="text-sm text-slate-600 mt-1 max-w-sm">{branch.address}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <a
            href={branch.mapDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#0B1D39] text-white rounded-lg hover:bg-[#132B52] transition-colors"
          >
            <span>Get Directions</span>
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
          <a
            href={`tel:+91${branch.phone}`}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold border border-slate-300 text-[#0B1D39] rounded-lg hover:bg-white transition-colors tabular-nums"
          >
            <Phone className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{branch.phone}</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="h-[320px] w-full rounded-xl overflow-hidden border border-slate-200">
        <APIProvider apiKey={googleMapsApiKey} libraries={['marker']} language="en" region="IN">
          <GoogleMap
            mapId="DEMO_MAP_ID"
            defaultCenter={{ lat: branch.lat, lng: branch.lng }}
            defaultZoom={13}
            gestureHandling="cooperative"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
          >
            <BranchMarker branch={branch} />
          </GoogleMap>
        </APIProvider>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <span>{branch.city}, Uttar Pradesh</span>
        <a
          href={branch.mapDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-semibold text-[#0B1D39] hover:text-[#F97316] transition-colors"
        >
          <span>Get Directions on Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
