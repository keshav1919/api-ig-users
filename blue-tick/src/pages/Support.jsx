import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { InstagramBanner } from '../components/InstagramBanner';
import { UsernameModal } from '../components/UsernameModal';
import { useUser } from '../context/UserContext';

export const Support = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-full max-w-[420px] mx-auto px-4 py-4 space-y-4 select-none">
      {/* Username Modal */}
      <UsernameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        redirectPath="/support"
      />

      {/* Account Profile Banner */}
      <InstagramBanner
        user={currentUser}
        onChangeUsername={() => setIsModalOpen(true)}
      />

      {/* Account Actions & Verification Status */}
      {currentUser ? (
        <div className="space-y-3">
          {/* Readiness Status Card */}
          <div className="bg-white rounded-xl border border-[#DBDBDB] p-4 text-left space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1C1E21]">
              <CheckCircle2 className="w-4 h-4 text-[#0095F6]" />
              <span>Account Status: Active & Ready</span>
            </div>
            <p className="text-xs text-[#737373] leading-relaxed">
              Your profile @{currentUser.username} is connected. You can activate Meta Verified assistance for ₹30/yr.
            </p>
          </div>

          {/* Primary Action Button to Plans */}
          <button
            type="button"
            onClick={() => navigate('/plans')}
            className="w-full h-12 rounded-full bg-[#0095F6] hover:bg-[#1877F2] active:bg-[#0081D6] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Get Verified Badge (₹30/-)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="pt-2 text-center">
          <p className="text-xs text-[#737373]">
            Connect your Instagram profile to view verification readiness and subscribe.
          </p>
        </div>
      )}
    </div>
  );
};

export default Support;
