import React, { useState } from 'react';
import { doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Upload, Trash2, Copy, Check, Plus, Edit3, Eye, X } from 'lucide-react';
import { db, OperationType, handleFirestoreError } from '../../lib/firebase';
import { useSiteData } from '../../context/SiteDataContext';
import { MediaAsset, ReviewRecord } from '../../types/solar';
import { AdminConfirmModal } from './AdminConfirmModal';

const FOLDERS = ['Projects', 'Branches', 'Products', 'Reviews', 'Brand', 'Documents'];

export function AdminMediaModule({
  media,
  onRefresh,
  onLog,
}: {
  media: MediaAsset[];
  onRefresh: () => Promise<void>;
  onLog: (action: string, targetType: string, targetId: string, details: string) => Promise<void>;
}) {
  const { getAdminAuthToken, adminEmail } = useSiteData();
  const [folder, setFolder] = useState('All');
  const [uploadFolder, setUploadFolder] = useState('Projects');
  const [altText, setAltText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaAsset | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);

  const [urlName, setUrlName] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [urlType, setUrlType] = useState<MediaAsset['mediaType']>('image');
  const [savingUrl, setSavingUrl] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const token = await getAdminAuthToken();
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          base64Data,
        }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(
          'Local file upload requires the Node/Express server. On Netlify static hosting, use "Add Media by URL" below.'
        );
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed.');

      const mediaType: MediaAsset['mediaType'] = file.type.startsWith('video/')
        ? 'video'
        : file.type === 'application/pdf'
        ? 'pdf'
        : 'image';
      const id = `med_${Date.now()}`;

      await setDoc(doc(db, 'media', id), {
        id,
        name: file.name.slice(0, 160),
        folder: uploadFolder,
        mediaType,
        url: data.url,
        altText: altText.trim().slice(0, 240),
        sizeBytes: data.sizeBytes || file.size,
        uploadedBy: adminEmail || 'charvisolarenergy@gmail.com',
        createdAt: serverTimestamp(),
      });
      await onLog('UPLOAD_MEDIA', 'media', id, `${file.name} (${uploadFolder})`);
      setAltText('');
      await onRefresh();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRename = async (id: string) => {
    if (!renameValue.trim()) return;
    try {
      await updateDoc(doc(db, 'media', id), { name: renameValue.trim().slice(0, 160) });
      await onLog('RENAME_MEDIA', 'media', id, renameValue.trim());
      setRenameId(null);
      await onRefresh();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `media/${id}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const token = await getAdminAuthToken();
      await fetch('/api/media/file', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: deleteTarget.url }),
      }).catch(() => {});
      await deleteDoc(doc(db, 'media', deleteTarget.id));
      await onLog('DELETE_MEDIA', 'media', deleteTarget.id, deleteTarget.name);
      setDeleteTarget(null);
      await onRefresh();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `media/${deleteTarget.id}`);
    }
  };

  const filtered = media.filter((m) => folder === 'All' || m.folder === folder);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-[#0B1D39]">Media Library</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Upload validated JPG, PNG, WebP images, MP4 walkthrough videos, and PDF datasheets (max 15 MB).
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold mb-1">Target Folder</label>
            <select
              value={uploadFolder}
              onChange={(e) => setUploadFolder(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            >
              {FOLDERS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">SEO ALT Text</label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Descriptive ALT text for solar photo"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg cursor-pointer">
              <Upload className="w-4 h-4" aria-hidden="true" />
              <span>{uploading ? 'Uploading...' : 'Select File to Upload'}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,application/pdf"
                disabled={uploading}
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
        {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!urlInput.trim()) return;
            setUploadError(null);
            setSavingUrl(true);
            try {
              const id = `med_${Date.now()}`;
              await setDoc(doc(db, 'media', id), {
                id,
                name: (urlName.trim() || 'External Media').slice(0, 160),
                folder: uploadFolder,
                mediaType: urlType,
                url: urlInput.trim().slice(0, 800),
                altText: altText.trim().slice(0, 240),
                sizeBytes: 0,
                uploadedBy: adminEmail || 'charvisolarenergy@gmail.com',
                createdAt: serverTimestamp(),
              });
              await onLog('ADD_MEDIA_URL', 'media', id, urlName.trim() || urlInput.trim());
              setUrlName('');
              setUrlInput('');
              setAltText('');
              await onRefresh();
            } catch (err) {
              setUploadError(err instanceof Error ? err.message : 'Unable to save media URL.');
            } finally {
              setSavingUrl(false);
            }
          }}
          className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
        >
          <div>
            <label className="block text-xs font-semibold mb-1">Or Add Media by URL</label>
            <input
              type="text"
              value={urlName}
              onChange={(e) => setUrlName(e.target.value)}
              placeholder="Asset title (e.g. Meerut 5kW Site)"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">Hosted Image / Video / PDF URL</label>
            <input
              type="url"
              required
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={urlType}
              onChange={(e) => setUrlType(e.target.value as MediaAsset['mediaType'])}
              className="px-2.5 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="pdf">PDF</option>
            </select>
            <button
              type="submit"
              disabled={savingUrl}
              className="flex-1 px-3 py-2 text-xs font-semibold bg-[#0B1D39] text-white rounded-lg cursor-pointer"
            >
              {savingUrl ? 'Saving...' : 'Save URL'}
            </button>
          </div>
        </form>
      </div>

      <div className="flex flex-wrap gap-2">
        {['All', ...FOLDERS].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFolder(f)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer ${
              folder === f
                ? 'bg-[#0B1D39] text-white border-[#0B1D39]'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
            <div className="h-40 bg-slate-100 flex items-center justify-center overflow-hidden">
              {item.mediaType === 'image' ? (
                <img src={item.url} alt={item.altText || item.name} className="w-full h-full object-cover" />
              ) : item.mediaType === 'video' ? (
                <video src={item.url} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-mono-tabular font-semibold text-slate-600">PDF Document</span>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <p className="text-[11px] text-slate-500">
                  {item.folder} · {(item.sizeBytes / 1024).toFixed(0)} KB
                </p>
                {renameId === item.id ? (
                  <div className="flex gap-1.5 mt-1">
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleRename(item.id)}
                      className="px-2 py-1 text-xs bg-[#0B1D39] text-white rounded cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-[#0B1D39] truncate mt-0.5">{item.name}</p>
                )}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(item.url);
                    setCopiedId(item.id);
                    setTimeout(() => setCopiedId(null), 1500);
                  }}
                  className="inline-flex items-center gap-1 text-[#0B1D39] hover:text-[#F97316] cursor-pointer"
                >
                  {copiedId === item.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === item.id ? 'Copied' : 'Copy URL'}</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewItem(item)}
                    aria-label="Preview media"
                    className="text-slate-600 hover:text-[#0B1D39] cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRenameId(item.id);
                      setRenameValue(item.name);
                    }}
                    aria-label="Rename media"
                    className="text-slate-600 hover:text-[#0B1D39] cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    aria-label="Delete media"
                    className="text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-500">
          No media files uploaded in this folder yet.
        </div>
      )}

      {previewItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setPreviewItem(null)}
        >
          <div className="bg-white rounded-xl max-w-2xl w-full p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <p className="font-semibold text-sm text-[#0B1D39]">{previewItem.name}</p>
              <button type="button" onClick={() => setPreviewItem(null)} className="p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            {previewItem.mediaType === 'image' && (
              <img src={previewItem.url} alt={previewItem.altText} className="max-h-[70vh] mx-auto rounded" />
            )}
            {previewItem.mediaType === 'video' && (
              <video src={previewItem.url} controls className="w-full max-h-[70vh] rounded bg-black" />
            )}
            {previewItem.mediaType === 'pdf' && (
              <a
                href={previewItem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block py-6 text-center text-sm font-semibold text-[#F97316] underline"
              >
                Open Uploaded PDF Document
              </a>
            )}
          </div>
        </div>
      )}

      <AdminConfirmModal
        open={!!deleteTarget}
        title="Delete Media File"
        message={`Delete "${deleteTarget?.name}" from media library? Any project or product referencing ${deleteTarget?.url} will fall back to placeholder.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export function AdminReviewsModule({
  reviews,
  onRefresh,
  onLog,
}: {
  reviews: ReviewRecord[];
  onRefresh: () => Promise<void>;
  onLog: (action: string, targetType: string, targetId: string, details: string) => Promise<void>;
}) {
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [city, setCity] = useState('');
  const [systemSize, setSystemSize] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [customerPhotoUrl, setCustomerPhotoUrl] = useState('');
  const [consentObtained, setConsentObtained] = useState(true);
  const [verified, setVerified] = useState(true);
  const [published, setPublished] = useState(true);
  const [reviewDate, setReviewDate] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ReviewRecord | null>(null);

  const reset = () => {
    setEditingId(null);
    setCustomerName('');
    setCity('');
    setSystemSize('');
    setRating(5);
    setReviewText('');
    setGoogleReviewUrl('');
    setScreenshotUrl('');
    setCustomerPhotoUrl('');
    setConsentObtained(true);
    setVerified(true);
    setPublished(true);
    setReviewDate('');
  };

  const handleEdit = (r: ReviewRecord) => {
    setEditingId(r.id);
    setCustomerName(r.customerName);
    setCity(r.city);
    setSystemSize(r.systemSize || '');
    setRating(r.rating || 5);
    setReviewText(r.reviewText);
    setGoogleReviewUrl(r.googleReviewUrl || '');
    setScreenshotUrl(r.screenshotUrl || '');
    setCustomerPhotoUrl(r.customerPhotoUrl || '');
    setConsentObtained(r.consentObtained);
    setVerified(r.verified);
    setPublished(r.published);
    setReviewDate(r.reviewDate || '');
    setOpenForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingId || `rev_${Date.now()}`;
    try {
      await setDoc(doc(db, 'reviews', id), {
        id,
        customerName: customerName.trim(),
        city: city.trim(),
        systemSize: systemSize.trim(),
        rating: Number(rating),
        reviewText: reviewText.trim(),
        googleReviewUrl: googleReviewUrl.trim(),
        screenshotUrl: screenshotUrl.trim(),
        customerPhotoUrl: customerPhotoUrl.trim(),
        consentObtained,
        verified,
        published,
        reviewDate: reviewDate.trim(),
        updatedAt: serverTimestamp(),
      });
      await onLog(editingId ? 'UPDATE_REVIEW' : 'CREATE_REVIEW', 'reviews', id, customerName);
      reset();
      setOpenForm(false);
      await onRefresh();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `reviews/${id}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDoc(doc(db, 'reviews', deleteTarget.id));
      await onLog('DELETE_REVIEW', 'reviews', deleteTarget.id, deleteTarget.customerName);
      setDeleteTarget(null);
      await onRefresh();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `reviews/${deleteTarget.id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-[#0B1D39]">Customer Reviews</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Publish verified customer reviews and screenshots only after obtaining consent.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            reset();
            setOpenForm(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#F97316] text-white rounded-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Review</span>
        </button>
      </div>

      {openForm && (
        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Customer Name *</label>
              <input
                required
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">City *</label>
              <input
                required
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">System Size</label>
              <input
                type="text"
                value={systemSize}
                onChange={(e) => setSystemSize(e.target.value)}
                placeholder="e.g., 5 kW On-Grid"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Review Text *</label>
            <textarea
              required
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Google Review Link</label>
              <input
                type="url"
                value={googleReviewUrl}
                onChange={(e) => setGoogleReviewUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Screenshot URL</label>
              <input
                type="text"
                value={screenshotUrl}
                onChange={(e) => setScreenshotUrl(e.target.value)}
                placeholder="/uploads/..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Customer Photo URL</label>
              <input
                type="text"
                value={customerPhotoUrl}
                onChange={(e) => setCustomerPhotoUrl(e.target.value)}
                placeholder="/uploads/..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Rating (1–5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Review Date</label>
              <input
                type="text"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                placeholder="e.g., Nov 2026"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-xs font-semibold">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={consentObtained} onChange={(e) => setConsentObtained(e.target.checked)} />
              <span>Customer Consent Obtained</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} />
              <span>Verified Customer</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
              <span>Published</span>
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpenForm(false)} className="px-4 py-2 text-xs font-semibold border border-slate-300 rounded-lg cursor-pointer">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-xs font-semibold bg-[#0B1D39] text-white rounded-lg cursor-pointer">
              Save Review
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500">
                {r.city} · {r.systemSize} · {r.published ? 'Published' : 'Hidden'} {r.verified ? '· Verified' : ''}
              </p>
              <p className="font-display font-bold text-[#0B1D39] mt-0.5">{r.customerName}</p>
              <p className="text-sm text-slate-600 mt-1">{r.reviewText}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button type="button" onClick={() => handleEdit(r)} className="p-1.5 text-[#0B1D39] hover:bg-slate-100 rounded cursor-pointer">
                <Edit3 className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => setDeleteTarget(r)} className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-500">
            No reviews added yet.
          </div>
        )}
      </div>

      <AdminConfirmModal
        open={!!deleteTarget}
        title="Delete Customer Review"
        message={`Delete review by ${deleteTarget?.customerName}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
