import React, { useMemo, useRef, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import * as XLSX from 'xlsx';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  FileSpreadsheet,
  Download,
  X,
  AlertCircle,
  CheckCircle2,
  Camera,
  Upload,
  Globe,
} from 'lucide-react';
import { auth, db, OperationType, handleFirestoreError } from '../../lib/firebase';
import { uploadSiteImage } from '../../lib/mediaUpload';
import { useSiteData } from '../../context/SiteDataContext';
import { PropertyCategory, SiteTrackerRecord, SolarSystemType } from '../../types/solar';
import { AdminConfirmModal } from './AdminConfirmModal';

interface AdminSiteTrackerModuleProps {
  trackers: SiteTrackerRecord[];
  onRefresh: () => Promise<void>;
  onLog: (action: string, targetType: string, targetId: string, details: string) => Promise<void>;
}

const CURRENT_STATUS_PRESETS = [
  'UPPCL Correction Pending',
  'UPPCL Name Transfer',
  'UPPCL Name Correction',
  'UPPCL Load Up / Load Enhancement',
  'Registration Pending',
  'Registration Done',
  'Agreement Pending',
  'Agreement Done',
  'Loan Processing',
  'Loan Sanctioned',
  'Material Dispatched',
  'Installation In Progress',
  'Site Installed',
  'DCR Created',
  'Netmetering Applied',
  'Netmetering Done',
  'Subsidy Applied',
  'Subsidy Disbursed',
  'Completed',
];

const STAGE_OPTIONS = ['Pending', 'In Progress', 'Done', 'Applied', 'Correction Needed', 'N/A'];
const LOAN_STATUS_OPTIONS = ['N/A', 'Applied', 'Documents Pending', 'Sanctioned', 'Disbursed', 'Rejected'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function createEmptyTracker(nextSrNo: number): Omit<SiteTrackerRecord, 'id' | 'createdAt' | 'updatedAt'> {
  const now = new Date();
  const monthName = MONTHS[now.getMonth()];
  const year = now.getFullYear();
  const session = now.getMonth() >= 3 ? `${year}-${String((year + 1) % 100).padStart(2, '0')}` : `${year - 1}-${String(year % 100).padStart(2, '0')}`;
  return {
    srNo: nextSrNo,
    regSession: session,
    regMonth: monthName,
    regDate: now.toISOString().slice(0, 10),
    customerName: '',
    mobileNo: '',
    cashLoan: 'Cash',
    loanStatus: 'N/A',
    currentStatus: 'Registration Pending',
    applicationNo: '',
    consumerNo: '',
    registration: 'Pending',
    agreement: 'Pending',
    installedDate: '',
    siteInstalled: 'Pending',
    dcrCreate: 'Pending',
    netmetering: 'Pending',
    subsidyApply: 'Pending',
    subsidyDisbursal: 'Pending',
    plant: 'Rooftop Solar',
    reference: '',
    plantType: 'On-Grid',
    solarPanel: '',
    inverter: '',
    battery: 'N/A',
    plantKw: '',
    categoryPlant: 'Residential',
    pendingPay: '',
    firstPayAmt: '',
    firstPayDate: '',
    secondPayAmt: '',
    secondPayDate: '',
    party: '',
    vendor: '',
    dailyNotes: '',
    siteLocation: '',
    siteTitle: '',
    siteDescription: '',
    sitePhotos: [],
    publishedToProjects: false,
    featuredOnHome: true,
    linkedProjectId: '',
  };
}

// Exact 34 Excel column headers requested by Charvi Technologies and Services
const EXCEL_HEADERS = [
  'SR. NO',
  'REG SESSION',
  'REG MONTH',
  'REG DATE',
  'CUSTOMER NAME',
  'MOBILE NO',
  'CASH_LOAN',
  'LOAN STATUS',
  'CURRENT STATUS',
  'APPLICATION NO',
  'CONSUMER NO',
  'REGISTRATION',
  'AGREEMENT',
  'INSTALLED DATE',
  'SITE INSTALLED',
  'DCR CREATE',
  'NETMETERING',
  'SUBCITY APPLY',
  'SUBCITY DISBURSAL',
  'PLANT',
  'REFERENCE',
  'PLANT TPYE',
  'SOLAR PANEL',
  'INVERTER',
  'BATTERY',
  'PLANT KW',
  'CATERGORY PLANT',
  'PENDING PAY',
  '1ST PAY AMT',
  '1ST PAY DATE',
  '2ND PAY AMT',
  '2ND PAY DATE',
  'PARTY',
  'VENDOR',
] as const;

function toExcelRow(item: SiteTrackerRecord): Record<(typeof EXCEL_HEADERS)[number], string | number> {
  return {
    'SR. NO': item.srNo,
    'REG SESSION': item.regSession || '',
    'REG MONTH': item.regMonth || '',
    'REG DATE': item.regDate || '',
    'CUSTOMER NAME': item.customerName || '',
    'MOBILE NO': item.mobileNo || '',
    CASH_LOAN: item.cashLoan || '',
    'LOAN STATUS': item.loanStatus || '',
    'CURRENT STATUS': item.currentStatus || '',
    'APPLICATION NO': item.applicationNo || '',
    'CONSUMER NO': item.consumerNo || '',
    REGISTRATION: item.registration || '',
    AGREEMENT: item.agreement || '',
    'INSTALLED DATE': item.installedDate || '',
    'SITE INSTALLED': item.siteInstalled || '',
    'DCR CREATE': item.dcrCreate || '',
    NETMETERING: item.netmetering || '',
    'SUBCITY APPLY': item.subsidyApply || '',
    'SUBCITY DISBURSAL': item.subsidyDisbursal || '',
    PLANT: item.plant || '',
    REFERENCE: item.reference || '',
    'PLANT TPYE': item.plantType || '',
    'SOLAR PANEL': item.solarPanel || '',
    INVERTER: item.inverter || '',
    BATTERY: item.battery || '',
    'PLANT KW': item.plantKw || '',
    'CATERGORY PLANT': item.categoryPlant || '',
    'PENDING PAY': item.pendingPay || '',
    '1ST PAY AMT': item.firstPayAmt || '',
    '1ST PAY DATE': item.firstPayDate || '',
    '2ND PAY AMT': item.secondPayAmt || '',
    '2ND PAY DATE': item.secondPayDate || '',
    PARTY: item.party || '',
    VENDOR: item.vendor || '',
  };
}

export function AdminSiteTrackerModule({
  trackers,
  onRefresh,
  onLog,
}: AdminSiteTrackerModuleProps) {
  const { getAdminAuthToken } = useSiteData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [cashLoanFilter, setCashLoanFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('All');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SiteTrackerRecord | null>(null);
  const [form, setForm] = useState(() => createEmptyTracker(1));
  const [sitePhotoUrlInput, setSitePhotoUrlInput] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inlineBusyId, setInlineBusyId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SiteTrackerRecord | null>(null);
  const projectPublishRef = useRef<HTMLDivElement | null>(null);

  const sortedTrackers = useMemo(
    () => [...trackers].sort((a, b) => (a.srNo || 0) - (b.srNo || 0)),
    [trackers]
  );

  const nextSrNo = useMemo(
    () => (sortedTrackers.length ? Math.max(...sortedTrackers.map((t) => t.srNo || 0)) + 1 : 1),
    [sortedTrackers]
  );

  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    sortedTrackers.forEach((t) => {
      if (t.regMonth) set.add(t.regMonth);
    });
    return Array.from(set);
  }, [sortedTrackers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sortedTrackers.filter((t) => {
      if (cashLoanFilter !== 'All' && (t.cashLoan || '').toLowerCase() !== cashLoanFilter.toLowerCase()) {
        return false;
      }
      if (monthFilter !== 'All' && t.regMonth !== monthFilter) {
        return false;
      }
      if (statusFilter !== 'All') {
        const s = (t.currentStatus || '').toLowerCase();
        if (statusFilter === 'UPPCL Work') {
          if (
            !s.includes('uppcl') &&
            !s.includes('correction') &&
            !s.includes('transfer') &&
            !s.includes('load')
          ) {
            return false;
          }
        } else if (!s.includes(statusFilter.toLowerCase())) {
          return false;
        }
      }
      if (!q) return true;
      return (
        String(t.srNo).includes(q) ||
        (t.customerName || '').toLowerCase().includes(q) ||
        (t.mobileNo || '').toLowerCase().includes(q) ||
        (t.applicationNo || '').toLowerCase().includes(q) ||
        (t.consumerNo || '').toLowerCase().includes(q) ||
        (t.currentStatus || '').toLowerCase().includes(q) ||
        (t.party || '').toLowerCase().includes(q) ||
        (t.vendor || '').toLowerCase().includes(q) ||
        (t.reference || '').toLowerCase().includes(q)
      );
    });
  }, [sortedTrackers, search, statusFilter, cashLoanFilter, monthFilter]);

  const stats = useMemo(() => {
    const uppclPending = sortedTrackers.filter((t) => {
      const s = (t.currentStatus || '').toLowerCase();
      return s.includes('uppcl') || s.includes('correction') || s.includes('transfer') || s.includes('load');
    }).length;
    const installed = sortedTrackers.filter(
      (t) => (t.siteInstalled || '').toLowerCase() === 'done' || (t.siteInstalled || '').toLowerCase() === 'installed'
    ).length;
    const netmeterPending = sortedTrackers.filter(
      (t) => (t.netmetering || '').toLowerCase() !== 'done' && (t.netmetering || '').toLowerCase() !== 'n/a'
    ).length;
    const subsidyDisbursed = sortedTrackers.filter(
      (t) => (t.subsidyDisbursal || '').toLowerCase() === 'done' || (t.subsidyDisbursal || '').toLowerCase() === 'disbursed'
    ).length;
    return { total: sortedTrackers.length, uppclPending, installed, netmeterPending, subsidyDisbursed };
  }, [sortedTrackers]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const openNew = () => {
    setErrorMsg(null);
    setEditingRecord(null);
    setSitePhotoUrlInput('');
    setForm(createEmptyTracker(nextSrNo));
    setModalOpen(true);
  };

  const openEdit = (rec: SiteTrackerRecord, focusPhotos = false) => {
    setErrorMsg(null);
    setSitePhotoUrlInput('');
    setEditingRecord(rec);
    setForm({
      srNo: rec.srNo,
      regSession: rec.regSession || '',
      regMonth: rec.regMonth || '',
      regDate: rec.regDate || '',
      customerName: rec.customerName || '',
      mobileNo: rec.mobileNo || '',
      cashLoan: rec.cashLoan || 'Cash',
      loanStatus: rec.loanStatus || 'N/A',
      currentStatus: rec.currentStatus || '',
      applicationNo: rec.applicationNo || '',
      consumerNo: rec.consumerNo || '',
      registration: rec.registration || 'Pending',
      agreement: rec.agreement || 'Pending',
      installedDate: rec.installedDate || '',
      siteInstalled: rec.siteInstalled || 'Pending',
      dcrCreate: rec.dcrCreate || 'Pending',
      netmetering: rec.netmetering || 'Pending',
      subsidyApply: rec.subsidyApply || 'Pending',
      subsidyDisbursal: rec.subsidyDisbursal || 'Pending',
      plant: rec.plant || '',
      reference: rec.reference || '',
      plantType: rec.plantType || 'On-Grid',
      solarPanel: rec.solarPanel || '',
      inverter: rec.inverter || '',
      battery: rec.battery || 'N/A',
      plantKw: rec.plantKw || '',
      categoryPlant: rec.categoryPlant || 'Residential',
      pendingPay: rec.pendingPay || '',
      firstPayAmt: rec.firstPayAmt || '',
      firstPayDate: rec.firstPayDate || '',
      secondPayAmt: rec.secondPayAmt || '',
      secondPayDate: rec.secondPayDate || '',
      party: rec.party || '',
      vendor: rec.vendor || '',
      dailyNotes: rec.dailyNotes || '',
      siteLocation: rec.siteLocation || '',
      siteTitle: rec.siteTitle || '',
      siteDescription: rec.siteDescription || '',
      sitePhotos: rec.sitePhotos || [],
      publishedToProjects: Boolean(rec.publishedToProjects || focusPhotos),
      featuredOnHome: rec.featuredOnHome !== false,
      linkedProjectId: rec.linkedProjectId || '',
    });
    setModalOpen(true);
    if (focusPhotos) {
      setTimeout(() => {
        projectPublishRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
  };

  const handleSitePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMsg(null);
    setUploadingPhoto(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files).slice(0, 10)) {
        const url = await uploadSiteImage(file, getAdminAuthToken);
        uploadedUrls.push(url);
      }
      setForm((prev) => {
        const nextPhotos = [...(prev.sitePhotos || []), ...uploadedUrls].slice(0, 10);
        const autoTitle =
          prev.siteTitle?.trim() ||
          `${prev.plantKw ? `${prev.plantKw} kW ` : ''}${prev.plantType || 'Solar'} Installation${prev.customerName ? ` — ${prev.customerName}` : ''}`;
        return {
          ...prev,
          sitePhotos: nextPhotos,
          publishedToProjects: true,
          siteTitle: autoTitle,
        };
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to upload site photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const describeFirestoreFailure = async (wrapped: unknown, fallback: string) => {
    if (!auth.currentUser) {
      return 'Firebase Auth session is not active. Click "Sign Out" and log in again now that Email/Password is enabled in Firebase Console.';
    }
    if (!auth.currentUser.emailVerified) {
      return `Email (${auth.currentUser.email}) is not verified yet. Open Gmail, click the verification link, then click "I've Verified — Check Status" at the top of the Admin Dashboard.`;
    }
    let jwtInfo = '';
    try {
      const tokenRes = await auth.currentUser.getIdTokenResult(true);
      let canList = 'unknown';
      try {
        await getDocs(query(collection(db, 'site_trackers'), limit(1)));
        canList = 'yes';
      } catch {
        canList = 'no';
      }
      jwtInfo = `, jwtEmail: ${String(tokenRes.claims.email)}, jwtVerified: ${String(tokenRes.claims.email_verified)}, canList: ${canList}`;
    } catch {
      // ignore diagnostic error
    }
    if (wrapped instanceof Error) {
      try {
        const parsed = JSON.parse(wrapped.message) as {
          error?: string;
          operationType?: string;
          path?: string;
          authInfo?: { email?: string | null; emailVerified?: boolean | null };
        };
        if (parsed.error) {
          return `Firestore error: ${parsed.error} (email: ${parsed.authInfo?.email || 'none'}, verified: ${String(parsed.authInfo?.emailVerified)}, op: ${parsed.operationType || 'write'}, path: ${parsed.path || 'site_trackers'}${jwtInfo})`;
        }
      } catch {
        return wrapped.message || fallback;
      }
    }
    return fallback;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!form.customerName.trim() || !form.mobileNo.trim() || !form.currentStatus.trim()) {
      setErrorMsg('Customer Name, Mobile No, and Current Status are required.');
      return;
    }

    const id = editingRecord?.id || `site_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const shouldPublishProject = Boolean(form.publishedToProjects);
    const linkedProjectId =
      shouldPublishProject
        ? (form.linkedProjectId || `proj_trk_${id}`).slice(0, 128)
        : (form.linkedProjectId || '').slice(0, 128);
    const cleanPhotos = (form.sitePhotos || []).filter(Boolean).slice(0, 10);

    setSaving(true);
    const payload = {
      id,
      srNo: Math.min(1000000, Math.max(1, Number(form.srNo) || nextSrNo)),
      regSession: form.regSession.trim().slice(0, 40),
      regMonth: form.regMonth.trim().slice(0, 30),
      regDate: form.regDate.trim().slice(0, 40),
      customerName: form.customerName.trim().slice(0, 140),
      mobileNo: form.mobileNo.trim().slice(0, 30),
      cashLoan: form.cashLoan.trim().slice(0, 30),
      loanStatus: form.loanStatus.trim().slice(0, 80),
      currentStatus: form.currentStatus.trim().slice(0, 160),
      applicationNo: form.applicationNo.trim().slice(0, 80),
      consumerNo: form.consumerNo.trim().slice(0, 80),
      registration: form.registration.trim().slice(0, 80),
      agreement: form.agreement.trim().slice(0, 80),
      installedDate: form.installedDate.trim().slice(0, 40),
      siteInstalled: form.siteInstalled.trim().slice(0, 80),
      dcrCreate: form.dcrCreate.trim().slice(0, 80),
      netmetering: form.netmetering.trim().slice(0, 80),
      subsidyApply: form.subsidyApply.trim().slice(0, 80),
      subsidyDisbursal: form.subsidyDisbursal.trim().slice(0, 80),
      plant: form.plant.trim().slice(0, 100),
      reference: form.reference.trim().slice(0, 120),
      plantType: form.plantType.trim().slice(0, 60),
      solarPanel: form.solarPanel.trim().slice(0, 120),
      inverter: form.inverter.trim().slice(0, 120),
      battery: form.battery.trim().slice(0, 120),
      plantKw: form.plantKw.trim().slice(0, 40),
      categoryPlant: form.categoryPlant.trim().slice(0, 60),
      pendingPay: form.pendingPay.trim().slice(0, 40),
      firstPayAmt: form.firstPayAmt.trim().slice(0, 40),
      firstPayDate: form.firstPayDate.trim().slice(0, 40),
      secondPayAmt: form.secondPayAmt.trim().slice(0, 40),
      secondPayDate: form.secondPayDate.trim().slice(0, 40),
      party: form.party.trim().slice(0, 120),
      vendor: form.vendor.trim().slice(0, 120),
      dailyNotes: form.dailyNotes.trim().slice(0, 2000),
      siteLocation: (form.siteLocation || '').trim().slice(0, 140),
      siteTitle: (form.siteTitle || '').trim().slice(0, 180),
      siteDescription: (form.siteDescription || '').trim().slice(0, 3000),
      sitePhotos: cleanPhotos,
      publishedToProjects: shouldPublishProject,
      featuredOnHome: Boolean(form.featuredOnHome),
      linkedProjectId,
      updatedAt: serverTimestamp(),
    };

    try {
      if (auth.currentUser) {
        await auth.currentUser.reload().catch(() => {});
        await auth.currentUser.getIdToken(true).catch(() => {});
      }
      if (editingRecord) {
        await updateDoc(doc(db, 'site_trackers', id), payload);
        await onLog('UPDATE_SITE_TRACKER', 'site_trackers', id, `${payload.customerName} (${payload.currentStatus})`);
      } else {
        await setDoc(doc(db, 'site_trackers', id), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        await onLog('CREATE_SITE_TRACKER', 'site_trackers', id, `SR#${payload.srNo} ${payload.customerName}`);
      }

      // Sync to public "Our Projects" collection automatically if enabled (or unpublish if unchecked)
      if (linkedProjectId) {
        const numericKw = parseFloat(String(form.plantKw || '').replace(/[^0-9.]/g, ''));
        const safeCapacity = Number.isFinite(numericKw) && numericKw > 0 ? Math.min(50000, numericKw) : 3;
        const safeCategory: PropertyCategory =
          form.categoryPlant === 'Commercial' || form.categoryPlant === 'Industrial'
            ? form.categoryPlant
            : 'Residential';
        const safeSolarType: SolarSystemType =
          form.plantType === 'Hybrid' || form.plantType === 'Off-Grid'
            ? form.plantType
            : 'On-Grid';

        const projectTitle = (
          payload.siteTitle ||
          `${safeCapacity} kW ${safeSolarType} Solar Plant — ${payload.customerName}`
        ).slice(0, 180);
        const projectLocation = (
          payload.siteLocation ||
          'Meerut / Aligarh, Uttar Pradesh'
        ).slice(0, 140);
        const cleanSlug =
          `${projectTitle}-${id.slice(-4)}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
            .slice(0, 140) || linkedProjectId;
        const autoDesc = (
          payload.siteDescription ||
          payload.dailyNotes ||
          `${safeCapacity} kW ${safeCategory} ${safeSolarType} rooftop solar plant installed for ${payload.customerName} at ${projectLocation}.${payload.solarPanel ? ` Modules: ${payload.solarPanel}.` : ''}${payload.inverter ? ` Inverter: ${payload.inverter}.` : ''}`
        ).slice(0, 3000);
        const afterPhotoUrl =
          cleanPhotos[0] && cleanPhotos[0].length <= 500 ? cleanPhotos[0] : '';

        const existingProjectSnap = await getDoc(doc(db, 'projects', linkedProjectId)).catch(() => null);

        if (shouldPublishProject) {
          await setDoc(doc(db, 'projects', linkedProjectId), {
            id: linkedProjectId,
            slug: cleanSlug,
            title: projectTitle,
            clientName: payload.customerName.slice(0, 140),
            location: projectLocation,
            city: (projectLocation.split(',').pop()?.trim() || projectLocation).slice(0, 80),
            category: safeCategory,
            solarType: safeSolarType,
            capacityKw: safeCapacity,
            installationDate: (payload.installedDate || payload.regDate || '').slice(0, 40),
            panelBrand: payload.solarPanel.slice(0, 100),
            inverterBrand: payload.inverter.slice(0, 100),
            structureDetails: (payload.plant || 'HDGI Mounting Structure').slice(0, 240),
            description: autoDesc,
            images: cleanPhotos,
            beforeImage: '',
            afterImage: afterPhotoUrl,
            videoUrl: '',
            customerTestimonial: '',
            customerApproved: true,
            published: true,
            featured: Boolean(form.featuredOnHome),
            sourceTrackerId: id,
            createdAt: existingProjectSnap?.exists()
              ? existingProjectSnap.data()?.createdAt || serverTimestamp()
              : serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          await onLog('AUTO_PUBLISH_PROJECT', 'projects', linkedProjectId, `${projectTitle} (from SR#${payload.srNo})`);
          showToast(`Saved & automatically published "${projectTitle}" to Our Projects!`);
        } else if (existingProjectSnap?.exists()) {
          await updateDoc(doc(db, 'projects', linkedProjectId), {
            published: false,
            updatedAt: serverTimestamp(),
          });
          showToast(`Updated ${payload.customerName} (unpublished from Our Projects)`);
        } else {
          showToast(editingRecord ? `Updated ${payload.customerName}` : `Added site #${payload.srNo} — ${payload.customerName}`);
        }
      } else {
        showToast(editingRecord ? `Updated ${payload.customerName}` : `Added site #${payload.srNo} — ${payload.customerName}`);
      }

      setModalOpen(false);
      await onRefresh();
    } catch (error) {
      try {
        handleFirestoreError(
          error,
          editingRecord ? OperationType.UPDATE : OperationType.CREATE,
          `site_trackers/${id}`
        );
      } catch (wrapped) {
        setErrorMsg(await describeFirestoreFailure(wrapped, 'Save failed.'));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInlineQuickUpdate = async (
    rec: SiteTrackerRecord,
    patch: Partial<Pick<SiteTrackerRecord, 'currentStatus' | 'siteInstalled' | 'netmetering' | 'dcrCreate' | 'subsidyApply'>>
  ) => {
    setInlineBusyId(rec.id);
    setErrorMsg(null);
    try {
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true).catch(() => {});
      }
      await updateDoc(doc(db, 'site_trackers', rec.id), {
        ...patch,
        updatedAt: serverTimestamp(),
      });
      await onLog(
        'QUICK_UPDATE_SITE',
        'site_trackers',
        rec.id,
        `${rec.customerName}: ${Object.entries(patch).map(([k, v]) => `${k}=${v}`).join(', ')}`
      );
      await onRefresh();
      showToast(`Status updated for ${rec.customerName}`);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.UPDATE, `site_trackers/${rec.id}`);
      } catch (wrapped) {
        setErrorMsg(await describeFirestoreFailure(wrapped, 'Unable to update status in Firestore.'));
      }
    } finally {
      setInlineBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true).catch(() => {});
      }
      await deleteDoc(doc(db, 'site_trackers', deleteTarget.id));
      await onLog('DELETE_SITE_TRACKER', 'site_trackers', deleteTarget.id, `SR#${deleteTarget.srNo} ${deleteTarget.customerName}`);
      setDeleteTarget(null);
      await onRefresh();
      showToast('Site record deleted');
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.DELETE, `site_trackers/${deleteTarget.id}`);
      } catch (wrapped) {
        setErrorMsg(await describeFirestoreFailure(wrapped, 'Unable to delete record from Firestore.'));
      }
    }
  };

  const exportExcel = (recordsToExport: SiteTrackerRecord[], label: string) => {
    const rows = recordsToExport.map(toExcelRow);
    const worksheet = XLSX.utils.json_to_sheet(rows, { header: [...EXCEL_HEADERS] });

    // Auto-calculate clean column widths so dates, mobile numbers & statuses never truncate
    worksheet['!cols'] = EXCEL_HEADERS.map((header) => {
      const maxValLen = rows.reduce((max, row) => {
        const val = String(row[header] ?? '');
        return Math.max(max, val.length);
      }, header.length);
      return { wch: Math.min(Math.max(maxValLen + 3, 12), 36) };
    });

    const summaryRows = [
      { Metric: 'Report Generated Date', Value: new Date().toLocaleDateString('en-IN') },
      { Metric: 'Company', Value: 'Charvi Technologies and Services (Charvi Solar)' },
      { Metric: 'Export Scope', Value: label },
      { Metric: 'Total Sites Included', Value: recordsToExport.length },
      {
        Metric: 'UPPCL / Correction / Load Up Pending',
        Value: recordsToExport.filter((r) => {
          const s = (r.currentStatus || '').toLowerCase();
          return s.includes('uppcl') || s.includes('correction') || s.includes('transfer') || s.includes('load');
        }).length,
      },
      {
        Metric: 'Site Installed Done',
        Value: recordsToExport.filter((r) =>
          ['done', 'installed'].includes((r.siteInstalled || '').toLowerCase())
        ).length,
      },
      {
        Metric: 'Netmetering Done',
        Value: recordsToExport.filter((r) => (r.netmetering || '').toLowerCase() === 'done').length,
      },
      {
        Metric: 'Subsidy Disbursed',
        Value: recordsToExport.filter((r) =>
          ['done', 'disbursed'].includes((r.subsidyDisbursal || '').toLowerCase())
        ).length,
      },
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
    summarySheet['!cols'] = [{ wch: 38 }, { wch: 46 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Site Sheet');
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Daily Summary');

    const dateStamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Charvi_Solar_Daily_Work_${dateStamp}.xlsx`);
    onLog('EXPORT_SITE_EXCEL', 'site_trackers', 'excel', `${recordsToExport.length} sites (${label})`);
    showToast(`Excel sheet downloaded (${recordsToExport.length} sites)`);
  };

  const exportCsv = (recordsToExport: SiteTrackerRecord[]) => {
    const rows = recordsToExport.map(toExcelRow);
    const worksheet = XLSX.utils.json_to_sheet(rows, { header: [...EXCEL_HEADERS] });
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Charvi_Solar_Daily_Work_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header & Excel Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-[#0B1D39]">
            Daily Online Work &amp; Site Status Tracker
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Track UPPCL corrections, name transfers, load enhancement, registration, DCR, netmetering, subsidy &amp; payments per client—and auto-generate the 34-column Excel sheet.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add New Site</span>
          </button>
          <button
            type="button"
            onClick={() => exportExcel(filtered, statusFilter === 'All' && !search ? 'All Sites' : 'Filtered Sites')}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#15803D] hover:bg-[#166534] disabled:opacity-50 text-white rounded-lg cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" aria-hidden="true" />
            <span>Auto Excel (.xlsx)</span>
          </button>
          <button
            type="button"
            onClick={() => exportCsv(filtered)}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-300 bg-white text-[#0B1D39] hover:bg-slate-50 disabled:opacity-50 rounded-lg cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-[11px] font-medium text-slate-500">Total Sites</p>
          <p className="font-mono-tabular text-2xl font-bold text-[#0B1D39] mt-1">{stats.total}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-[11px] font-medium text-slate-500">UPPCL / Correction / Load Up</p>
          <p className="font-mono-tabular text-2xl font-bold text-[#F97316] mt-1">{stats.uppclPending}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-[11px] font-medium text-slate-500">Sites Installed</p>
          <p className="font-mono-tabular text-2xl font-bold text-[#0B1D39] mt-1">{stats.installed}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-[11px] font-medium text-slate-500">Netmetering Pending</p>
          <p className="font-mono-tabular text-2xl font-bold text-amber-700 mt-1">{stats.netmeterPending}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-[11px] font-medium text-slate-500">Subsidy Disbursed</p>
          <p className="font-mono-tabular text-2xl font-bold text-[#15803D] mt-1">{stats.subsidyDisbursed}</p>
        </div>
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

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SR. NO, customer name, mobile, application no, consumer no, party, vendor..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
        >
          <option value="All">All Work Statuses</option>
          <option value="UPPCL Work">UPPCL / Correction / Transfer / Load Up</option>
          {CURRENT_STATUS_PRESETS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-2">
          <select
            value={cashLoanFilter}
            onChange={(e) => setCashLoanFilter(e.target.value)}
            className="px-2.5 py-2 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="All">Cash &amp; Loan</option>
            <option value="Cash">Cash Only</option>
            <option value="Loan">Loan Only</option>
          </select>
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="px-2.5 py-2 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="All">All Months</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Separate Client Records Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">SR. NO</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">Customer &amp; Mobile</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">Application / Consumer No</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">Current Daily Status (Quick Update)</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">Site / DCR / Netmeter</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">Plant &amp; Payment</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">Party / Vendor</th>
                <th className="py-3 px-3 font-semibold text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((rec) => {
                const isCustomStatus = !CURRENT_STATUS_PRESETS.includes(rec.currentStatus);
                return (
                  <tr key={rec.id} className="hover:bg-slate-50/70 align-top">
                    <td className="py-3 px-3 font-mono-tabular font-bold text-[#0B1D39] whitespace-nowrap">
                      #{rec.srNo}
                      <div className="text-[11px] font-normal text-slate-500 mt-0.5">
                        {rec.regMonth} {rec.regSession}
                      </div>
                    </td>
                    <td className="py-3 px-3 min-w-[160px]">
                      <div className="font-semibold text-[#0B1D39]">{rec.customerName}</div>
                      <div className="text-slate-600 tabular-nums mt-0.5">{rec.mobileNo}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {rec.cashLoan}
                        {rec.loanStatus && rec.loanStatus !== 'N/A' ? ` · ${rec.loanStatus}` : ''}
                      </div>
                    </td>
                    <td className="py-3 px-3 min-w-[150px] font-mono-tabular">
                      <div>
                        <span className="text-slate-500">App:</span> {rec.applicationNo || '—'}
                      </div>
                      <div className="mt-0.5">
                        <span className="text-slate-500">Con:</span> {rec.consumerNo || '—'}
                      </div>
                    </td>
                    <td className="py-3 px-3 min-w-[210px]">
                      <select
                        disabled={inlineBusyId === rec.id}
                        value={rec.currentStatus}
                        onChange={(e) =>
                          handleInlineQuickUpdate(rec, { currentStatus: e.target.value })
                        }
                        aria-label={`Update current status for ${rec.customerName}`}
                        className="w-full px-2.5 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-[#0B1D39]"
                      >
                        {isCustomStatus && (
                          <option value={rec.currentStatus}>{rec.currentStatus}</option>
                        )}
                        {CURRENT_STATUS_PRESETS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      {rec.dailyNotes && (
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                          {rec.dailyNotes}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-3 min-w-[165px] space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500">Site:</span>
                        <select
                          disabled={inlineBusyId === rec.id}
                          value={rec.siteInstalled || 'Pending'}
                          onChange={(e) =>
                            handleInlineQuickUpdate(rec, { siteInstalled: e.target.value })
                          }
                          className="px-1.5 py-0.5 text-[11px] border border-slate-200 rounded bg-white"
                        >
                          {STAGE_OPTIONS.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500">DCR:</span>
                        <select
                          disabled={inlineBusyId === rec.id}
                          value={rec.dcrCreate || 'Pending'}
                          onChange={(e) =>
                            handleInlineQuickUpdate(rec, { dcrCreate: e.target.value })
                          }
                          className="px-1.5 py-0.5 text-[11px] border border-slate-200 rounded bg-white"
                        >
                          {STAGE_OPTIONS.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500">Netmeter:</span>
                        <select
                          disabled={inlineBusyId === rec.id}
                          value={rec.netmetering || 'Pending'}
                          onChange={(e) =>
                            handleInlineQuickUpdate(rec, { netmetering: e.target.value })
                          }
                          className="px-1.5 py-0.5 text-[11px] border border-slate-200 rounded bg-white"
                        >
                          {STAGE_OPTIONS.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="py-3 px-3 min-w-[150px]">
                      <div className="font-semibold text-[#0B1D39]">
                        {rec.plantKw ? `${rec.plantKw} kW` : '—'} · {rec.plantType || '—'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {rec.categoryPlant || 'Residential'}
                      </div>
                      <div className="text-[11px] font-mono-tabular text-[#F97316] font-semibold mt-0.5">
                        Pending: {rec.pendingPay || '0'}
                      </div>
                    </td>
                    <td className="py-3 px-3 min-w-[130px]">
                      <div className="text-slate-700">
                        <span className="text-slate-400">Party:</span> {rec.party || '—'}
                      </div>
                      <div className="text-slate-700 mt-0.5">
                        <span className="text-slate-400">Vendor:</span> {rec.vendor || '—'}
                      </div>
                      {rec.publishedToProjects && (
                        <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-[#15803D] bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          <Globe className="w-3 h-3" aria-hidden="true" />
                          <span>Live in Our Projects</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(rec, true)}
                          title="Upload site photo & publish to Our Projects"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-orange-50 hover:bg-[#F97316] hover:text-white text-[#F97316] border border-orange-200 rounded-lg cursor-pointer transition-colors"
                        >
                          <Camera className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{rec.publishedToProjects ? 'Project Photo' : 'Add Photo'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(rec)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-[#0B1D39] hover:text-white text-[#0B1D39] rounded-lg cursor-pointer transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Edit All</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(rec)}
                          aria-label={`Delete ${rec.customerName}`}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 px-4 text-center text-slate-500">
                    No client site records found. Click <span className="font-semibold text-[#0B1D39]">Add New Site</span> to start tracking UPPCL corrections, installations, netmetering, subsidies, and generate your daily Excel sheet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dedicated Per-Client Add / Edit Modal (All 34 Excel Columns + Daily Notes) */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-xl">
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-[#0B1D39]">
                  {editingRecord
                    ? `Edit Client Site #${editingRecord.srNo} — ${editingRecord.customerName}`
                    : 'Add New Client Site Record'}
                </h3>
                <p className="text-xs text-slate-500">
                  Separate client workspace mapped directly to all 34 Excel columns.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-8 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Section 1: Registration & Client Details */}
              <div className="space-y-3">
                <h4 className="font-display text-sm font-bold text-[#0B1D39] border-b border-slate-200 pb-1.5">
                  1. Registration &amp; Customer Identity
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">SR. NO *</label>
                    <input
                      required
                      type="number"
                      min={1}
                      value={form.srNo}
                      onChange={(e) => setForm({ ...form, srNo: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">REG SESSION</label>
                    <input
                      type="text"
                      value={form.regSession}
                      onChange={(e) => setForm({ ...form, regSession: e.target.value })}
                      placeholder="2026-27"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">REG MONTH</label>
                    <select
                      value={form.regMonth}
                      onChange={(e) => setForm({ ...form, regMonth: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="">Select Month</option>
                      {MONTHS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">REG DATE</label>
                    <input
                      type="date"
                      value={form.regDate}
                      onChange={(e) => setForm({ ...form, regDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-1">CUSTOMER NAME *</label>
                    <input
                      required
                      type="text"
                      value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                      placeholder="Full customer name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">MOBILE NO *</label>
                    <input
                      required
                      type="text"
                      value={form.mobileNo}
                      onChange={(e) => setForm({ ...form, mobileNo: e.target.value })}
                      placeholder="10-digit mobile"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">REFERENCE</label>
                    <input
                      type="text"
                      value={form.reference}
                      onChange={(e) => setForm({ ...form, reference: e.target.value })}
                      placeholder="Lead / agent reference"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-1">PARTY</label>
                    <input
                      type="text"
                      value={form.party}
                      onChange={(e) => setForm({ ...form, party: e.target.value })}
                      placeholder="Party / Billing name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-1">VENDOR</label>
                    <input
                      type="text"
                      value={form.vendor}
                      onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                      placeholder="Charvi / Vendor name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: UPPCL / Portal & Daily Work Stages */}
              <div className="space-y-3">
                <h4 className="font-display text-sm font-bold text-[#0B1D39] border-b border-slate-200 pb-1.5">
                  2. UPPCL Corrections, Portal &amp; Daily Work Status
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-1">CURRENT STATUS * (Type or select preset)</label>
                    <input
                      required
                      list="charvi-status-presets"
                      type="text"
                      value={form.currentStatus}
                      onChange={(e) => setForm({ ...form, currentStatus: e.target.value })}
                      placeholder="e.g. UPPCL Name Transfer / Load Up / Correction"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold text-[#0B1D39]"
                    />
                    <datalist id="charvi-status-presets">
                      {CURRENT_STATUS_PRESETS.map((s) => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[
                        'UPPCL Correction Pending',
                        'UPPCL Name Transfer',
                        'UPPCL Name Correction',
                        'UPPCL Load Up / Load Enhancement',
                        'Netmetering Applied',
                        'Subsidy Applied',
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setForm({ ...form, currentStatus: preset })}
                          className="px-2 py-1 text-[11px] rounded border border-slate-200 bg-slate-50 hover:bg-[#0B1D39] hover:text-white cursor-pointer"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold mb-1">APPLICATION NO</label>
                      <input
                        type="text"
                        value={form.applicationNo}
                        onChange={(e) => setForm({ ...form, applicationNo: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-tabular"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">CONSUMER NO (UPPCL Account)</label>
                      <input
                        type="text"
                        value={form.consumerNo}
                        onChange={(e) => setForm({ ...form, consumerNo: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-tabular"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div>
                    <label className="block font-semibold mb-1">REGISTRATION</label>
                    <input
                      list="stage-opts"
                      type="text"
                      value={form.registration}
                      onChange={(e) => setForm({ ...form, registration: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">AGREEMENT</label>
                    <input
                      list="stage-opts"
                      type="text"
                      value={form.agreement}
                      onChange={(e) => setForm({ ...form, agreement: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">SITE INSTALLED</label>
                    <input
                      list="stage-opts"
                      type="text"
                      value={form.siteInstalled}
                      onChange={(e) => setForm({ ...form, siteInstalled: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">INSTALLED DATE</label>
                    <input
                      type="date"
                      value={form.installedDate}
                      onChange={(e) => setForm({ ...form, installedDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">DCR CREATE</label>
                    <input
                      list="stage-opts"
                      type="text"
                      value={form.dcrCreate}
                      onChange={(e) => setForm({ ...form, dcrCreate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">NETMETERING</label>
                    <input
                      list="stage-opts"
                      type="text"
                      value={form.netmetering}
                      onChange={(e) => setForm({ ...form, netmetering: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">SUBCITY APPLY (Subsidy Apply)</label>
                    <input
                      list="stage-opts"
                      type="text"
                      value={form.subsidyApply}
                      onChange={(e) => setForm({ ...form, subsidyApply: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">SUBCITY DISBURSAL (Disbursal)</label>
                    <input
                      list="stage-opts"
                      type="text"
                      value={form.subsidyDisbursal}
                      onChange={(e) => setForm({ ...form, subsidyDisbursal: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
                <datalist id="stage-opts">
                  {STAGE_OPTIONS.map((o) => (
                    <option key={o} value={o} />
                  ))}
                </datalist>

                <div>
                  <label className="block font-semibold mb-1">Daily Staff Work Remarks / UPPCL Notes</label>
                  <textarea
                    rows={2}
                    value={form.dailyNotes}
                    onChange={(e) => setForm({ ...form, dailyNotes: e.target.value })}
                    placeholder="Record today's update (e.g., UPPCL bill name correction submitted, load enhancement 3kW->5kW fee paid)..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Section 3: Plant & Hardware Specifications */}
              <div className="space-y-3">
                <h4 className="font-display text-sm font-bold text-[#0B1D39] border-b border-slate-200 pb-1.5">
                  3. Plant &amp; Equipment Details
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">PLANT</label>
                    <input
                      type="text"
                      value={form.plant}
                      onChange={(e) => setForm({ ...form, plant: e.target.value })}
                      placeholder="Rooftop / Tin Shed"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">PLANT TPYE</label>
                    <select
                      value={form.plantType}
                      onChange={(e) => setForm({ ...form, plantType: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="On-Grid">On-Grid</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Off-Grid">Off-Grid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">CATERGORY PLANT</label>
                    <select
                      value={form.categoryPlant}
                      onChange={(e) => setForm({ ...form, categoryPlant: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Industrial">Industrial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">PLANT KW</label>
                    <input
                      type="text"
                      value={form.plantKw}
                      onChange={(e) => setForm({ ...form, plantKw: e.target.value })}
                      placeholder="e.g. 3 / 5 / 10"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-tabular"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-1">SOLAR PANEL</label>
                    <input
                      type="text"
                      value={form.solarPanel}
                      onChange={(e) => setForm({ ...form, solarPanel: e.target.value })}
                      placeholder="Brand & Wattage (e.g. Waaree 550Wp TOPCon)"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">INVERTER</label>
                    <input
                      type="text"
                      value={form.inverter}
                      onChange={(e) => setForm({ ...form, inverter: e.target.value })}
                      placeholder="Inverter Make & kVA"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">BATTERY</label>
                    <input
                      type="text"
                      value={form.battery}
                      onChange={(e) => setForm({ ...form, battery: e.target.value })}
                      placeholder="N/A or Battery spec"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Loan & Payment Milestones */}
              <div className="space-y-3">
                <h4 className="font-display text-sm font-bold text-[#0B1D39] border-b border-slate-200 pb-1.5">
                  4. Cash / Loan &amp; Payment Tracking
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">CASH_LOAN</label>
                    <select
                      value={form.cashLoan}
                      onChange={(e) => setForm({ ...form, cashLoan: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Loan">Loan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">LOAN STATUS</label>
                    <input
                      list="loan-status-opts"
                      type="text"
                      value={form.loanStatus}
                      onChange={(e) => setForm({ ...form, loanStatus: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                    <datalist id="loan-status-opts">
                      {LOAN_STATUS_OPTIONS.map((o) => (
                        <option key={o} value={o} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">PENDING PAY</label>
                    <input
                      type="text"
                      value={form.pendingPay}
                      onChange={(e) => setForm({ ...form, pendingPay: e.target.value })}
                      placeholder="Pending INR"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-tabular"
                    />
                  </div>
                  <div className="hidden sm:block" />
                  <div>
                    <label className="block font-semibold mb-1">1ST PAY AMT</label>
                    <input
                      type="text"
                      value={form.firstPayAmt}
                      onChange={(e) => setForm({ ...form, firstPayAmt: e.target.value })}
                      placeholder="INR Amount"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">1ST PAY DATE</label>
                    <input
                      type="date"
                      value={form.firstPayDate}
                      onChange={(e) => setForm({ ...form, firstPayDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">2ND PAY AMT</label>
                    <input
                      type="text"
                      value={form.secondPayAmt}
                      onChange={(e) => setForm({ ...form, secondPayAmt: e.target.value })}
                      placeholder="INR Amount"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">2ND PAY DATE</label>
                    <input
                      type="date"
                      value={form.secondPayDate}
                      onChange={(e) => setForm({ ...form, secondPayDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: After-Installation Photos & Auto-Publish to Our Projects */}
              <div
                ref={projectPublishRef}
                className="space-y-4 bg-orange-50/50 border border-orange-200 rounded-xl p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-orange-200 pb-2">
                  <div>
                    <h4 className="font-display text-sm font-bold text-[#0B1D39] flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#F97316]" aria-hidden="true" />
                      <span>5. Site Installation Photos &amp; Auto-Add to Website (&ldquo;Our Projects&rdquo;)</span>
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Site lagne ke baad photo upload karein aur kiski site hai / description daalein — Save karte hi automatically website ke Our Projects section me show ho jayegi.
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 font-semibold text-[#0B1D39] bg-white px-3 py-1.5 rounded-lg border border-orange-200 cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={Boolean(form.publishedToProjects)}
                      onChange={(e) =>
                        setForm({ ...form, publishedToProjects: e.target.checked })
                      }
                    />
                    <span>Publish to Our Projects</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">
                      Website Project Heading (Kiski Site Hai)
                    </label>
                    <input
                      type="text"
                      value={form.siteTitle || ''}
                      onChange={(e) => setForm({ ...form, siteTitle: e.target.value })}
                      placeholder={
                        form.customerName
                          ? `${form.plantKw ? `${form.plantKw} kW ` : ''}${form.plantType} Solar — ${form.customerName}`
                          : 'e.g., 5 kW Rooftop Solar — Rajesh Sharma Ji'
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">
                      Site Location / Mohalla &amp; City
                    </label>
                    <input
                      type="text"
                      value={form.siteLocation || ''}
                      onChange={(e) => setForm({ ...form, siteLocation: e.target.value })}
                      placeholder="e.g., Shastri Nagar, Meerut / Siya Khas, Aligarh"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    Site Details &amp; Description (Kiski site hai aur kya work hua)
                  </label>
                  <textarea
                    rows={3}
                    value={form.siteDescription || ''}
                    onChange={(e) => setForm({ ...form, siteDescription: e.target.value })}
                    placeholder="Site ke baare me details likhein (e.g., Shri Rajesh Sharma Ji ke ghar par 5 kW elevated HDGI rooftop solar system lagaya gaya with ACDB/DCDB safety & net metering)..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-semibold">
                    Site Lagane Ke Baad Ki Photos (up to 10)
                  </label>
                  <div className="flex flex-wrap gap-2 items-center">
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2 font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg cursor-pointer">
                      <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{uploadingPhoto ? 'Uploading...' : 'Upload Site Photo(s)'}</span>
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          handleSitePhotoUpload(e.target.files);
                          e.target.value = '';
                        }}
                      />
                    </label>
                    <input
                      type="text"
                      value={sitePhotoUrlInput}
                      onChange={(e) => setSitePhotoUrlInput(e.target.value)}
                      placeholder="Or paste photo URL..."
                      className="flex-1 min-w-[180px] px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (sitePhotoUrlInput.trim()) {
                          setForm((prev) => ({
                            ...prev,
                            sitePhotos: [...(prev.sitePhotos || []), sitePhotoUrlInput.trim()].slice(0, 10),
                            publishedToProjects: true,
                          }));
                          setSitePhotoUrlInput('');
                        }
                      }}
                      className="px-3 py-2 font-semibold bg-[#0B1D39] text-white rounded-lg cursor-pointer"
                    >
                      Add URL
                    </button>
                  </div>

                  {(form.sitePhotos || []).length > 0 && (
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      {(form.sitePhotos || []).map((url, idx) => (
                        <div
                          key={idx}
                          className="relative w-24 h-20 rounded-lg overflow-hidden border border-slate-300 bg-white"
                        >
                          <img src={url} alt={`Site photo ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                sitePhotos: (prev.sitePhotos || []).filter((_, i) => i !== idx),
                              }))
                            }
                            aria-label="Remove site photo"
                            className="absolute top-0.5 right-0.5 bg-black/75 text-white text-[10px] px-1.5 py-0.5 rounded cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <label className="inline-flex items-center gap-2 font-medium text-[#0B1D39] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featuredOnHome !== false}
                    onChange={(e) => setForm({ ...form, featuredOnHome: e.target.checked })}
                  />
                  <span>Homepage ke &ldquo;Charvi Solar Projects&rdquo; section me bhi dikhayein</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 font-semibold border border-slate-300 text-slate-700 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingPhoto}
                  className="px-5 py-2.5 font-semibold bg-[#0B1D39] hover:bg-[#132B52] disabled:opacity-60 text-white rounded-lg cursor-pointer"
                >
                  {saving
                    ? 'Saving & Syncing...'
                    : form.publishedToProjects
                    ? 'Save Site & Publish to Our Projects'
                    : editingRecord
                    ? 'Update Client Site'
                    : 'Save New Site'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AdminConfirmModal
        open={!!deleteTarget}
        title="Delete Client Site Record?"
        message={`This permanently removes SR. NO #${deleteTarget?.srNo} (${deleteTarget?.customerName}) from the daily work tracker.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
