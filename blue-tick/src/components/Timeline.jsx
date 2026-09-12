import React from 'react';
import { Check, Clock, ShieldCheck, Send, CheckCircle2 } from 'lucide-react';
import { ORDER_TIMELINE_STAGES } from '../services/orderService';

export const Timeline = ({ currentStageIndex = 1 }) => {
  const getStageIcon = (idx) => {
    switch (idx) {
      case 0: return Check;
      case 1: return ShieldCheck;
      case 2: return Clock;
      case 3: return Send;
      case 4: return CheckCircle2;
      default: return Check;
    }
  };

  return (
    <div className="w-full py-4">
      <div className="space-y-6">
        {ORDER_TIMELINE_STAGES.map((stage, idx) => {
          const isPast = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          const Icon = getStageIcon(idx);

          return (
            <div key={stage.id} className="relative flex items-start gap-4">
              {/* Connecting vertical line */}
              {idx !== ORDER_TIMELINE_STAGES.length - 1 && (
                <div
                  className={`absolute left-4 top-8 -bottom-6 w-0.5 transition-colors duration-300 ${
                    idx < currentStageIndex ? 'bg-[#0095F6]' : 'bg-[#DBDBDB]'
                  }`}
                />
              )}

              {/* Step indicator node */}
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                  isPast
                    ? 'bg-[#0095F6] text-white shadow-sm'
                    : isCurrent
                    ? 'bg-blue-50 text-[#0095F6] border-2 border-[#0095F6] ring-4 ring-blue-500/15'
                    : 'bg-neutral-100 text-neutral-400 border border-[#DBDBDB]'
                }`}
              >
                {isPast ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              {/* Text content */}
              <div className="flex-1 pt-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h5
                    className={`text-sm font-bold tracking-tight ${
                      isCurrent
                        ? 'text-[#0095F6]'
                        : isPast
                        ? 'text-[#0F1419]'
                        : 'text-[#737373]'
                    }`}
                  >
                    {stage.title}
                  </h5>
                  {isCurrent && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm bg-blue-50 text-[#0095F6] border border-blue-200">
                      In Progress
                    </span>
                  )}
                  {isPast && (
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm">
                      Done
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#737373] mt-0.5 leading-relaxed">
                  {stage.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;
