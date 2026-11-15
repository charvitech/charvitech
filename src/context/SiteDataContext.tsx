import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import {
  ADMIN_EMAIL,
  OperationType,
  auth,
  db,
  handleFirestoreError,
  testFirestoreConnection,
} from '../lib/firebase';
import {
  DEFAULT_BRANCHES,
  DEFAULT_FAQS,
  DEFAULT_PRODUCTS,
  DEFAULT_PROJECTS,
  DEFAULT_SEO_SETTINGS,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_SUBSIDY_SETTINGS,
} from '../data/defaults';
import {
  BranchRecord,
  FaqRecord,
  MediaAsset,
  ProductRecord,
  ProjectRecord,
  ReviewRecord,
  SeoSettings,
  SiteSettings,
  SubsidySettings,
} from '../types/solar';

const ADMIN_SESSION_STORAGE_KEY = 'charvi_admin_session_token';
const STATIC_SESSION_PREFIX = 'static_adm:';
const STATIC_PW_SALT = 'charvi_solar_2026';
const STATIC_PW_SHA256 = 'ad7a8d501c2c0200372d02aded2bfda6205aa39ec33925746509d203a1f7a52d';

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export type FirebaseAuthSyncState = 'connected' | 'unverified_email' | 'needs_console_setup';

interface SiteDataContextValue {
  loading: boolean;
  siteSettings: SiteSettings;
  subsidySettings: SubsidySettings;
  seoSettings: SeoSettings;
  branches: BranchRecord[];
  projects: ProjectRecord[];
  products: ProductRecord[];
  reviews: ReviewRecord[];
  faqs: FaqRecord[];
  media: MediaAsset[];
  googleMapsApiKey: string;
  user: User | null;
  adminEmail: string | null;
  firebaseAuthState: FirebaseAuthSyncState;
  authReady: boolean;
  isAdmin: boolean;
  verifyAdminEmail: (email: string) => Promise<string>;
  signInAdminWithCredentials: (email: string, password: string) => Promise<void>;
  sendAdminVerificationEmail: () => Promise<void>;
  getAdminAuthToken: () => Promise<string | null>;
  signOutAdmin: () => Promise<void>;
  refreshPublicData: () => Promise<void>;
  submitEnquiry: (payload: {
    customerName: string;
    mobile: string;
    email: string;
    city: string;
    propertyType: 'Residential' | 'Commercial' | 'Industrial';
    monthlyBill: string;
    requiredCapacity: string;
    systemType: 'On-Grid' | 'Off-Grid' | 'Hybrid';
    branchPreference: string;
    message: string;
    leadSource: string;
    honeypot?: string;
  }) => Promise<{ enquiryCode: string }>;
}

const SiteDataContext = createContext<SiteDataContextValue | null>(null);

export function SiteDataProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [subsidySettings, setSubsidySettings] = useState<SubsidySettings>(DEFAULT_SUBSIDY_SETTINGS);
  const [seoSettings, setSeoSettings] = useState<SeoSettings>(DEFAULT_SEO_SETTINGS);
  const [branches, setBranches] = useState<BranchRecord[]>(DEFAULT_BRANCHES);
  const [projects, setProjects] = useState<ProjectRecord[]>(DEFAULT_PROJECTS);
  const [products, setProducts] = useState<ProductRecord[]>(DEFAULT_PRODUCTS);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [faqs, setFaqs] = useState<FaqRecord[]>(DEFAULT_FAQS);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  );

  const [user, setUser] = useState<User | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [firebaseAuthState, setFirebaseAuthState] =
    useState<FirebaseAuthSyncState>('needs_console_setup');
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const restoreAuthState = useCallback(async (firebaseUser: User | null) => {
    const isAuthorizedFirebase =
      !!firebaseUser && firebaseUser.email?.toLowerCase() === ADMIN_EMAIL;

    if (isAuthorizedFirebase && firebaseUser.emailVerified) {
      setFirebaseAuthState('connected');
      setAdminEmail(ADMIN_EMAIL);
      setIsAdmin(true);
      return;
    }

    if (isAuthorizedFirebase && !firebaseUser.emailVerified) {
      setFirebaseAuthState('unverified_email');
    } else {
      setFirebaseAuthState('needs_console_setup');
    }

    const storedToken = sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
    if (storedToken) {
      if (storedToken === `${STATIC_SESSION_PREFIX}${ADMIN_EMAIL}`) {
        setAdminEmail(ADMIN_EMAIL);
        setIsAdmin(true);
        return;
      }

      try {
        const res = await fetch('/api/admin/session', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          if (res.ok) {
            const data = (await res.json()) as { ok?: boolean; email?: string };
            if (data.ok && data.email?.toLowerCase() === ADMIN_EMAIL) {
              setAdminEmail(ADMIN_EMAIL);
              setIsAdmin(true);
              return;
            }
          }
          sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
        } else {
          // Static host fallback when Express API is unavailable
          setAdminEmail(ADMIN_EMAIL);
          setIsAdmin(true);
          return;
        }
      } catch {
        // Ignore transient network errors during restore
      }
    }

    setAdminEmail(null);
    setIsAdmin(false);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      await restoreAuthState(u);
      setAuthReady(true);
    });
    return () => unsub();
  }, [restoreAuthState]);

  useEffect(() => {
    fetch('/api/public-config')
      .then((res) => {
        const contentType = res.headers.get('content-type') || '';
        return res.ok && contentType.includes('application/json') ? res.json() : null;
      })
      .then((data) => {
        if (data?.googleMapsApiKey) {
          setGoogleMapsApiKey(data.googleMapsApiKey);
        }
      })
      .catch(() => {});
  }, []);

  const refreshPublicData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        siteSnap,
        subsidySnap,
        seoSnap,
        branchesSnap,
        projectsSnap,
        productsSnap,
        reviewsSnap,
        faqsSnap,
        mediaSnap,
      ] = await Promise.all([
        getDoc(doc(db, 'settings', 'site')).catch(() => null),
        getDoc(doc(db, 'settings', 'subsidy')).catch(() => null),
        getDoc(doc(db, 'settings', 'seo')).catch(() => null),
        getDocs(collection(db, 'branches')).catch(() => null),
        getDocs(query(collection(db, 'projects'), where('published', '==', true))).catch(() => null),
        getDocs(query(collection(db, 'products'), where('published', '==', true))).catch(() => null),
        getDocs(query(collection(db, 'reviews'), where('published', '==', true))).catch(() => null),
        getDocs(query(collection(db, 'faqs'), where('published', '==', true))).catch(() => null),
        getDocs(collection(db, 'media')).catch(() => null),
      ]);

      if (siteSnap?.exists()) {
        setSiteSettings({ ...DEFAULT_SITE_SETTINGS, ...(siteSnap.data() as Partial<SiteSettings>) });
      }
      if (subsidySnap?.exists()) {
        setSubsidySettings({
          ...DEFAULT_SUBSIDY_SETTINGS,
          ...(subsidySnap.data() as Partial<SubsidySettings>),
        });
      }
      if (seoSnap?.exists()) {
        setSeoSettings({ ...DEFAULT_SEO_SETTINGS, ...(seoSnap.data() as Partial<SeoSettings>) });
      }
      if (branchesSnap && !branchesSnap.empty) {
        const list = branchesSnap.docs.map((d) => d.data() as BranchRecord);
        setBranches(list);
      }
      if (projectsSnap) {
        setProjects(projectsSnap.docs.map((d) => d.data() as ProjectRecord));
      }
      if (productsSnap && !productsSnap.empty) {
        setProducts(productsSnap.docs.map((d) => d.data() as ProductRecord));
      }
      if (reviewsSnap) {
        setReviews(reviewsSnap.docs.map((d) => d.data() as ReviewRecord));
      }
      if (faqsSnap && !faqsSnap.empty) {
        const list = faqsSnap.docs
          .map((d) => d.data() as FaqRecord)
          .sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99));
        setFaqs(list);
      }
      if (mediaSnap) {
        setMedia(mediaSnap.docs.map((d) => d.data() as MediaAsset));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    testFirestoreConnection().finally(() => {
      refreshPublicData();
    });
  }, [refreshPublicData]);

  const verifyAdminEmail = useCallback(async (rawEmail: string) => {
    const email = rawEmail.trim().toLowerCase();

    try {
      const res = await fetch('/api/admin/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = (await res.json()) as {
          ok?: boolean;
          allowed?: boolean;
          email?: string;
          error?: string;
        };
        if (!res.ok || !data.allowed) {
          throw new Error(
            data.error || 'Access Denied: This email is not authorized for the administrator panel.'
          );
        }
        return data.email || ADMIN_EMAIL;
      }
    } catch (err) {
      // Re-throw explicit API denials; fall through only on static-host / non-JSON 404s
      if (err instanceof Error && err.message.includes('Access Denied')) {
        throw err;
      }
      if (err instanceof Error && err.message.includes('Too many')) {
        throw err;
      }
    }

    // Static-host fallback (e.g., Netlify without Express backend)
    if (email !== ADMIN_EMAIL) {
      throw new Error('Access Denied: This email is not authorized for the administrator panel.');
    }
    return ADMIN_EMAIL;
  }, []);

  const signInAdminWithCredentials = useCallback(async (rawEmail: string, password: string) => {
    const email = rawEmail.trim().toLowerCase();
    if (email !== ADMIN_EMAIL) {
      throw new Error('Access Denied: Only the authorized administrator email is permitted.');
    }

    let handledByExpress = false;

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        handledByExpress = true;
        const data = (await res.json()) as {
          ok?: boolean;
          token?: string;
          email?: string;
          error?: string;
        };
        if (!res.ok || !data.token) {
          throw new Error(data.error || 'Invalid credentials.');
        }
        sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, data.token);
      }
    } catch (err) {
      if (handledByExpress) {
        throw err;
      }
    }

    // Attempt Firebase Email/Password authentication (works on both Express and Netlify)
    let firebaseUser: User | null = null;
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      firebaseUser = cred.user;
    } catch {
      firebaseUser = null;
    }

    if (!handledByExpress) {
      // Static-host verification (Netlify): accept if salted SHA-256 matches OR Firebase Auth succeeded
      const candidateHash = await sha256Hex(`${STATIC_PW_SALT}:${password}`);
      if (candidateHash !== STATIC_PW_SHA256 && !firebaseUser) {
        throw new Error('Invalid password. Please check your credentials and try again.');
      }
      sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, `${STATIC_SESSION_PREFIX}${ADMIN_EMAIL}`);
    }

    setAdminEmail(ADMIN_EMAIL);
    setIsAdmin(true);

    if (firebaseUser) {
      setUser(firebaseUser);
      setFirebaseAuthState(firebaseUser.emailVerified ? 'connected' : 'unverified_email');
    } else {
      setFirebaseAuthState('needs_console_setup');
    }
  }, []);

  const sendAdminVerificationEmail = useCallback(async () => {
    if (!auth.currentUser) {
      throw new Error('Firebase user session is not active.');
    }
    await sendEmailVerification(auth.currentUser);
  }, []);

  const getAdminAuthToken = useCallback(async () => {
    if (
      auth.currentUser &&
      auth.currentUser.emailVerified &&
      auth.currentUser.email?.toLowerCase() === ADMIN_EMAIL
    ) {
      return auth.currentUser.getIdToken();
    }
    return sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
  }, []);

  const signOutAdmin = useCallback(async () => {
    sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    if (auth.currentUser) {
      await signOut(auth).catch(() => {});
    }
    setUser(null);
    setAdminEmail(null);
    setIsAdmin(false);
    setFirebaseAuthState('needs_console_setup');
  }, []);

  const submitEnquiry: SiteDataContextValue['submitEnquiry'] = useCallback(async (payload) => {
    if (payload.honeypot && payload.honeypot.trim().length > 0) {
      throw new Error('Invalid submission.');
    }

    const id = `enq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const enquiryCode = `CTS-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const notifyRes = await fetch('/api/enquiries/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, enquiryCode }),
      });
      const contentType = notifyRes.headers.get('content-type') || '';
      if (contentType.includes('application/json') && !notifyRes.ok) {
        const errData = (await notifyRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(errData.error || 'Unable to submit enquiry right now.');
      }
    } catch (err) {
      if (err instanceof Error && (err.message.includes('Too many') || err.message.includes('Invalid') || err.message.includes('Required'))) {
        throw err;
      }
      // On static hosting (e.g. Netlify without Express), proceed directly to Firestore persistence
    }

    const docRef = doc(db, 'enquiries', id);
    try {
      await setDoc(docRef, {
        id,
        enquiryCode,
        customerName: payload.customerName.trim().slice(0, 120),
        mobile: payload.mobile.trim().slice(0, 25),
        email: payload.email.trim().slice(0, 120),
        city: payload.city.trim().slice(0, 80),
        propertyType: payload.propertyType,
        monthlyBill: payload.monthlyBill.trim().slice(0, 40),
        requiredCapacity: payload.requiredCapacity.trim().slice(0, 40),
        systemType: payload.systemType,
        branchPreference: payload.branchPreference.trim().slice(0, 60),
        message: payload.message.trim().slice(0, 2000),
        leadSource: payload.leadSource.trim().slice(0, 120),
        status: 'New',
        internalNotes: '',
        followUpHistory: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `enquiries/${id}`);
    }

    return { enquiryCode };
  }, []);

  return (
    <SiteDataContext.Provider
      value={{
        loading,
        siteSettings,
        subsidySettings,
        seoSettings,
        branches,
        projects,
        products,
        reviews,
        faqs,
        media,
        googleMapsApiKey,
        user,
        adminEmail,
        firebaseAuthState,
        authReady,
        isAdmin,
        verifyAdminEmail,
        signInAdminWithCredentials,
        sendAdminVerificationEmail,
        getAdminAuthToken,
        signOutAdmin,
        refreshPublicData,
        submitEnquiry,
      }}
    >
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData() {
  const ctx = useContext(SiteDataContext);
  if (!ctx) {
    throw new Error('useSiteData must be used inside SiteDataProvider');
  }
  return ctx;
}
