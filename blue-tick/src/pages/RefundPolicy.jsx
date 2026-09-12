import React from 'react';
import { RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { PAYMENT_CONFIG } from '../config/payment';
import { CONTACT_CONFIG } from '../config/contact';

export const RefundPolicy = () => {
  return (
    <div className="w-full max-w-[420px] mx-auto px-3.5 py-4 space-y-4 text-xs text-[#737373] leading-relaxed select-none">
      <div className="border-b border-[#DBDBDB] pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-blue-50 text-[11px] font-bold text-[#0095F6] mb-2">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Billing Transparency</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0F1419] tracking-tight">
          Cancellation & Refund Policy
        </h1>
        <p className="text-xs text-[#737373] mt-1">
          Last updated: September 2026 · Fair and clear terms
        </p>
      </div>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-[#0F1419]">
          1. Understanding the Nature of Advisory Services
        </h3>
        <p>
          VerifyAssist provides professional digital advisory, account audits, and submission guidance. Our fee of {PAYMENT_CONFIG.currencySymbol}{PAYMENT_CONFIG.amount}/month compensates our specialists for their time, manual evaluation, and dedicated preparation of your account readiness dossier.
        </p>
      </section>

      {/* When Refunds Are Eligible vs Ineligible */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Eligible for Full Refund</span>
          </div>
          <ul className="space-y-1.5 text-neutral-700">
            <li>• Duplicate payments or accidental multiple charges.</li>
            <li>• If our advisory team fails to initiate your account review within 72 hours of payment.</li>
            <li>• Cancellation requested within 6 hours of payment before any audit work has commenced.</li>
          </ul>
        </div>

        <div className="bg-rose-50/70 border border-rose-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-rose-900 text-xs">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>Non-Refundable Circumstances</span>
          </div>
          <ul className="space-y-1.5 text-neutral-700">
            <li>• Platform rejection: Instagram/Meta deciding not to grant a badge is beyond our control.</li>
            <li>• Account suspensions or terms violations by the user on third-party platforms.</li>
            <li>• Requests submitted after personalized audit notes have already been delivered.</li>
          </ul>
        </div>
      </div>

      <section className="space-y-2 pt-2">
        <h3 className="text-sm font-bold text-[#0F1419]">
          2. Subscription Cancellation
        </h3>
        <p>
          Your monthly assistance subscription renews every 30 days unless cancelled. You can cancel future renewals at any time with zero cancellation penalties by messaging our WhatsApp support or emailing <a href={CONTACT_CONFIG.emailUrl} className="text-[#0095F6] underline">{CONTACT_CONFIG.email}</a> at least 24 hours before your next billing date.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-[#0F1419]">
          3. Refund Processing Timelines
        </h3>
        <p>
          Approved refunds are reversed directly to the original UPI bank account / VPA used during payment. In accordance with NPCI banking guidelines, refunds typically reflect in your account within 3 to 5 business days.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-[#0F1419]">
          4. How to Request a Refund
        </h3>
        <p>
          To submit a refund request, contact our billing desk at <a href={CONTACT_CONFIG.emailUrl} className="text-[#0095F6] underline">{CONTACT_CONFIG.email}</a> with the subject line "Refund Request: [Your Order ID]" and provide your registered mobile number and reason for request.
        </p>
      </section>
    </div>
  );
};

export default RefundPolicy;
