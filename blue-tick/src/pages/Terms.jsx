import React from 'react';
import { ShieldAlert, FileText } from 'lucide-react';
import { PAYMENT_CONFIG } from '../config/payment';
import { CONTACT_CONFIG } from '../config/contact';

export const Terms = () => {
  return (
    <div className="w-full max-w-[420px] mx-auto px-3.5 py-4 space-y-4 text-xs text-[#737373] leading-relaxed select-none">
      <div className="border-b border-[#DBDBDB] pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-blue-50 text-[11px] font-bold text-[#0095F6] mb-2">
          <FileText className="w-3.5 h-3.5" />
          <span>Legal Agreement</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0F1419] tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs text-[#737373] mt-1">
          Last updated: September 2026 · Effective immediately
        </p>
      </div>

      {/* Mandatory Prominent Callout */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-amber-900 space-y-1">
        <h3 className="font-bold flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>1. Independent Entity & Non-Affiliation Clause</span>
        </h3>
        <p>
          VerifyAssist ({CONTACT_CONFIG.entityName}) is an independent advisory and technical assistance service. We are <strong>NOT</strong> affiliated with, endorsed by, sponsored by, or operated by Meta Platforms, Inc., Instagram, or any of their parent or sister corporations. Instagram and Meta are registered trademarks of Meta Platforms, Inc.
        </p>
      </div>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-[#0F1419]">
          2. Scope of Service & Advisory Nature
        </h3>
        <p>
          The service provided under the {PAYMENT_CONFIG.currencySymbol}{PAYMENT_CONFIG.amount}/month subscription is strictly limited to:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Reviewing the public presentation, bio, and categorisation of your Instagram profile.</li>
          <li>Providing step-by-step guidance on submitting an official verification request via official Instagram mobile interfaces.</li>
          <li>Evaluating public account security and two-factor authentication readiness.</li>
          <li>Delivering priority customer support and inquiry response regarding verification standards.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-[#0F1419]">
          3. Absolute Disclaimer of Badge Guarantee
        </h3>
        <p>
          Payment for VerifyAssist services does <strong>NOT</strong> guarantee that your Instagram account will receive a verified badge or blue tick. The power to evaluate, approve, or reject verification applications belongs solely, exclusively, and discretionarily to Instagram and Meta Platforms, Inc. VerifyAssist has no administrative access to Instagram internal review queues.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-[#0F1419]">
          4. Zero Account Credential Requirement
        </h3>
        <p>
          Under no circumstances will VerifyAssist, its agents, or representatives request your Instagram account password, two-factor authentication (2FA) verification codes, SMS OTPs, or backup codes. All final submissions must be completed by the account owner through their official app.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-[#0F1419]">
          5. Subscription, Billing & Renewals
        </h3>
        <p>
          The fee is {PAYMENT_CONFIG.currencySymbol}{PAYMENT_CONFIG.amount} per calendar month. Subscribers may cancel renewal at any time prior to the next billing date by contacting our support desk at {CONTACT_CONFIG.email}.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-[#0F1419]">
          6. Limitation of Liability
        </h3>
        <p>
          To the maximum extent permitted by applicable law, VerifyAssist shall not be liable for any indirect, punitive, or consequential damages resulting from third-party decisions made by social media platforms regarding account status, suspensions, or badge revocations.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-[#0F1419]">
          7. Governing Law & Dispute Resolution
        </h3>
        <p>
          These Terms are governed by and construed in accordance with the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts in {CONTACT_CONFIG.location}.
        </p>
      </section>
    </div>
  );
};

export default Terms;
