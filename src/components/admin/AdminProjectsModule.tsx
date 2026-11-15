import React, { useState } from 'react';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Plus, Edit3, Trash2, Upload } from 'lucide-react';
import { db, OperationType, handleFirestoreError } from '../../lib/firebase';
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
  location: '',
  city: 'Meerut',
  category: 'Residential',
  solarType: 'On-Grid',
  capacityKw: 3,
  installationDate: '',
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
  featured: false,
};

export function AdminProjectsModule({ projects, onRefresh, onLog }: AdminProjectsModuleProps) {
  const { getAdminAuthToken } = useSiteData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_PROJECT);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProjectRecord | null>(null);

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_PROJECT);
    setFormOpen(true);
  };

  const openEdit = (p: ProjectRecord) => {
    setEditingId(p.id);
    setForm({
      slug: p.slug,
      title: p.title,
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
    });
    setFormOpen(true);
  };

  const uploadMediaFile = async (
    file: File,
    onDone: (url: string) => void
  ) => {
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
        body: JSON.stringify({ filename: file.name, mimeType: file.type, base64Data }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('File upload requires Node server. On Netlify, paste an external image/video URL directly.');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onDone(data.url);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const id = editingId || `proj_${Date.now()}`;
    const cleanSlug =
      (form.slug || form.title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || id;
    try {
      const existingProj = projects.find((p) => p.id === editingId);
      await setDoc(doc(db, 'projects', id), {
        ...form,
        id,
        slug: cleanSlug,
        capacityKw: Number(form.capacityKw) || 1,
        images: form.images.slice(0, 10),
        createdAt: existingProj?.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await onLog(editingId ? 'UPDATE_PROJECT' : 'CREATE_PROJECT', 'projects', id, form.title);
      await onRefresh();
      setFormOpen(false);
    } catch (error) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, `projects/${id}`);
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
      handleFirestoreError(error, OperationType.DELETE, `projects/${deleteTarget.id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-[#0B1D39]">Project Portfolio</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload real Charvi installation photos, videos, before/after shots, and customer-approved testimonials.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Add Project</span>
        </button>
      </div>

      {formOpen && (
        <form
          onSubmit={handleSave}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-display font-bold text-[#0B1D39]">
              {editingId ? 'Edit Project' : 'New Solar Project'}
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
              <label className="block text-xs font-semibold mb-1">Location *</label>
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
                placeholder="e.g., Waaree 550Wp Mono-PERC"
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
                placeholder="e.g., Oct 2026"
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
            <label className="block text-xs font-semibold mb-1">Project Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          {/* Multi-image upload */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold">Project Photographs (up to 10)</label>
            <div className="flex flex-wrap gap-2 items-center">
              <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer">
                <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{uploading ? 'Uploading...' : 'Upload Photo'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      uploadMediaFile(f, (url) =>
                        setForm((prev) => ({ ...prev, images: [...prev.images, url] }))
                      );
                    }
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
                    setForm((prev) => ({ ...prev, images: [...prev.images, imageUrlInput.trim()] }));
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
                  <div key={idx} className="relative w-20 h-16 rounded-lg overflow-hidden border border-slate-200">
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
              <label className="block text-xs font-semibold mb-1">Before Photo URL</label>
              <input
                type="text"
                value={form.beforeImage}
                onChange={(e) => setForm({ ...form, beforeImage: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">After Photo URL</label>
              <input
                type="text"
                value={form.afterImage}
                onChange={(e) => setForm({ ...form, afterImage: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Video URL (MP4)</label>
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
              <span>Published on Website</span>
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
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold bg-[#0B1D39] text-white rounded-lg cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Project'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <th className="py-3 px-4">Project Title</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Spec</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-semibold text-[#0B1D39]">{p.title}</td>
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
            No installation projects created yet. Click &ldquo;Add Project&rdquo; to publish verified Charvi installations.
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
