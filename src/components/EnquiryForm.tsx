import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { PropertyCategory, SolarSystemType } from '../types/solar';

interface EnquiryFormProps {
  defaultCity?: string;
  defaultPropertyType?: PropertyCategory;
  defaultSystemType?: SolarSystemType;
  defaultCapacity?: string;
  defaultMonthlyBill?: string;
  defaultMessage?: string;
  leadSource?: string;
  compact?: boolean;
}

export function EnquiryForm({
  defaultCity = '',
  defaultPropertyType = 'Residential',
  defaultSystemType = 'On-Grid',
  defaultCapacity = '',
  defaultMonthlyBill = '',
  defaultMessage = '',
  leadSource = 'Website Quotation Form',
  compact = false,
}: EnquiryFormProps) {
  const { submitEnquiry, siteSettings } = useSiteData();
  const [customerName, setCustomerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState(defaultCity);
  const [propertyType, setPropertyType] = useState<PropertyCategory>(defaultPropertyType);
  const [monthlyBill, setMonthlyBill] = useState(defaultMonthlyBill);
  const [requiredCapacity, setRequiredCapacity] = useState(defaultCapacity);
  const [systemType, setSystemType] = useState<SolarSystemType>(defaultSystemType);
  const [branchPreference, setBranchPreference] = useState(
    defaultCity.toLowerCase().includes('aligarh')
      ? 'Aligarh'
      : defaultCity.toLowerCase().includes('meerut')
      ? 'Meerut'
      : 'Nearest Branch'
  );
  const [message, setMessage] = useState(defaultMessage);
  const [honeypot, setHoneypot] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanedMobile = mobile.replace(/[^0-9]/g, '');
    if (customerName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (cleanedMobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (city.trim().length < 2) {
      setError('Please enter your city or district.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitEnquiry({
        customerName,
        mobile: cleanedMobile,
        email,
        city,
        propertyType,
        monthlyBill,
        requiredCapacity,
        systemType,
        branchPreference,
        message,
        leadSource,
        honeypot,
      });
      setSuccessCode(res.enquiryCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit your enquiry right now.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successCode) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-[#15803D]/10 text-[#15803D] mx-auto flex items-center justify-center mb-4">
          <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
        </div>
        <h3 className="font-display text-xl font-bold text-[#0B1D39]">
          Quotation Request Received
        </h3>
        <p className="text-sm text-slate-600 mt-2">
          Thank you, {customerName}. Your request has been recorded by {siteSettings.companyName}.
        </p>
        <p className="mt-3 text-xs font-mono-tabular text-[#0B1D39] bg-slate-100 inline-block px-3 py-1.5 rounded-lg">
          Reference ID: {successCode}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setSuccessCode(null);
              setCustomerName('');
              setMobile('');
              setEmail('');
              setMessage('');
            }}
            className="px-4 py-2 text-xs font-semibold border border-slate-300 text-[#0B1D39] rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            Submit Another Enquiry
          </button>
          <a
            href={`https://wa.me/${siteSettings.whatsappNumber}?text=${encodeURIComponent(
              `Hello Charvi Solar, I just submitted quotation request ${successCode} for ${city}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-xs font-semibold bg-[#15803D] text-white rounded-lg hover:bg-[#166534]"
          >
            Share Details on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Honeypot trap */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className={`grid grid-cols-1 ${compact ? 'sm:grid-cols-2' : 'md:grid-cols-2'} gap-4`}>
        <div>
          <label htmlFor="enq-name" className="block text-xs font-semibold text-[#0B1D39] mb-1.5">
            Customer Name *
          </label>
          <input
            id="enq-name"
            type="text"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Your full name"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="enq-mobile" className="block text-xs font-semibold text-[#0B1D39] mb-1.5">
            Mobile Number *
          </label>
          <input
            id="enq-mobile"
            type="tel"
            required
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="10-digit mobile number"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="enq-email" className="block text-xs font-semibold text-[#0B1D39] mb-1.5">
            Email Address
          </label>
          <input
            id="enq-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="enq-city" className="block text-xs font-semibold text-[#0B1D39] mb-1.5">
            City / Location *
          </label>
          <input
            id="enq-city"
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g., Meerut, Aligarh, Bulandshahr"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="enq-property" className="block text-xs font-semibold text-[#0B1D39] mb-1.5">
            Property Type *
          </label>
          <select
            id="enq-property"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value as PropertyCategory)}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          >
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Industrial">Industrial</option>
          </select>
        </div>

        <div>
          <label htmlFor="enq-system" className="block text-xs font-semibold text-[#0B1D39] mb-1.5">
            Solar System Type *
          </label>
          <select
            id="enq-system"
            value={systemType}
            onChange={(e) => setSystemType(e.target.value as SolarSystemType)}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          >
            <option value="On-Grid">On-Grid Solar System</option>
            <option value="Hybrid">Hybrid Solar System</option>
            <option value="Off-Grid">Off-Grid Solar System</option>
          </select>
        </div>

        <div>
          <label htmlFor="enq-bill" className="block text-xs font-semibold text-[#0B1D39] mb-1.5">
            Avg. Monthly Electricity Bill (₹)
          </label>
          <input
            id="enq-bill"
            type="text"
            value={monthlyBill}
            onChange={(e) => setMonthlyBill(e.target.value)}
            placeholder="e.g., ₹4,500"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          />
        </div>

        <div>
          <label htmlFor="enq-capacity" className="block text-xs font-semibold text-[#0B1D39] mb-1.5">
            Required Capacity (kW)
          </label>
          <input
            id="enq-capacity"
            type="text"
            value={requiredCapacity}
            onChange={(e) => setRequiredCapacity(e.target.value)}
            placeholder="e.g., 3 kW, 5 kW, 25 kW"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="enq-branch" className="block text-xs font-semibold text-[#0B1D39] mb-1.5">
          Preferred Support Branch
        </label>
        <select
          id="enq-branch"
          value={branchPreference}
          onChange={(e) => setBranchPreference(e.target.value)}
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]"
        >
          <option value="Nearest Branch">Nearest Branch (Meerut / Aligarh)</option>
          <option value="Meerut">Meerut Branch (7906573807)</option>
          <option value="Aligarh">Aligarh Branch (8476030036)</option>
        </select>
      </div>

      <div>
        <label htmlFor="enq-message" className="block text-xs font-semibold text-[#0B1D39] mb-1.5">
          Site / Roof Details or Questions
        </label>
        <textarea
          id="enq-message"
          rows={compact ? 2 : 3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your roof type (RCC terrace / tin shed), sanctioned load, or backup requirements..."
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 text-sm font-semibold text-white bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
      >
        <Send className="w-4 h-4" aria-hidden="true" />
        <span>{submitting ? 'Submitting Request...' : 'Request Free Solar Quotation'}</span>
      </button>
    </form>
  );
}
