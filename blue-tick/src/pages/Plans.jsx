import React, { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { PlanCard } from '../components/PlanCard';
import { InstagramBanner } from '../components/InstagramBanner';
import { UsernameModal } from '../components/UsernameModal';
import { PLANS_DATA } from '../data/plans';
import { useUser } from '../context/UserContext';

export const Plans = () => {
  const plan = PLANS_DATA[0];
  const { currentUser } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-full max-w-[420px] mx-auto px-3 py-2.5 pb-24 space-y-3 select-none">
      {/* Username Modal for changing accounts */}
      <UsernameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        redirectPath="/plans"
      />

      {/* Top Banner: Dynamic Instagram Profile Banner */}
      <InstagramBanner
        user={currentUser}
        onChangeUsername={() => setIsModalOpen(true)}
      />

      {/* Sleek Compact Header */}
      <div className="text-center pt-0.5 pb-0.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-bold text-[#0095F6]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Instagram Verification Assistance</span>
        </div>
      </div>

      {/* Featured Plan Card with Direct Pay Button */}
      <div>
        <PlanCard plan={plan} />
      </div>

      {/* What We Provide */}
      <div className="bg-white rounded-lg border border-[#DBDBDB] p-4 space-y-3">
        <h4 className="font-bold text-sm text-[#0F1419] flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-[#0095F6]">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span>What We Provide</span>
        </h4>
        <ul className="space-y-2 text-xs text-neutral-700">
          {plan.whatIncluded.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-[#0095F6] font-bold">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Plans;
