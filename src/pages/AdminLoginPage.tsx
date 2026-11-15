import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  Mail,
  Lock,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { SeoHead } from '../components/SeoHead';

export function AdminLoginPage() {
  const {
    authReady,
    isAdmin,
    adminEmail,
    verifyAdminEmail,
    signInAdminWithCredentials,
    siteSettings,
  } = useSiteData();
  const navigate = useNavigate();

  const [step, setStep] = useState<'email' | 'password'>('email');
  const [emailInput, setEmailInput] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (authReady && isAdmin && adminEmail) {
      navigate('/admin', { replace: true });
    }
  }, [authReady, isAdmin, adminEmail, navigate]);

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed) {
      setError('Please enter the administrator email ID.');
      return;
    }
    setBusy(true);
    try {
      const confirmedEmail = await verifyAdminEmail(trimmed);
      setVerifiedEmail(confirmedEmail);
      setStep('password');
      setPasswordInput('');
    } catch (err) {
      setStep('email');
      setVerifiedEmail('');
      setError(
        err instanceof Error
          ? err.message
          : 'Access Denied: Unauthorized email address.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!passwordInput) {
      setError('Please enter your administrator password.');
      return;
    }
    setBusy(true);
    try {
      await signInAdminWithCredentials(verifiedEmail, passwordInput);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid administrator password.');
    } finally {
      setBusy(false);
    }
  };

  const handleSwitchEmail = () => {
    setStep('email');
    setVerifiedEmail('');
    setPasswordInput('');
    setShowPassword(false);
    setError(null);
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 flex items-center justify-center px-4 py-16">
      <SeoHead
        title="Admin Login — Charvi Technologies and Services"
        description="Restricted administrator login for Charvi Technologies and Services."
      />
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-xs font-semibold text-slate-500 hover:text-[#0B1D39] inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Back to Website</span>
          </Link>
          <Shield className="w-5 h-5 text-[#F97316]" aria-hidden="true" />
        </div>

        <div>
          <p className="text-xs font-semibold text-[#F97316]">{siteSettings.brandName}</p>
          <h1 className="font-display text-2xl font-bold text-[#0B1D39] mt-1">
            Administrator Console
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            {step === 'email'
              ? 'Step 1: Verify your authorized administrator Email ID to continue.'
              : 'Step 2: Enter your administrator password to unlock the dashboard.'}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email-input"
                className="block text-xs font-semibold text-[#0B1D39] mb-1.5"
              >
                Administrator Email ID
              </label>
              <div className="relative">
                <Mail
                  className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  id="admin-email-input"
                  type="email"
                  required
                  autoFocus
                  autoComplete="username"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter authorized admin email"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 px-4 bg-[#0B1D39] hover:bg-[#132B52] disabled:opacity-60 text-white text-sm font-semibold rounded-lg inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>{busy ? 'Verifying Email...' : 'Verify Email & Continue'}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSignIn} className="space-y-4">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2
                  className="w-4 h-4 text-[#15803D] shrink-0"
                  aria-hidden="true"
                />
                <span className="text-xs font-semibold text-[#0B1D39] truncate">
                  {verifiedEmail}
                </span>
              </div>
              <button
                type="button"
                onClick={handleSwitchEmail}
                className="text-xs font-semibold text-[#F97316] hover:underline shrink-0 cursor-pointer"
              >
                Change
              </button>
            </div>

            <div>
              <label
                htmlFor="admin-password-input"
                className="block text-xs font-semibold text-[#0B1D39] mb-1.5"
              >
                Administrator Password
              </label>
              <div className="relative">
                <Lock
                  className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  autoComplete="current-password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 px-4 bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-60 text-white text-sm font-semibold rounded-lg inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Lock className="w-4 h-4" aria-hidden="true" />
              <span>{busy ? 'Signing In...' : 'Sign In to Admin Panel'}</span>
            </button>
          </form>
        )}

        <p className="text-[11px] text-slate-500 text-center">
          Restricted single-owner access · Server-verified credentials &amp; Firestore security rules.
        </p>
      </div>
    </div>
  );
}
