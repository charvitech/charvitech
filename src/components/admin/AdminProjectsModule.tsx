import React, { useState } from 'react';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Plus, Edit3, Trash2, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { db, OperationType, handleFirestoreError } from '../../lib/firebase';
import { uploadSiteImage } from '../../lib/mediaUpload';
import { useSiteData } from '../../context/SiteDataContext';
import { ProjectRecord, PropertyCategory, SolarSystemType } from '../../types/solar';
import { AdminConfirmModal } from './AdminConfirmModal';

interface AdminProjectsModuleProps {
  projects: ProjectRecord[];
  onRefresh: () => Promise<void>;
  onLog: (action: string, targetType: string, targetId: string, details: string) => Promise<void>;
}

const EMPTY_PROJECT: Omit<ProjectRecord, 'id' | 'createdAt' | 'updatedAt'> = {
  slug: '',
  title: '',
  clientName: '',
  location: '',
  city: 'Meerut',
  category: 'Residential',
  solarType: 'On-Grid',
  capacityKw: 3,
  installationDate: new Date().toISOString().slice(0, 10),
  panelBrand: '',
  inverterBrand: '',
  structureDetails: '',
  description: '',
  images: [],
  beforeImage: '',
  afterImage: '',
  videoUrl: '',
  customerTestimonial: '',
  customerApproved: false,
  published: true,
  featured: true,
  sourceTrackerId: '',
};

export function AdminProjectsModule({ projects, onRefresh, onLog }: AdminProjectsModuleProps) {
  const { getAdminAuthToken } = useSiteData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_PROJECT);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectRecord | null>(null);

  const openNew = () => {
    setErrorMsg(null);
    setEditingId(null);
    setForm({
      ...EMPTY_PROJECT,
      installationDate: new Date().toISOString().slice(0, 10),
    });
    setFormOpen(true);
  };

  const openEdit = (p: ProjectRecord) => {
    setErrorMsg(null);
    setEditingId(p.id);
    setForm({
      slug: p.slug,
      title: p.title,
      clientName: p.clientName || '',
      location: p.location,
      city: p.city || '',
      category: p.category,
      solarType: p.solarType,
      capacityKw: p.capacityKw,
      installationDate: p.installationDate || '',
      panelBrand: p.panelBrand || '',
      inverterBrand: p.inverterBrand || '',
      structureDetails: p.structureDetails || '',
      description: p.description || '',
      images: p.images || [],
      beforeImage: p.beforeImage || '',
      afterImage: p.afterImage || '',
      videoUrl: p.videoUrl || '',
      customerTestimonial: p.customerTestimonial || '',
      customerApproved: !!p.customerApproved,
      published: !!p.published,
      featured: !!p.featured,
      sourceTrackerId: p.sourceTrackerId || '',
    });
    setFormOpen(true);
  };

  const handlePhotoUpload = async (
    files: FileList | null,
    onDone: (urls: string[]) => void
  ) => {
    if (!files || files.length === 0) return;
    setErrorMsg(null);
    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files).slice(0, 10)) {
        const url = await uploadSiteImage(file, getAdminAuthToken);
        uploadedUrls.push(url);
      }
      onDone(uploadedUrls);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to upload photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!form.title.trim() || !form.location.trim()) {
      setErrorMsg('Project Title aur Location required hai.');
      return;
    }

    setSaving(true);
    const id = editingId || `proj_${Date.now()}`;
    const cleanSlug =
      (form.slug || form.title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || id;

    const cleanImages = form.images.filter(Boolean).slice(0, 10);
    const primaryAfter =
      form.afterImage.trim() ||
      (cleanImages[0] && cleanImages[0].length <= 500 ? cleanImages[0] : '');

    try {
      const existingProj = projects.find((p) => p.id === editingId);
      await setDoc(doc(db, 'projects', id), {
        slug: cleanSlug.slice(0, 140),
        title: form.title.trim().slice(0, 180),
        clientName: (form.clientName || '').trim().slice(0, 140),
        location: form.location.trim().slice(0, 140),
        city: (form.city || form.location).trim().slice(0, 80),
        category: form.category,
        solarType: form.solarType,
        capacityKw: Math.max(0.5, Number(form.capacityKw) || 1),
        installationDate: form.installationDate.trim().slice(0, 40),
        panelBrand: form.panelBrand.trim().slice(0, 100),
        inverterBrand: form.inverterBrand.trim().slice(0, 100),
        structureDetails: form.structureDetails.trim().slice(0, 240),
        description: form.description.trim().slice(0, 3000),
        images: cleanImages,
        beforeImage: form.beforeImage.trim().slice(0, 500),
        afterImage: primaryAfter.slice(0, 500),
        videoUrl: form.videoUrl.trim().slice(0, 500),
        customerTestimonial: form.customerTestimonial.trim().slice(0, 1000),
        customerApproved: !!form.customerApproved,
        published: !!form.published,
        featured: !!form.featured,
        ...(form.sourceTrackerId ? { sourceTrackerId: form.sourceTrackerId.slice(0, 128) } : {}),
        id,
        createdAt: existingProj?.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await onLog(editingId ? 'UPDATE_PROJECT' : 'CREATE_PROJECT', 'projects', id, form.title);
      await onRefresh();
      setFormOpen(false);
      setToastMsg(
        form.published
          ? `"${form.title.trim()}" automatically website ke "Our Projects" me add ho gaya!`
          : `"${form.title.trim()}" draft ke roop me save ho gaya.`
      );
      setTimeout(() => setToastMsg(null), 4000);
    } catch (error) {
      try {
        handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, `projects/${id}`);
      } catch (wrapped) {
        setErrorMsg(wrapped instanceof Error ? wrapped.message : 'Unable to save project.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDoc(doc(db, 'projects', deleteTarget.id));
      await onLog('DELETE_PROJECT', 'projects', deleteTarget.id, deleteTarget.title);
      setDeleteTarget(null);
      await onRefresh();
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.DELETE, `projects/${deleteTarget.id}`);
      } catch (wrapped) {
        setErrorMsg(wrapped instanceof Error ? wrapped.message : 'Unable to delete project.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-[#0B1D39]">Project Portfolio</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Nayi site lagne ke baad yahan photo, client naam ("kiski site hai") aur details daalein — save karte hi website ke Our Projects aur Homepage par live ho jayega.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Add Completed Site</span>
        </button>
      </div>

      {toastMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" aria-hidden="true" />
          <span>{toastMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      {formOpen && (
        <form
          onSubmit={handleSave}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-display font-bold text-[#0B1D39]">
              {editingId ? 'Edit Project' : 'Add New Completed Solar Site'}
            </h3>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="text-xs text-slate-500 hover:text-[#0B1D39] cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1">Project Title *</label>
              <input
                required
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., 5 kW Elevated Residential On-Grid Plant — Shastri Nagar"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Kiski Site Hai (Client / Site Owner)</label>
              <input
                type="text"
                value={form.clientName || ''}
                onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                placeholder="e.g., Shri Rajesh Sharma Ji / Metro Cold Store"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Capacity (kW) *</label>
              <input
                required
                type="number"
                step="0.5"
                min="0.5"
                value={form.capacityKw}
                onChange={(e) => setForm({ ...form, capacityKw: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Location / Area &amp; City *</label>
              <input
                required
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Shastri Nagar, Meerut"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as PropertyCategory })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Solar Type</label>
              <select
                value={form.solarType}
                onChange={(e) => setForm({ ...form, solarType: e.target.value as SolarSystemType })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              >
                <option value="On-Grid">On-Grid</option>
                <option value="Off-Grid">Off-Grid</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Panel Brand</label>
              <input
                type="text"
                value={form.panelBrand}
                onChange={(e) => setForm({ ...form, panelBrand: e.target.value })}
                placeholder="e.g., Waaree 550Wp TOPCon"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Inverter Brand</label>
              <input
                type="text"
                value={form.inverterBrand}
                onChange={(e) => setForm({ ...form, inverterBrand: e.target.value })}
                placeholder="e.g., Growatt 5 kW"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Installation Date</label>
              <input
                type="text"
                value={form.installationDate}
                onChange={(e) => setForm({ ...form, installationDate: e.target.value })}
                placeholder="e.g., Nov 2026"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Structure Details</label>
            <input
              type="text"
              value={form.structureDetails}
              onChange={(e) => setForm({ ...form, structureDetails: e.target.value })}
              placeholder="e.g., 7 ft elevated HDGI structure with SS304 fasteners"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              Site Description &amp; Details (Kiski site hai aur kya work hua)
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Site ke baare me poori jankari likhein: client ka naam, roof type, structure height, ACDB/DCDB safety, aur net metering detail..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          {/* Multi-image upload */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold">
              Site Lagane Ke Baad Ki Photos (up to 10 photos)
            </label>
            <div className="flex flex-wrap gap-2 items-center">
              <label className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg cursor-pointer">
                <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{uploading ? 'Uploading Photo...' : 'Upload After-Installation Photo(s)'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    handlePhotoUpload(e.target.files, (urls) =>
                      setForm((prev) => ({
                        ...prev,
                        images: [...prev.images, ...urls].slice(0, 10),
                        afterImage:
                          prev.afterImage ||
                          (urls[0] && urls[0].length <= 500 ? urls[0] : ''),
                      }))
                    );
                    e.target.value = '';
                  }}
                />
              </label>
              <input
                type="text"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Or paste /uploads/... or image URL"
                className="flex-1 min-w-[200px] px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  if (imageUrlInput.trim()) {
                    const url = imageUrlInput.trim();
                    setForm((prev) => ({
                      ...prev,
                      images: [...prev.images, url].slice(0, 10),
                      afterImage: prev.afterImage || (url.length <= 500 ? url : ''),
                    }));
                    setImageUrlInput('');
                  }
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-[#0B1D39] text-white rounded-lg cursor-pointer"
              >
                Add URL
              </button>
            </div>
            {form.images.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {form.images.map((url, idx) => (
                  <div key={idx} className="relative w-24 h-20 rounded-lg overflow-hidden border border-slate-200">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          images: prev.images.filter((_, i) => i !== idx),
                        }))
                      }
                      className="absolute top-0.5 right-0.5 bg-black/70 text-white text-[10px] px-1 rounded cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Before Photo URL (Optional)</label>
              <input
                type="text"
                value={form.beforeImage}
                onChange={(e) => setForm({ ...form, beforeImage: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">After Commissioning Photo URL</label>
              <input
                type="text"
                value={form.afterImage}
                onChange={(e) => setForm({ ...form, afterImage: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Video URL (MP4, Optional)</label>
              <input
                type="text"
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Customer Testimonial (Optional)</label>
            <textarea
              rows={2}
              value={form.customerTestimonial}
              onChange={(e) => setForm({ ...form, customerTestimonial: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex flex-wrap gap-6 text-xs font-semibold text-[#0B1D39]">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
              />
              <span>Published on Website (&ldquo;Our Projects&rdquo;)</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              <span>Feature on Homepage</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.customerApproved}
                onChange={(e) => setForm({ ...form, customerApproved: e.target.checked })}
              />
              <span>Customer Consent Approved</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2 text-xs font-semibold border border-slate-300 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-5 py-2 text-xs font-semibold bg-[#0B1D39] text-white rounded-lg cursor-pointer disabled:opacity-60"
            >
              {saving ? 'Saving & Publishing...' : 'Save & Publish Project'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <th className="py-3 px-4">Project &amp; Client</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Spec</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="font-semibold text-[#0B1D39]">{p.title}</div>
                  {p.clientName && (
                    <div className="text-xs text-slate-500 mt-0.5">Site: {p.clientName}</div>
                  )}
                </td>
                <td className="py-3 px-4 text-slate-600">{p.location}</td>
                <td className="py-3 px-4 text-xs font-mono-tabular text-slate-600">
                  {p.capacityKw} kW · {p.category} · {p.solarType}
                </td>
                <td className="py-3 px-4 text-xs font-semibold">
                  {p.published ? (
                    <span className="text-[#15803D]">Published{p.featured ? ' · Featured' : ''}</span>
                  ) : (
                    <span className="text-slate-500">Draft</span>
                  )}
                  {p.sourceTrackerId && (
                    <div className="text-[11px] font-normal text-slate-400 mt-0.5">
                      Synced from Daily Site
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    className="p-1.5 text-[#0B1D39] hover:bg-slate-100 rounded-md cursor-pointer inline-flex"
                    aria-label={`Edit ${p.title}`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(p)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-md cursor-pointer inline-flex"
                    aria-label={`Delete ${p.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {projects.length === 0 && (
          <div className="p-10 text-center text-sm text-slate-500">
            Abhi tak koi site photo website par add nahi hui hai. &ldquo;Add Completed Site&rdquo; par click karein ya &ldquo;Daily Site &amp; Excel&rdquo; me jaakar kisi bhi site ki photo upload karke &ldquo;Publish to Our Projects&rdquo; on karein.
          </div>
        )}
      </div>

      <AdminConfirmModal
        open={!!deleteTarget}
        title="Delete Project"
        message={`Delete project "${deleteTarget?.title}"? It will be removed from the public portfolio immediately.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
