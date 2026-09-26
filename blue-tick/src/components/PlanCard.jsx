import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Headphones,
  Sparkles,
  CreditCard,
  Loader2,
} from 'lucide-react';
import MetaLogo from './MetaLogo';
import VerifiedBadge from './VerifiedBadge';
import { PAYMENT_CONFIG } from '../config/payment';
import { formatCurrency } from '../utils/formatters';
import { useUser } from '../context/UserContext';
import paymentService from '../services/paymentService';

export const PlanCard = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);

  const displayUser = currentUser || {
    username: 'your_account',
    fullName: 'Your Instagram Account',
    followers: '0',
    profilePic: null,
    avatarUrl: null,
  };

  const handleDirectPay = async () => {
    setIsProcessing(true);
    try {
      const res = await paymentService.createPayment({
        customerData: {
          username: displayUser.username,
          email: `${displayUser.username}@example.com`,
          phone: '9876543210',
        },
      });

      if (res?.session) {
        navigate(`/payment?session=${res.session.sessionId}`);
      } else {
        navigate('/payment');
      }
    } catch (err) {
      console.error('Payment initialization failed:', err);
      navigate('/payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const benefits = [
    {
      title: 'A verified badge',
      desc: 'Build trust with your audience showing you are an authentic public presence.',
      icon: VerifiedBadge,
      isCustomBadge: true,
    },
    {
      title: 'Proactive account protection',
      desc: 'Expert audit to safeguard your account against impersonation and security gaps.',
      icon: ShieldCheck,
      color: 'text-[#0095F6]',
    },
    {
      title: 'Direct human support',
      desc: 'Get fast answers from a dedicated specialist regarding your verification status.',
      icon: Headphones,
      color: 'text-[#0095F6]',
    },
    {
      title: 'Full application walkthrough',
      desc: 'Step-by-step submission checklist tailored specifically to your niche.',
      icon: Sparkles,
      color: 'text-[#0095F6]',
    },
  ];

  const avatarSrc = displayUser.avatarUrl || displayUser.profilePic;

  return (
    <>
      <div className="w-full max-w-[420px] mx-auto bg-white rounded-lg border border-[#DBDBDB] overflow-hidden">
        {/* Meta Accounts Center Header Banner */}
        <div className="p-4 border-b border-[#EFEFEF]">
          <div className="flex items-center gap-2 mb-3">
            <MetaLogo size={18} />
            <span className="text-xs font-semibold text-[#737373] tracking-tight">
              Accounts Center
            </span>
          </div>
          <h2 className="text-lg font-bold text-[#262626] tracking-tight leading-snug mb-1.5">
            Set up verification assistance on Instagram
          </h2>
          <p className="text-xs text-[#737373] leading-relaxed">
            Guided account review, eligibility preparation, and onboarding in one place.
          </p>
        </div>

        {/* Profile Selector Tile (Exact Meta style) */}
        <div className="p-3.5 bg-[#FAFAFA] border-b border-[#EFEFEF]">
          <div className="bg-white rounded-lg border border-[#DBDBDB] p-3 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-full p-[2px] ig-story-gradient shrink-0">
                <div className="w-full h-full rounded-full bg-white p-[1.5px]">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={displayUser.username}
                      referrerPolicy="no-referrer"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[#262626] text-white flex items-center justify-center text-sm font-bold">
                      {displayUser.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 font-bold text-sm text-[#262626] truncate">
                  <span className="truncate">{displayUser.username}</span>
                  <VerifiedBadge size={14} className="shrink-0" />
                </div>
                <div className="text-xs text-[#737373] truncate">
                  {displayUser.isPrivate ? 'Instagram • Private Account' : `Instagram • ${displayUser.followers || '0'} followers`}
                </div>
              </div>
            </div>

            {/* Selected Radio Indicator */}
            <div className="w-5 h-5 rounded-full bg-[#0095F6] flex items-center justify-center text-white shrink-0 ml-2">
              <svg className="w-3 h-3 fill-current stroke-current" viewBox="0 0 20 20">
                <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Pricing Summary (No button in page) */}
        <div className="p-3.5 bg-[#F8FAFC] border-b border-[#EFEFEF] flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-[#262626]">Annual guidance</span>
            <p className="text-[11px] text-[#737373]">Yearly plan • Cancel anytime before renewal</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-[#0095F6]">
              {formatCurrency(PAYMENT_CONFIG.amount)}
            </span>
            <span className="text-xs font-semibold text-[#737373]"> / yr</span>
          </div>
        </div>

        {/* Meta Accounts Center Feature List */}
        <div className="p-4 space-y-3.5 bg-white">
          <div className="text-xs font-bold uppercase tracking-wider text-[#737373]">
            What's included with verification assistance:
          </div>

          <div className="space-y-3">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {b.isCustomBadge ? (
                      <VerifiedBadge size={18} />
                    ) : (
                      <Icon className={`w-[18px] h-[18px] ${b.color || 'text-[#0095F6]'}`} />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-[#262626] leading-tight">
                      {b.title}
                    </div>
                    <div className="text-xs text-[#737373] leading-relaxed">
                      {b.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Permanently Fixed Footer Bottom Bar with Pay Button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#DBDBDB] p-3">
        <div className="max-w-[420px] mx-auto flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase font-bold text-[#737373] tracking-wide">
              Verification Plan
            </div>
            <div className="text-lg font-black text-[#262626] leading-tight">
              {formatCurrency(PAYMENT_CONFIG.amount)}{' '}
              <span className="text-xs font-normal text-[#737373]">/ yr</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDirectPay}
            disabled={isProcessing}
            className="ig-btn-primary px-7 h-11 text-sm font-bold flex items-center gap-2 rounded-md active:scale-95 transition-all cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Preparing Payment...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Pay {formatCurrency(PAYMENT_CONFIG.amount)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default PlanCard;
