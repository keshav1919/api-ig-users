import React from 'react';
import { ShieldCheck, EyeOff } from 'lucide-react';
import { CONTACT_CONFIG } from '../config/contact';

export const Privacy = () => {
  return (
    <div className="w-full max-w-[420px] mx-auto px-3.5 py-4 space-y-4 text-xs text-[#737373] leading-relaxed select-none">
      <div className="border-b border-[#DBDBDB] pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-blue-50 text-[11px] font-bold text-[#0095F6] mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Data Protection</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0F1419] tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#737373] mt-1">
          Last updated: September 2026 · Committed to user confidentiality
        </p>
      </div>

      {/* Strict Credential Privacy Banner */}
      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg text-emerald-950 space-y-1.5">
        <h3 className="font-bold flex items-center gap-1.5 text-emerald-800">
          <EyeOff className="w-4 h-4 text-emerald-600" />
          <span>Zero Credential Collection Policy</span>
        </h3>
        <p className="text-emerald-900">
          We strictly do not collect, store, or solicit your Instagram passwords, 2FA tokens, SMS one-time passwords (OTPs), or recovery codes. We will never ask you to input your Instagram credentials into our website or share them via support channels.
        </p>
      </div>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-[#0F1419]">
          1. Information We Collect
        </h3>
        <p>
          We only collect the minimum details necessary to communicate with you and prepare your profile guidance report:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Public Instagram Handle:</strong> Used solely to view your publicly visible profile, posts, and bio.</li>
          <li><strong>Email Address:</strong> Used to send your verification readiness audit, transaction receipts, and order updates.</li>
          <li><strong>Mobile Phone Number:</strong> Used to provide direct WhatsApp case updates and support ticket responses.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-[#0F1419]">
          2. Payment Processing Security
        </h3>
        <p>
          All payments are conducted via standard Indian UPI protocols (Unified Payments Interface) regulated by the National Payments Corporation of India (NPCI). We do not store credit card numbers, debit card PINs, UPI PINs, or banking passwords on our servers.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-[#0F1419]">
          3. How We Use Your Information
        </h3>
        <p>
          The information collected is used exclusively for:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Delivering the requested verification advisory audit.</li>
          <li>Communicating order status and recommendations.</li>
          <li>Addressing customer service inquiries and technical issues.</li>
        </ul>
        <p>
          We do not sell, rent, or trade your personal data to third-party marketing companies.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-[#0F1419]">
          4. Data Retention & Deletion Rights
        </h3>
        <p>
          You have the right to request deletion of your order records and contact information at any time. Simply email our data privacy officer at <a href={CONTACT_CONFIG.emailUrl} className="text-[#0095F6] underline">{CONTACT_CONFIG.email}</a> with your Order ID, and your data will be purged within 48 hours.
        </p>
      </section>
    </div>
  );
};

export default Privacy;
