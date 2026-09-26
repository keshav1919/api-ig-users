import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  Lock,
  Sparkles,
  ArrowRight,
  Headphones,
} from 'lucide-react';
import VerifiedBadge from '../components/VerifiedBadge';
import { UsernameModal } from '../components/UsernameModal';
import { FAQ_ITEMS } from '../data/faq';
import { useUser } from '../context/UserContext';

// Floating Meta Assistant Petal Icon (from Image 2)
const MetaAssistantIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="3" fill="#7C3AED" />
    <ellipse cx="12" cy="5" rx="1.8" ry="2.8" fill="#8B5CF6" />
    <ellipse cx="12" cy="19" rx="1.8" ry="2.8" fill="#8B5CF6" />
    <ellipse cx="5" cy="12" rx="2.8" ry="1.8" fill="#7C3AED" />
    <ellipse cx="19" cy="12" rx="2.8" ry="1.8" fill="#7C3AED" />
    <ellipse cx="7.05" cy="7.05" rx="1.8" ry="2.8" transform="rotate(-45 7.05 7.05)" fill="#6D28D9" />
    <ellipse cx="16.95" cy="16.95" rx="1.8" ry="2.8" transform="rotate(-45 16.95 16.95)" fill="#6D28D9" />
    <ellipse cx="16.95" cy="7.05" rx="1.8" ry="2.8" transform="rotate(45 16.95 7.05)" fill="#9333EA" />
    <ellipse cx="7.05" cy="19" rx="1.8" ry="2.8" transform="rotate(45 7.05 19)" fill="#9333EA" />
  </svg>
);

export const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const metaPillars = [
    {
      icon: ShieldCheck,
      title: 'A verified badge',
      description: 'Your audience can trust that you are the authentic creator or business behind your account.',
      badgeColor: 'text-[#0095F6] bg-blue-50/60',
    },
    {
      icon: Lock,
      title: 'Proactive account protection',
      description: 'Continuous monitoring helps defend your identity against impersonators targeting your profile.',
      badgeColor: 'text-[#0095F6] bg-blue-50/60',
    },
    {
      icon: Headphones,
      title: 'Direct account support',
      description: 'Get help with real account issues from an expert support specialist when you need it.',
      badgeColor: 'text-[#0095F6] bg-blue-50/60',
    },
    {
      icon: Sparkles,
      title: 'Exclusive features',
      description: 'Access tailored stickers and tools across Stories and Reels to grow audience engagement.',
      badgeColor: 'text-[#0095F6] bg-blue-50/60',
    },
  ];

  return (
    <div className="w-full max-w-[420px] mx-auto select-none">
      {/* Instagram Username Modal */}
      <UsernameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        redirectPath="/plans"
      />

      {/* ======================================================== */}
      {/* 1. HERO SECTION (1:1 with Image 1 for Instagram)          */}
      {/* ======================================================== */}
      <section className="px-6 pt-7 pb-6 text-left">
        {/* Large Meta Verified Blue Rosette Badge (Official Facebook CDN Vector) */}
        <div className="mb-6">
          <VerifiedBadge size={76} color="#3897F0" />
        </div>

        {/* Headline */}
        <h1
          className="text-[32px] font-bold text-[#1c1e21] tracking-tight leading-[1.15] mb-4"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
        >
          Get Verified badge at ₹30/-
        </h1>

        {/* Description Text (1:1 with Image 1) */}
        <p
          className="text-[15.5px] text-[#2c3138] leading-[1.48] font-normal mb-8"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
        >
          Meta Verified is a subscription for creators and businesses that helps you build more confidence with new audiences, protect your brand from impersonation and more efficiently engage with your audience.
        </p>

        {/* Primary Instagram Action Button */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full h-[52px] rounded-full bg-[#0095F6] hover:bg-[#1877F2] active:bg-[#0081D6] text-white text-[16px] font-semibold tracking-normal transition-colors flex items-center justify-center cursor-pointer"
          >
            <span>Subscribe on Instagram</span>
          </button>
        </div>

        {/* Active Instagram Profile Continuation (Flat native Instagram style) */}
        {currentUser && (
          <div className="mt-5 p-3.5 rounded-2xl bg-white/85 border border-black/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full p-[1.5px] ig-story-gradient shrink-0">
                <div className="w-full h-full rounded-full bg-white p-[1px] overflow-hidden">
                  {currentUser.avatarUrl || currentUser.profilePic ? (
                    <img
                      src={currentUser.avatarUrl || currentUser.profilePic}
                      alt={currentUser.username}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[#262626] text-white flex items-center justify-center text-xs font-bold">
                      {currentUser.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-left min-w-0">
                <div className="flex items-center gap-1 text-xs font-bold text-[#1c1e21]">
                  <span className="truncate">@{currentUser.username}</span>
                </div>
                <div className="text-[11px] text-[#737373] truncate flex items-center gap-1">
                  {currentUser.isPrivate ? (
                    <span>🔒 Private Account</span>
                  ) : (
                    <>
                      <span>{currentUser.followers} followers</span>
                      <span>•</span>
                      <span>Public</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/plans')}
              className="px-4 py-1.5 bg-[#0095F6] hover:bg-[#1877F2] text-white text-xs font-semibold rounded-full shrink-0 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 2. META VERIFIED PILLARS & BENEFITS                       */}
      {/* ======================================================== */}
      <section className="px-6 py-5 space-y-4">
        <div className="space-y-1 text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0095F6]">
            What's included
          </span>
          <h2 className="text-xl font-bold text-[#1c1e21] tracking-tight">
            Build trust and grow your audience
          </h2>
        </div>

        <div className="space-y-2.5">
          {metaPillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="bg-white/85 rounded-2xl border border-black/[0.08] p-4 text-left flex items-start gap-3.5"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${p.badgeColor}`}>
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-[#1c1e21] mb-1">
                    {p.title}
                  </h3>
                  <p className="text-[12.5px] text-[#4b5563] leading-relaxed">
                    {p.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. FAST ONBOARDING SUMMARY                               */}
      {/* ======================================================== */}
      <section className="px-6 py-4">
        <div className="p-5 rounded-3xl bg-white/85 border border-black/[0.08] text-center space-y-3">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-blue-50/70 text-[#0095F6] mb-1">
            <VerifiedBadge size={26} color="#3897F0" />
          </div>
          <h3 className="font-bold text-[16px] text-[#1c1e21]">
            Ready to verify your Instagram account?
          </h3>
          <p className="text-[12.5px] text-[#4b5563] max-w-xs mx-auto">
            Detect your profile photo, review your account readiness, and activate your onboarding plan.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full h-11 rounded-full bg-[#0095F6] hover:bg-[#1877F2] active:bg-[#0081D6] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Start on Instagram</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. FREQUENTLY ASKED QUESTIONS                             */}
      {/* ======================================================== */}
      <section className="px-6 py-5 space-y-3">
        <div className="space-y-1 text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0095F6]">
            Questions?
          </span>
          <h2 className="text-xl font-bold text-[#1c1e21] tracking-tight">
            Frequently Asked
          </h2>
        </div>

        <div className="space-y-2">
          {FAQ_ITEMS.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className="bg-white/85 rounded-2xl border border-black/[0.08] p-4 text-left space-y-1.5"
            >
              <h3 className="font-bold text-[13px] text-[#1c1e21] flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-[#0095F6] shrink-0 mt-0.5" />
                <span>{item.question}</span>
              </h3>
              <p className="text-[12px] text-[#4b5563] leading-relaxed pl-6">
                {item.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => navigate('/faq')}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#0095F6] hover:underline cursor-pointer"
          >
            <span>View all questions & requirements</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. FLOATING META ASSISTANT WIDGET (FROM IMAGE 2)          */}
      {/* ======================================================== */}
      <div className="fixed bottom-20 right-4 z-40">
        <button
          type="button"
          onClick={() => navigate('/support')}
          aria-label="Meta Assistant Support"
          title="Meta Verified Support"
          className="w-12 h-12 rounded-full bg-white border border-black/[0.1] flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
        >
          <MetaAssistantIcon />
        </button>
      </div>
    </div>
  );
};

export default Home;
