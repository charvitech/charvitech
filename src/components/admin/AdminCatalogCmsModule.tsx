import React, { useState } from 'react';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Plus, Edit3, Trash2, Save, ExternalLink } from 'lucide-react';
import { db, OperationType, handleFirestoreError } from '../../lib/firebase';
import {
  AdminLogRecord,
  AdminUserRecord,
  BranchRecord,
  FaqRecord,
  ProductCategory,
  ProductRecord,
  SeoSettings,
  SiteSettings,
  SubsidySettings,
} from '../../types/solar';
import { AdminConfirmModal } from './AdminConfirmModal';

const PRODUCT_CATS: ProductCategory[] = [
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

export function AdminProductsModule({
  products,
  onRefresh,
  onLog,
}: {
  products: ProductRecord[];
  onRefresh: () => Promise<void>;
  onLog: (a: string, t: string, id: string, d: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Solar Panels');
  const [description, setDescription] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [datasheetUrl, setDatasheetUrl] = useState('');
  const [availability, setAvailability] = useState<'Available' | 'On Order' | 'Out of Stock'>('Available');
  const [published, setPublished] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ProductRecord | null>(null);

  const edit = (p: ProductRecord) => {
    setEditingId(p.id);
    setName(p.name);
    setBrand(p.brand);
    setCategory(p.category);
    setDescription(p.description || '');
    setSpecifications(p.specifications || '');
    setImageUrl(p.imageUrl || '');
    setDatasheetUrl(p.datasheetUrl || '');
    setAvailability(p.availability);
    setPublished(p.published);
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingId || `prod_${Date.now()}`;
    try {
      await setDoc(doc(db, 'products', id), {
        id,
        name: name.trim(),
        brand: brand.trim(),
        category,
        description: description.trim(),
        specifications: specifications.trim(),
        imageUrl: imageUrl.trim(),
        datasheetUrl: datasheetUrl.trim(),
        availability,
        published,
        updatedAt: serverTimestamp(),
      });
      await onLog(editingId ? 'UPDATE_PRODUCT' : 'CREATE_PRODUCT', 'products', id, name);
      setOpen(false);
      await onRefresh();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${id}`);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    await deleteDoc(doc(db, 'products', deleteTarget.id));
    await onLog('DELETE_PRODUCT', 'products', deleteTarget.id, deleteTarget.name);
    setDeleteTarget(null);
    await onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-[#0B1D39]">Solar Products &amp; Brands</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage panels, inverters, structures, ACDB/DCDB, and PDF datasheets.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setName('');
            setBrand('');
            setDescription('');
            setSpecifications('');
            setImageUrl('');
            setDatasheetUrl('');
            setOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#F97316] text-white rounded-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {open && (
        <form onSubmit={save} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1">Product Name *</label>
              <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Brand *</label>
              <input required type="text" value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as ProductCategory)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg">
                {PRODUCT_CATS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Availability</label>
              <select value={availability} onChange={(e) => setAvailability(e.target.value as 'Available' | 'On Order' | 'Out of Stock')} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg">
                <option value="Available">Available</option>
                <option value="On Order">On Order</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
                <span>Published</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Image URL</label>
              <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Datasheet PDF URL</label>
              <input type="text" value={datasheetUrl} onChange={(e) => setDatasheetUrl(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Description</label>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Technical Specifications</label>
            <textarea rows={2} value={specifications} onChange={(e) => setSpecifications(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-xs font-semibold border border-slate-300 rounded-lg cursor-pointer">Cancel</button>
            <button type="submit" className="px-4 py-2 text-xs font-semibold bg-[#0B1D39] text-white rounded-lg cursor-pointer">Save Product</button>
          </div>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Brand</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="py-3 px-4 font-semibold text-[#0B1D39]">{p.name}</td>
                <td className="py-3 px-4 text-slate-600">{p.brand}</td>
                <td className="py-3 px-4 text-xs text-slate-600">{p.category}</td>
                <td className="py-3 px-4 text-xs">{p.availability}</td>
                <td className="py-3 px-4 text-right space-x-2">
                  <button type="button" onClick={() => edit(p)} className="p-1.5 text-[#0B1D39] hover:bg-slate-100 rounded cursor-pointer"><Edit3 className="w-4 h-4" /></button>
                  <button type="button" onClick={() => setDeleteTarget(p)} className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminConfirmModal
        open={!!deleteTarget}
        title="Delete Product"
        message={`Delete "${deleteTarget?.name}" from catalog?`}
        onConfirm={remove}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export function AdminContentFaqsModule({
  siteSettings,
  faqs,
  onRefresh,
  onLog,
}: {
  siteSettings: SiteSettings;
  faqs: FaqRecord[];
  onRefresh: () => Promise<void>;
  onLog: (a: string, t: string, id: string, d: string) => Promise<void>;
}) {
  const [form, setForm] = useState<SiteSettings>(siteSettings);
  const [savedNotice, setSavedNotice] = useState(false);

  const [faqQ, setFaqQ] = useState('');
  const [faqA, setFaqA] = useState('');
  const [faqCat, setFaqCat] = useState('General');
  const [faqEditId, setFaqEditId] = useState<string | null>(null);
  const [deleteFaq, setDeleteFaq] = useState<FaqRecord | null>(null);

  const saveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    await setDoc(doc(db, 'settings', 'site'), { ...form, updatedAt: serverTimestamp() });
    await onLog('UPDATE_CONTENT', 'settings', 'site', 'Updated website content & About Us');
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
    await onRefresh();
  };

  const saveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = faqEditId || `faq_${Date.now()}`;
    await setDoc(doc(db, 'faqs', id), {
      id,
      question: faqQ.trim(),
      answer: faqA.trim(),
      category: faqCat,
      sortOrder: faqs.length + 1,
      published: true,
      updatedAt: serverTimestamp(),
    });
    await onLog(faqEditId ? 'UPDATE_FAQ' : 'CREATE_FAQ', 'faqs', id, faqQ.slice(0, 60));
    setFaqEditId(null);
    setFaqQ('');
    setFaqA('');
    await onRefresh();
  };

  return (
    <div className="space-y-8">
      <form onSubmit={saveContent} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="font-display text-xl font-bold text-[#0B1D39]">Website Content Management</h2>
            <p className="text-xs text-slate-500">Edit Hero copy, About Us, Vision, Mission, Leadership bio, and announcements.</p>
          </div>
          <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#0B1D39] text-white rounded-lg cursor-pointer">
            <Save className="w-3.5 h-3.5" />
            <span>{savedNotice ? 'Saved!' : 'Save Content'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Hero Heading</label>
            <input type="text" value={form.heroTitle} onChange={(e) => setForm({ ...form, heroTitle: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Hero Image URL</label>
            <input type="text" value={form.heroImage} onChange={(e) => setForm({ ...form, heroImage: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold mb-1">Hero Supporting Text</label>
            <textarea rows={2} value={form.heroSubtitle} onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold mb-1">About Company Overview</label>
            <textarea rows={3} value={form.aboutOverview} onChange={(e) => setForm({ ...form, aboutOverview: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Vision</label>
            <textarea rows={2} value={form.vision} onChange={(e) => setForm({ ...form, vision: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Mission</label>
            <textarea rows={2} value={form.mission} onChange={(e) => setForm({ ...form, mission: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold mb-1">Leadership Bio (Chandra Prakash)</label>
            <textarea rows={2} value={form.founderBio} onChange={(e) => setForm({ ...form, founderBio: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
          </div>
        </div>
      </form>

      {/* FAQs */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <h3 className="font-display text-lg font-bold text-[#0B1D39]">Manage FAQs</h3>
        <form onSubmit={saveFaq} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="md:col-span-3">
            <input required type="text" value={faqQ} onChange={(e) => setFaqQ(e.target.value)} placeholder="FAQ Question" className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg" />
          </div>
          <div>
            <select value={faqCat} onChange={(e) => setFaqCat(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg">
              {['General', 'Residential', 'Commercial', 'Industrial', 'On-Grid', 'Off-Grid', 'Hybrid', 'Subsidy'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3">
            <textarea required rows={2} value={faqA} onChange={(e) => setFaqA(e.target.value)} placeholder="Clear technical answer..." className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full py-2 px-4 text-xs font-semibold bg-[#F97316] text-white rounded-lg cursor-pointer">
              {faqEditId ? 'Update FAQ' : 'Add FAQ'}
            </button>
          </div>
        </form>

        <div className="divide-y divide-slate-100">
          {faqs.map((f) => (
            <div key={f.id} className="py-3 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-[#F97316] font-semibold">{f.category}</p>
                <p className="text-sm font-bold text-[#0B1D39]">{f.question}</p>
                <p className="text-xs text-slate-600 mt-1">{f.answer}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setFaqEditId(f.id);
                    setFaqQ(f.question);
                    setFaqA(f.answer);
                    setFaqCat(f.category);
                  }}
                  className="p-1.5 text-[#0B1D39] hover:bg-slate-100 rounded cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteFaq(f)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AdminConfirmModal
        open={!!deleteFaq}
        title="Delete FAQ"
        message={`Delete question "${deleteFaq?.question}"?`}
        onConfirm={async () => {
          if (deleteFaq) {
            await deleteDoc(doc(db, 'faqs', deleteFaq.id));
            await onLog('DELETE_FAQ', 'faqs', deleteFaq.id, deleteFaq.question);
            setDeleteFaq(null);
            await onRefresh();
          }
        }}
        onCancel={() => setDeleteFaq(null)}
      />
    </div>
  );
}

export function AdminSubsidySettingsModule({
  subsidySettings,
  onRefresh,
  onLog,
}: {
  subsidySettings: SubsidySettings;
  onRefresh: () => Promise<void>;
  onLog: (a: string, t: string, id: string, d: string) => Promise<void>;
}) {
  const [form, setForm] = useState<SubsidySettings>(subsidySettings);
  const [saved, setSaved] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await setDoc(doc(db, 'settings', 'subsidy'), { ...form, updatedAt: serverTimestamp() });
    await onLog('UPDATE_SUBSIDY', 'settings', 'subsidy', 'Updated subsidy amounts & calculator assumptions');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    await onRefresh();
  };

  return (
    <form onSubmit={save} className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="font-display text-xl font-bold text-[#0B1D39]">Subsidy &amp; Solar Calculator Settings</h2>
          <p className="text-xs text-slate-500">All calculator tariffs, indicative cost bands, and central/state subsidy caps update live.</p>
        </div>
        <button type="submit" className="px-4 py-2 text-xs font-semibold bg-[#0B1D39] text-white rounded-lg cursor-pointer">
          {saved ? 'Saved!' : 'Save Rules'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1">Central 1 kW (₹)</label>
          <input type="number" value={form.central1Kw} onChange={(e) => setForm({ ...form, central1Kw: Number(e.target.value) })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Central 2 kW (₹)</label>
          <input type="number" value={form.central2Kw} onChange={(e) => setForm({ ...form, central2Kw: Number(e.target.value) })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Central 3 kW+ Max (₹)</label>
          <input type="number" value={form.central3KwPlus} onChange={(e) => setForm({ ...form, central3KwPlus: Number(e.target.value) })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">UP State Per kW (₹)</label>
          <input type="number" value={form.statePerKw} onChange={(e) => setForm({ ...form, statePerKw: Number(e.target.value) })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">UP State Max Cap (₹)</label>
          <input type="number" value={form.stateMax} onChange={(e) => setForm({ ...form, stateMax: Number(e.target.value) })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Avg. Tariff (₹/kWh)</label>
          <input type="number" step="0.1" value={form.tariffPerUnitInr} onChange={(e) => setForm({ ...form, tariffPerUnitInr: Number(e.target.value) })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">On-Grid Cost Min/kW (₹)</label>
          <input type="number" value={form.costPerKwOnGridMin} onChange={(e) => setForm({ ...form, costPerKwOnGridMin: Number(e.target.value) })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">On-Grid Cost Max/kW (₹)</label>
          <input type="number" value={form.costPerKwOnGridMax} onChange={(e) => setForm({ ...form, costPerKwOnGridMax: Number(e.target.value) })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Monthly Yield / kW (kWh)</label>
          <input type="number" value={form.unitsPerKwMonthly} onChange={(e) => setForm({ ...form, unitsPerKwMonthly: Number(e.target.value) })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1">Scheme Timeline / Deadline Note</label>
        <input type="text" value={form.deadlineNote} onChange={(e) => setForm({ ...form, deadlineNote: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1">Mandatory Subsidy Disclaimer</label>
        <textarea rows={3} value={form.disclaimer} onChange={(e) => setForm({ ...form, disclaimer: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
      </div>
    </form>
  );
}

export function AdminBranchesModule({
  branches,
  onRefresh,
  onLog,
}: {
  branches: BranchRecord[];
  onRefresh: () => Promise<void>;
  onLog: (a: string, t: string, id: string, d: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState<BranchRecord | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    await setDoc(doc(db, 'branches', editing.id), { ...editing, updatedAt: serverTimestamp() });
    await onLog('UPDATE_BRANCH', 'branches', editing.id, editing.city);
    setEditing(null);
    await onRefresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-[#0B1D39]">Branch Management</h2>
        <p className="text-xs text-slate-500 mt-0.5">Update verified Meerut and Aligarh office addresses, phones, Google Maps coordinates, and timings.</p>
      </div>

      {editing && (
        <form onSubmit={save} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h3 className="font-display font-bold text-[#0B1D39]">Edit {editing.city} Branch</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Branch Name</label>
              <input required type="text" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Phone Number</label>
              <input required type="text" value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1">Complete Office Address</label>
              <input required type="text" value={editing.address} onChange={(e) => setEditing({ ...editing, address: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Office Timings</label>
              <input type="text" value={editing.timings} onChange={(e) => setEditing({ ...editing, timings: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Google Maps Directions URL</label>
              <input type="text" value={editing.mapDirectionsUrl} onChange={(e) => setEditing({ ...editing, mapDirectionsUrl: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Latitude</label>
              <input type="number" step="0.0001" value={editing.lat} onChange={(e) => setEditing({ ...editing, lat: Number(e.target.value) })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Longitude</label>
              <input type="number" step="0.0001" value={editing.lng} onChange={(e) => setEditing({ ...editing, lng: Number(e.target.value) })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums" />
            </div>
          </div>
          <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
            <input type="checkbox" checked={editing.isAddressVerified} onChange={(e) => setEditing({ ...editing, isAddressVerified: e.target.checked })} />
            <span>Mark Office Address as Verified</span>
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-xs font-semibold border border-slate-300 rounded-lg cursor-pointer">Cancel</button>
            <button type="submit" className="px-4 py-2 text-xs font-semibold bg-[#0B1D39] text-white rounded-lg cursor-pointer">Save Branch</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {branches.map((b) => (
          <div key={b.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-[#0B1D39]">{b.city} Branch</h3>
              <button type="button" onClick={() => setEditing(b)} className="px-3 py-1 text-xs font-semibold border border-slate-300 rounded-lg cursor-pointer">Edit</button>
            </div>
            <p className="text-xs font-mono-tabular text-slate-600">Phone: {b.phone}</p>
            <p className="text-sm text-slate-700">{b.address}</p>
            <p className={`text-xs font-semibold ${b.isAddressVerified ? 'text-[#15803D]' : 'text-amber-700'}`}>
              {b.isAddressVerified ? 'Verified Address' : 'Pending Verified Address'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminSettingsSeoSecurityModule({
  mode,
  siteSettings,
  seoSettings,
  adminLogs,
  onRefresh,
  onLog,
}: {
  mode: 'seo' | 'settings' | 'security';
  siteSettings: SiteSettings;
  seoSettings: SeoSettings;
  adminUsers: AdminUserRecord[];
  adminLogs: AdminLogRecord[];
  onRefresh: () => Promise<void>;
  onLog: (a: string, t: string, id: string, d: string) => Promise<void>;
}) {
  const [seo, setSeo] = useState<SeoSettings>(seoSettings);
  const [site, setSite] = useState<SiteSettings>(siteSettings);
  const [savedMsg, setSavedMsg] = useState('');

  if (mode === 'seo') {
    return (
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await setDoc(doc(db, 'settings', 'seo'), { ...seo, updatedAt: serverTimestamp() });
          await onLog('UPDATE_SEO', 'settings', 'seo', 'Updated SEO & verification tags');
          setSavedMsg('SEO settings saved');
          setTimeout(() => setSavedMsg(''), 2500);
          await onRefresh();
        }}
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-5"
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="font-display text-xl font-bold text-[#0B1D39]">SEO &amp; Analytics Integration</h2>
            <p className="text-xs text-slate-500">Configure Google Search Console, GA4, OpenGraph defaults, and inspect XML Sitemap.</p>
          </div>
          <button type="submit" className="px-4 py-2 text-xs font-semibold bg-[#0B1D39] text-white rounded-lg cursor-pointer">
            {savedMsg || 'Save SEO'}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Google Analytics 4 Measurement ID</label>
            <input type="text" value={seo.ga4MeasurementId} onChange={(e) => setSeo({ ...seo, ga4MeasurementId: e.target.value })} placeholder="G-XXXXXXXXXX" className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono-tabular" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Google Search Console Verification Code</label>
            <input type="text" value={seo.gscVerificationCode} onChange={(e) => setSeo({ ...seo, gscVerificationCode: e.target.value })} placeholder="Verification meta content string" className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono-tabular" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">Default Open Graph Image URL</label>
            <input type="text" value={seo.defaultOgImage} onChange={(e) => setSeo({ ...seo, defaultOgImage: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
          </div>
        </div>
        <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold">
          <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#F97316] underline">
            <span>View Live /sitemap.xml</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#0B1D39] underline">
            <span>View Live /robots.txt</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </form>
    );
  }

  if (mode === 'settings') {
    return (
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await setDoc(doc(db, 'settings', 'site'), { ...site, updatedAt: serverTimestamp() });
          await onLog('UPDATE_SETTINGS', 'settings', 'site', 'Updated global website settings');
          setSavedMsg('Website settings saved');
          setTimeout(() => setSavedMsg(''), 2500);
          await onRefresh();
        }}
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-5"
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="font-display text-xl font-bold text-[#0B1D39]">Website Settings</h2>
            <p className="text-xs text-slate-500">Global company identity, email, WhatsApp, and social links.</p>
          </div>
          <button type="submit" className="px-4 py-2 text-xs font-semibold bg-[#0B1D39] text-white rounded-lg cursor-pointer">
            {savedMsg || 'Save Settings'}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Company Name</label>
            <input type="text" value={site.companyName} onChange={(e) => setSite({ ...site, companyName: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Brand Name</label>
            <input type="text" value={site.brandName} onChange={(e) => setSite({ ...site, brandName: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Primary Email</label>
            <input type="email" value={site.primaryEmail} onChange={(e) => setSite({ ...site, primaryEmail: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">WhatsApp Number (with 91)</label>
            <input type="text" value={site.whatsappNumber} onChange={(e) => setSite({ ...site, whatsappNumber: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Google Business Profile URL</label>
            <input type="url" value={site.googleBusinessUrl} onChange={(e) => setSite({ ...site, googleBusinessUrl: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">LinkedIn URL</label>
            <input type="url" value={site.linkedinUrl} onChange={(e) => setSite({ ...site, linkedinUrl: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
        <h2 className="font-display text-xl font-bold text-[#0B1D39]">Single-Owner Admin Security Policy</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Administrator access is strictly locked to a single authorized Email ID:{' '}
          <span className="font-mono-tabular font-semibold text-[#0B1D39]">charvisolarenergy@gmail.com</span>.
          Any other email address is blocked at Step 1 before password entry, and both Express session verification and Firestore security rules enforce this single-account policy.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
        <h3 className="font-display text-lg font-bold text-[#0B1D39]">Recent Admin Audit Logs</h3>
        <div className="divide-y divide-slate-100 text-xs max-h-80 overflow-y-auto">
          {adminLogs.map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
              <div>
                <span className="font-mono-tabular font-semibold text-[#0B1D39]">{log.action}</span>
                <span className="text-slate-600 ml-2">{log.details}</span>
              </div>
              <span className="text-slate-400 shrink-0">{log.actorEmail}</span>
            </div>
          ))}
          {adminLogs.length === 0 && (
            <p className="py-6 text-center text-slate-500">No admin activity recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
