import { useState } from 'react';
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Search, Download, Trash2, Plus, X } from 'lucide-react';
import { db, OperationType, handleFirestoreError } from '../../lib/firebase';
import { EnquiryRecord, LeadStatus } from '../../types/solar';
import { AdminConfirmModal } from './AdminConfirmModal';

const STATUSES: LeadStatus[] = [
  'New',
  'Contacted',
  'Follow-up',
  'Quotation Sent',
  'Converted',
  'Closed',
];

interface AdminLeadsModuleProps {
  enquiries: EnquiryRecord[];
  onRefresh: () => Promise<void>;
  onLog: (action: string, targetType: string, targetId: string, details: string) => Promise<void>;
}

export function AdminLeadsModule({ enquiries, onRefresh, onLog }: AdminLeadsModuleProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selected, setSelected] = useState<EnquiryRecord | null>(null);
  const [editStatus, setEditStatus] = useState<LeadStatus>('New');
  const [editNotes, setEditNotes] = useState('');
  const [newFollowUp, setNewFollowUp] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EnquiryRecord | null>(null);

  const openDetail = (lead: EnquiryRecord) => {
    setSelected(lead);
    setEditStatus(lead.status);
    setEditNotes(lead.internalNotes || '');
    setNewFollowUp('');
  };

  const handleSaveLead = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const updatedHistory = [...(selected.followUpHistory || [])];
      if (newFollowUp.trim()) {
        const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
        updatedHistory.unshift(`[${stamp}] ${newFollowUp.trim()}`);
      }
      await updateDoc(doc(db, 'enquiries', selected.id), {
        status: editStatus,
        internalNotes: editNotes.slice(0, 2000),
        followUpHistory: updatedHistory.slice(0, 20),
        updatedAt: serverTimestamp(),
      });
      await onLog('UPDATE_LEAD', 'enquiries', selected.id, `Status=${editStatus}`);
      await onRefresh();
      setSelected(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `enquiries/${selected.id}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDoc(doc(db, 'enquiries', deleteTarget.id));
      await onLog('DELETE_LEAD', 'enquiries', deleteTarget.id, deleteTarget.enquiryCode);
      setDeleteTarget(null);
      if (selected?.id === deleteTarget.id) setSelected(null);
      await onRefresh();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `enquiries/${deleteTarget.id}`);
    }
  };

  const filtered = enquiries.filter((e) => {
    const matchStatus = statusFilter === 'All' || e.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      e.customerName.toLowerCase().includes(q) ||
      e.mobile.includes(q) ||
      e.city.toLowerCase().includes(q) ||
      e.enquiryCode.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const exportCsv = () => {
    const headers = [
      'Enquiry Code',
      'Customer Name',
      'Mobile',
      'Email',
      'City',
      'Property Type',
      'System Type',
      'Monthly Bill',
      'Required Capacity',
      'Branch',
      'Status',
      'Lead Source',
      'Message',
      'Internal Notes',
    ];
    const rows = filtered.map((e) =>
      [
        e.enquiryCode,
        e.customerName,
        e.mobile,
        e.email || '',
        e.city,
        e.propertyType,
        e.systemType,
        e.monthlyBill || '',
        e.requiredCapacity || '',
        e.branchPreference || '',
        e.status,
        e.leadSource || '',
        (e.message || '').replace(/"/g, '""'),
        (e.internalNotes || '').replace(/"/g, '""'),
      ]
        .map((v) => `"${v}"`)
        .join(',')
    );
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `charvi-solar-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-[#0B1D39]">
            Lead &amp; Enquiry CRM
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track quotation requests, assign statuses, log follow-ups, and export CSV reports.
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#0B1D39] text-white rounded-lg hover:bg-[#132B52] cursor-pointer self-start"
        >
          <Download className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Export CSV ({filtered.length})</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, mobile, city, or reference ID..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
        >
          <option value="All">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <th className="py-3 px-4">Ref ID</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">City</th>
              <th className="py-3 px-4">System</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono-tabular text-xs text-slate-600">
                  {lead.enquiryCode}
                </td>
                <td className="py-3 px-4">
                  <p className="font-semibold text-[#0B1D39]">{lead.customerName}</p>
                  <p className="text-xs font-mono-tabular text-slate-500">{lead.mobile}</p>
                </td>
                <td className="py-3 px-4 text-slate-700">{lead.city}</td>
                <td className="py-3 px-4 text-xs text-slate-600">
                  {lead.propertyType} · {lead.systemType}
                  {lead.requiredCapacity ? ` · ${lead.requiredCapacity}` : ''}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`text-xs font-semibold ${
                      lead.status === 'Converted'
                        ? 'text-[#15803D]'
                        : lead.status === 'New'
                        ? 'text-[#F97316]'
                        : 'text-slate-700'
                    }`}
                  >
                    {lead.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => openDetail(lead)}
                    className="px-3 py-1 text-xs font-semibold border border-slate-300 rounded-md hover:bg-slate-100 cursor-pointer"
                  >
                    Manage
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(lead)}
                    aria-label={`Delete enquiry ${lead.enquiryCode}`}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-md cursor-pointer inline-flex align-middle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-10 text-center text-sm text-slate-500">
            No customer enquiries match the current filter.
          </div>
        )}
      </div>

      {/* Lead Detail Drawer/Modal */}
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <p className="font-mono-tabular text-xs text-[#F97316] font-semibold">
                  {selected.enquiryCode}
                </p>
                <h3 className="font-display text-lg font-bold text-[#0B1D39] mt-0.5">
                  {selected.customerName} — {selected.city}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Mobile: {selected.mobile} · {selected.email || 'No email'} · Source: {selected.leadSource}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close lead details"
                className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div><span className="text-slate-500">Property:</span> <strong>{selected.propertyType}</strong></div>
              <div><span className="text-slate-500">System:</span> <strong>{selected.systemType}</strong></div>
              <div><span className="text-slate-500">Monthly Bill:</span> <strong>{selected.monthlyBill || '—'}</strong></div>
              <div><span className="text-slate-500">Capacity:</span> <strong>{selected.requiredCapacity || '—'}</strong></div>
              <div className="col-span-2"><span className="text-slate-500">Message:</span> {selected.message || '—'}</div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0B1D39] mb-1">Lead Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as LeadStatus)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B1D39] mb-1">Internal Notes</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Site survey observations, load notes, quote summary..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B1D39] mb-1">
                  Add Follow-Up Log Entry
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFollowUp}
                    onChange={(e) => setNewFollowUp(e.target.value)}
                    placeholder="e.g., Called customer, site visit scheduled for Saturday 11 AM"
                    className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                  <Plus className="w-4 h-4 text-slate-400 self-center" aria-hidden="true" />
                </div>
              </div>

              {selected.followUpHistory?.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-slate-500">Follow-up History</p>
                  <ul className="space-y-1 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 max-h-36 overflow-y-auto">
                    {selected.followUpHistory.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="px-4 py-2 text-xs font-semibold border border-slate-300 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveLead}
                className="px-4 py-2 text-xs font-semibold bg-[#F97316] text-white rounded-lg cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save Lead Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminConfirmModal
        open={!!deleteTarget}
        title="Delete Customer Enquiry"
        message={`Permanently delete enquiry ${deleteTarget?.enquiryCode} from ${deleteTarget?.customerName}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
