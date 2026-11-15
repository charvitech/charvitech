import { useCallback, useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Image,
  MessageSquareQuote,
  FileText,
  Calculator,
  Package,
  MapPin,
  Search,
  Settings,
  ShieldCheck,
  LogOut,
  ExternalLink,
  AlertTriangle,
  MailCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { db } from '../lib/firebase';
import {
  AdminLogRecord,
  AdminUserRecord,
  EnquiryRecord,
  FaqRecord,
  MediaAsset,
  ProductRecord,
  ProjectRecord,
  ReviewRecord,
  SiteTrackerRecord,
} from '../types/solar';
import { SeoHead } from '../components/SeoHead';
import { AdminLeadsModule } from '../components/admin/AdminLeadsModule';
import { AdminSiteTrackerModule } from '../components/admin/AdminSiteTrackerModule';
import { AdminProjectsModule } from '../components/admin/AdminProjectsModule';
import {
  AdminMediaModule,
  AdminReviewsModule,
} from '../components/admin/AdminMediaReviewsModule';
import {
  AdminBranchesModule,
  AdminContentFaqsModule,
  AdminProductsModule,
  AdminSettingsSeoSecurityModule,
  AdminSubsidySettingsModule,
} from '../components/admin/AdminCatalogCmsModule';

type AdminTab =
  | 'overview'
  | 'leads'
  | 'site-tracker'
  | 'projects'
  | 'media'
  | 'reviews'
  | 'content'
  | 'subsidy'
  | 'products'
  | 'branches'
  | 'seo'
  | 'settings'
  | 'security';

const NAV_ITEMS: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'site-tracker', label: 'Daily Site & Excel', icon: FileSpreadsheet },
  { id: 'leads', label: 'Lead CRM', icon: Users },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'media', label: 'Media Library', icon: Image },
  { id: 'reviews', label: 'Reviews', icon: MessageSquareQuote },
  { id: 'content', label: 'Content & FAQs', icon: FileText },
  { id: 'subsidy', label: 'Subsidy & Calc', icon: Calculator },
  { id: 'products', label: 'Products & Brands', icon: Package },
  { id: 'branches', label: 'Branches', icon: MapPin },
  { id: 'seo', label: 'SEO & Sitemap', icon: Search },
  { id: 'settings', label: 'Site Settings', icon: Settings },
  { id: 'security', label: 'Security & Logs', icon: ShieldCheck },
];

export function AdminDashboardPage() {
  const {
    user,
    adminEmail,
    firebaseAuthState,
    authReady,
    isAdmin,
    sendAdminVerificationEmail,
    reloadAdminVerificationStatus,
    signOutAdmin,
    siteSettings,
    subsidySettings,
    seoSettings,
    branches,
    refreshPublicData,
  } = useSiteData();

  const [tab, setTab] = useState<AdminTab>('overview');
  const [verificationSent, setVerificationSent] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [loadingAdminData, setLoadingAdminData] = useState(true);
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [siteTrackers, setSiteTrackers] = useState<SiteTrackerRecord[]>([]);
  const [allProjects, setAllProjects] = useState<ProjectRecord[]>([]);
  const [allProducts, setAllProducts] = useState<ProductRecord[]>([]);
  const [allReviews, setAllReviews] = useState<ReviewRecord[]>([]);
  const [allFaqs, setAllFaqs] = useState<FaqRecord[]>([]);
  const [allMedia, setAllMedia] = useState<MediaAsset[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUserRecord[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminLogRecord[]>([]);

  const loadAdminData = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingAdminData(true);
    try {
      const [enqS, trkS, projS, prodS, revS, faqS, medS, usrS, logS] = await Promise.all([
        getDocs(query(collection(db, 'enquiries'), orderBy('createdAt', 'desc'))).catch(() => null),
        getDocs(query(collection(db, 'site_trackers'), orderBy('srNo', 'asc'))).catch(() => null),
        getDocs(collection(db, 'projects')).catch(() => null),
        getDocs(collection(db, 'products')).catch(() => null),
        getDocs(collection(db, 'reviews')).catch(() => null),
        getDocs(collection(db, 'faqs')).catch(() => null),
        getDocs(collection(db, 'media')).catch(() => null),
        getDocs(collection(db, 'admin_users')).catch(() => null),
        getDocs(query(collection(db, 'admin_logs'), orderBy('createdAt', 'desc'), limit(40))).catch(() => null),
      ]);

      if (enqS) setEnquiries(enqS.docs.map((d) => d.data() as EnquiryRecord));
      if (trkS) setSiteTrackers(trkS.docs.map((d) => d.data() as SiteTrackerRecord));
      if (projS) setAllProjects(projS.docs.map((d) => d.data() as ProjectRecord));
      if (prodS) setAllProducts(prodS.docs.map((d) => d.data() as ProductRecord));
      if (revS) setAllReviews(revS.docs.map((d) => d.data() as ReviewRecord));
      if (faqS) setAllFaqs(faqS.docs.map((d) => d.data() as FaqRecord));
      if (medS) setAllMedia(medS.docs.map((d) => d.data() as MediaAsset));
      if (usrS) setAdminUsers(usrS.docs.map((d) => d.data() as AdminUserRecord));
      if (logS) setAdminLogs(logS.docs.map((d) => d.data() as AdminLogRecord));
    } finally {
      setLoadingAdminData(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleLog = useCallback(
    async (action: string, targetType: string, targetId: string, details: string) => {
      if (!user) return;
      const id = `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      await setDoc(doc(db, 'admin_logs', id), {
        id,
        actorEmail: user.email || 'unknown',
        actorUid: user.uid,
        action: action.slice(0, 80),
        targetType: targetType.slice(0, 80),
        targetId: targetId.slice(0, 128),
        details: details.slice(0, 500),
        createdAt: serverTimestamp(),
      }).catch(() => {});
    },
    [user]
  );

  const handleRefreshAll = useCallback(async () => {
    await Promise.all([loadAdminData(), refreshPublicData()]);
  }, [loadAdminData, refreshPublicData]);

  if (!authReady) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-slate-500">
        Verifying administrator session...
      </div>
    );
  }

  if (!isAdmin || !adminEmail) {
    return <Navigate to="/admin/login" replace />;
  }

  const newLeadsCount = enquiries.filter((e) => e.status === 'New').length;
  const convertedCount = enquiries.filter((e) => e.status === 'Converted').length;
  const publishedReviewsCount = allReviews.filter((r) => r.published).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <SeoHead
        title="Admin Dashboard — Charvi Technologies and Services"
        description="Administrator console."
      />

      {/* Sidebar */}
      <aside className="lg:w-64 bg-[#0B1D39] text-slate-300 shrink-0 flex flex-col justify-between">
        <div>
          <div className="p-5 border-b border-slate-800">
            <p className="font-display font-bold text-white text-base">
              {siteSettings.brandName}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{adminEmail}</p>
          </div>

          <nav aria-label="Admin Navigation" className="p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left ${
                    active
                      ? 'bg-[#F97316] text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold border border-slate-700 text-slate-200 rounded-lg hover:bg-slate-800"
          >
            <span>View Public Website</span>
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={signOutAdmin}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-red-300 hover:bg-red-950/40 rounded-lg cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4">
          <div className="text-xs font-medium text-slate-500">
            Admin Console / <span className="text-[#0B1D39] font-semibold">{NAV_ITEMS.find((n) => n.id === tab)?.label}</span>
          </div>
          <button
            type="button"
            onClick={handleRefreshAll}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            Refresh Data
          </button>
        </header>

        <main className="p-6 max-w-6xl mx-auto">
          {firebaseAuthState !== 'connected' && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="font-semibold">
                    {firebaseAuthState === 'unverified_email'
                      ? 'Firebase Email Verification Pending'
                      : 'Firebase Console Email/Password Provider Not Yet Linked'}
                  </p>
                  <p className="text-amber-900/90 leading-relaxed">
                    {firebaseAuthState === 'unverified_email'
                      ? `Signed in to Firebase Auth as ${adminEmail}, but email_verified is false. Verify the email to enable live Firestore database reads and writes.`
                      : `Signed in via verified admin session (${adminEmail}). To enable live Firestore database reads & edits in this browser, enable Email/Password provider in Firebase Console Authentication and create/verify ${adminEmail}.`}
                  </p>
                  {verificationError && (
                    <p className="text-red-700 font-medium">{verificationError}</p>
                  )}
                </div>
              </div>
              {firebaseAuthState === 'unverified_email' ? (
                <div className="shrink-0 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={checkingVerification}
                    onClick={async () => {
                      setVerificationError(null);
                      setCheckingVerification(true);
                      try {
                        const verified = await reloadAdminVerificationStatus();
                        if (verified) {
                          await handleRefreshAll();
                        } else {
                          setVerificationError(
                            `Email is still unverified. Open ${adminEmail} (Inbox / Spam / All Mail), click the Firebase link, then click "I've Verified — Check Status" again.`
                          );
                        }
                      } catch (err) {
                        setVerificationError(
                          err instanceof Error ? err.message : 'Unable to check verification status.'
                        );
                      } finally {
                        setCheckingVerification(false);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#15803D] text-white rounded-lg hover:bg-[#166534] disabled:opacity-60 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{checkingVerification ? 'Checking...' : "I've Verified — Check Status"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setVerificationError(null);
                      try {
                        await sendAdminVerificationEmail();
                        setVerificationSent(true);
                      } catch (err) {
                        setVerificationError(
                          err instanceof Error ? err.message : 'Unable to send verification email.'
                        );
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#0B1D39] text-white rounded-lg hover:bg-[#132B52] cursor-pointer"
                  >
                    <MailCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{verificationSent ? 'Verification Email Sent' : 'Send Verification Email'}</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={signOutAdmin}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#0B1D39] text-white rounded-lg hover:bg-[#132B52] cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Sign Out & Re-Login to Connect Firebase</span>
                </button>
              )}
            </div>
          )}

          {loadingAdminData && tab === 'overview' ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {tab === 'overview' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-5">
                      <p className="text-xs text-slate-500">Total Enquiries</p>
                      <p className="font-mono-tabular text-3xl font-bold text-[#0B1D39] mt-1">{enquiries.length}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-5">
                      <p className="text-xs text-slate-500">New Enquiries</p>
                      <p className="font-mono-tabular text-3xl font-bold text-[#F97316] mt-1">{newLeadsCount}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-5">
                      <p className="text-xs text-slate-500">Converted Leads</p>
                      <p className="font-mono-tabular text-3xl font-bold text-[#15803D] mt-1">{convertedCount}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-5">
                      <p className="text-xs text-slate-500">Total Projects</p>
                      <p className="font-mono-tabular text-3xl font-bold text-[#0B1D39] mt-1">{allProjects.length}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-5">
                      <p className="text-xs text-slate-500">Total Media Files</p>
                      <p className="font-mono-tabular text-3xl font-bold text-[#0B1D39] mt-1">{allMedia.length}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-5">
                      <p className="text-xs text-slate-500">Tracked Client Sites</p>
                      <p className="font-mono-tabular text-3xl font-bold text-[#0B1D39] mt-1">{siteTrackers.length}</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-display text-base font-bold text-[#0B1D39]">
                        Daily Online Work &amp; Auto Excel Sheet
                      </h2>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Update UPPCL corrections, name transfers, load enhancement, DCR, netmetering &amp; export the 34-column Excel sheet.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTab('site-tracker')}
                      className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4" aria-hidden="true" />
                      <span>Open Daily Site Tracker</span>
                    </button>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h2 className="font-display text-lg font-bold text-[#0B1D39] mb-4">
                      Recent Admin Activities
                    </h2>
                    <div className="divide-y divide-slate-100 text-xs">
                      {adminLogs.slice(0, 10).map((l) => (
                        <div key={l.id} className="py-2.5 flex items-center justify-between gap-4">
                          <div>
                            <span className="font-mono-tabular font-semibold text-[#0B1D39]">{l.action}</span>
                            <span className="text-slate-600 ml-2">{l.details}</span>
                          </div>
                          <span className="text-slate-400">{l.actorEmail}</span>
                        </div>
                      ))}
                      {adminLogs.length === 0 && (
                        <p className="py-6 text-center text-slate-500">
                          No recent admin activity logged yet. Changes saved across modules appear here automatically.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {tab === 'site-tracker' && (
                <AdminSiteTrackerModule
                  trackers={siteTrackers}
                  onRefresh={handleRefreshAll}
                  onLog={handleLog}
                />
              )}

              {tab === 'leads' && (
                <AdminLeadsModule
                  enquiries={enquiries}
                  onRefresh={handleRefreshAll}
                  onLog={handleLog}
                />
              )}

              {tab === 'projects' && (
                <AdminProjectsModule
                  projects={allProjects}
                  onRefresh={handleRefreshAll}
                  onLog={handleLog}
                />
              )}

              {tab === 'media' && (
                <AdminMediaModule
                  media={allMedia}
                  onRefresh={handleRefreshAll}
                  onLog={handleLog}
                />
              )}

              {tab === 'reviews' && (
                <AdminReviewsModule
                  reviews={allReviews}
                  onRefresh={handleRefreshAll}
                  onLog={handleLog}
                />
              )}

              {tab === 'content' && (
                <AdminContentFaqsModule
                  siteSettings={siteSettings}
                  faqs={allFaqs}
                  onRefresh={handleRefreshAll}
                  onLog={handleLog}
                />
              )}

              {tab === 'subsidy' && (
                <AdminSubsidySettingsModule
                  subsidySettings={subsidySettings}
                  onRefresh={handleRefreshAll}
                  onLog={handleLog}
                />
              )}

              {tab === 'products' && (
                <AdminProductsModule
                  products={allProducts}
                  onRefresh={handleRefreshAll}
                  onLog={handleLog}
                />
              )}

              {tab === 'branches' && (
                <AdminBranchesModule
                  branches={branches}
                  onRefresh={handleRefreshAll}
                  onLog={handleLog}
                />
              )}

              {tab === 'seo' && (
                <AdminSettingsSeoSecurityModule
                  mode="seo"
                  siteSettings={siteSettings}
                  seoSettings={seoSettings}
                  adminUsers={adminUsers}
                  adminLogs={adminLogs}
                  onRefresh={handleRefreshAll}
                  onLog={handleLog}
                />
              )}

              {tab === 'settings' && (
                <AdminSettingsSeoSecurityModule
                  mode="settings"
                  siteSettings={siteSettings}
                  seoSettings={seoSettings}
                  adminUsers={adminUsers}
                  adminLogs={adminLogs}
                  onRefresh={handleRefreshAll}
                  onLog={handleLog}
                />
              )}

              {tab === 'security' && (
                <AdminSettingsSeoSecurityModule
                  mode="security"
                  siteSettings={siteSettings}
                  seoSettings={seoSettings}
                  adminUsers={adminUsers}
                  adminLogs={adminLogs}
                  onRefresh={handleRefreshAll}
                  onLog={handleLog}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
