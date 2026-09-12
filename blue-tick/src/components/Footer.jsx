import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import MetaLogo from './MetaLogo';
import { CONTACT_CONFIG } from '../config/contact';
import { useSettings } from '../context/SettingsContext';

export const Footer = () => {
  const { settings } = useSettings();
  return (
    <footer className="bg-white border-t border-[#DBDBDB] mt-8 pt-8 pb-12 text-xs text-[#737373] w-full">
      <div className="w-full px-4 space-y-6">
        {/* Brand & Mission */}
        <div className="space-y-2 text-center sm:text-left">
          <Link to="/" className="inline-flex items-center gap-1.5" aria-label="Meta Assist">
            <MetaLogo height={16} />
            <span className="font-bold text-[15px] text-[#0095F6] tracking-tight">
              Assist
            </span>
          </Link>
          <p className="text-[11px] text-[#737373] leading-relaxed">
            Independent onboarding, readiness review, and guided application assistance for Instagram creators and accounts.
          </p>
          <div className="pt-1 flex items-center justify-center sm:justify-start gap-2 text-[11px] text-[#0F1419] font-medium">
            <span className="bg-neutral-100 px-2 py-0.5 rounded-sm border border-neutral-200">
              {settings.currencySymbol}{settings.amount} / year
            </span>
            <span>•</span>
            <span>Cancel Anytime</span>
          </div>
        </div>

        {/* Quick Links in 2 Columns */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-100 text-xs">
          <div className="space-y-2">
            <h4 className="font-bold text-[11px] uppercase tracking-wider text-[#0F1419]">
              Navigation
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link to="/" className="hover:text-[#0095F6]">Home</Link></li>
              <li><Link to="/plans" className="hover:text-[#0095F6]">Plans & Pricing</Link></li>
              <li><Link to="/faq" className="hover:text-[#0095F6]">FAQ</Link></li>
              <li><Link to="/support" className="hover:text-[#0095F6]">Account Profile</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-[11px] uppercase tracking-wider text-[#0F1419]">
              Legal
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link to="/terms" className="hover:text-[#0095F6]">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-[#0095F6]">Privacy Policy</Link></li>
              <li><Link to="/refund-policy" className="hover:text-[#0095F6]">Refund Policy</Link></li>
              <li className="pt-1">
                <a
                  href={CONTACT_CONFIG.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-600 font-semibold"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>WhatsApp</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright & Admin link */}
        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400">
          <span>© {new Date().getFullYear()} Meta Assist. All rights reserved.</span>
          <Link to="/admin" className="text-neutral-400 hover:text-[#0064E0] transition-colors" title="Admin Panel">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
