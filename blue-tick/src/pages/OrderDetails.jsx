import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  ShieldCheck,
  Check,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import orderService, { ORDER_TIMELINE_STAGES } from '../services/orderService';
import Timeline from '../components/Timeline';
import { formatDate } from '../utils/formatters';
import { Disclaimer } from '../components/Disclaimer';
import { CONTACT_CONFIG } from '../config/contact';

export const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (id) {
      const found = orderService.getOrderById(id);
      if (found) {
        setOrder(found);
      }
    }
  }, [id]);

  // Demo tool to advance stage
  const handleAdvanceStage = (nextIndex) => {
    if (!order) return;
    const stage = ORDER_TIMELINE_STAGES[nextIndex];
    let newStatus = 'in-review';
    if (nextIndex === 0) newStatus = 'pending';
    if (nextIndex === 3) newStatus = 'submitted';
    if (nextIndex === 4) newStatus = 'completed';

    const updated = orderService.updateOrderStatus(
      order.orderId,
      nextIndex,
      newStatus,
      stage.title,
      `Stage updated to: ${stage.title}`
    );
    setOrder(updated);
  };

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#0F1419]">Order Not Found</h2>
        <p className="text-xs text-[#737373]">
          We couldn't locate order ID "{id}". It may have been placed in a different browser session.
        </p>
        <Link
          to="/orders"
          className="inline-block bg-[#0095F6] text-white text-xs font-bold px-4 py-2 rounded-sm"
        >
          View All Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px] mx-auto px-3.5 py-4 space-y-4 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#DBDBDB]/80 pb-3">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-1 text-sm font-semibold text-[#0F1419] hover:text-[#0095F6] transition-colors p-1 rounded-sm"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>All Orders</span>
        </button>
        <h1 className="font-extrabold text-base text-[#0F1419] tracking-tight">
          Request Tracking
        </h1>
        <div className="w-12" />
      </div>

      {/* Order Status Header Card */}
      <div className="bg-white rounded-lg border border-[#DBDBDB] p-5 shadow-xs space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[11px] font-mono text-[#737373]">
              {order.orderId}
            </span>
            <h2 className="font-black text-lg text-[#0F1419] tracking-tight">
              {order.planName}
            </h2>
          </div>
          <span className="text-xs font-bold text-[#0F1419] bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-sm">
            {order.statusLabel || 'In Progress'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100 text-xs">
          <div>
            <span className="text-[#737373] text-[11px]">Instagram Handle:</span>
            <div className="font-bold text-[#0F1419]">@{order.username}</div>
          </div>
          <div>
            <span className="text-[#737373] text-[11px]">Created On:</span>
            <div className="font-medium text-[#0F1419]">{formatDate(order.date)}</div>
          </div>
        </div>
      </div>

      {/* 5-Stage Timeline */}
      <div className="bg-white rounded-lg border border-[#DBDBDB] p-6 shadow-xs space-y-2">
        <h3 className="font-bold text-sm text-[#0F1419]">
          Service Progress Timeline
        </h3>
        <Timeline
          currentStageIndex={order.currentStageIndex ?? 1}
          status={order.status}
        />
      </div>

      {/* Account Readiness Checklist */}
      <div className="bg-white rounded-lg border border-[#DBDBDB] p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#0F1419]">
            Account Readiness Checklist
          </h3>
          <span className="text-[10px] uppercase font-bold text-[#0095F6] bg-blue-50 px-2 py-0.5 rounded-sm">
            Audit in Progress
          </span>
        </div>
        <p className="text-xs text-[#737373]">
          Our team reviews these key elements to ensure your account satisfies standard Instagram eligibility.
        </p>

        <ul className="space-y-2 pt-2 text-xs">
          {(order.checklist || []).map((item, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-sm bg-neutral-50 border border-neutral-100"
            >
              <span className="font-medium text-neutral-800">{item.item}</span>
              {item.completed ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  Passed
                </span>
              ) : (
                <span className="text-[#737373] text-[11px] font-medium">
                  Evaluating...
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Advisory Notes Box */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg p-5 text-xs space-y-1.5">
        <h4 className="font-bold text-[#0095F6] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span>Advisory Notes</span>
        </h4>
        <p className="text-neutral-700 leading-relaxed">
          {order.notes || 'Your audit is currently active. Please ensure your profile remains set to Public and that you have added your official full name in your Instagram bio.'}
        </p>
      </div>

      {/* Direct WhatsApp Support Button */}
      <a
        href={`${CONTACT_CONFIG.whatsappUrl}&text=Hello%2C%20I%20am%20inquiring%20about%20Order%20${order.orderId}%20for%20account%20@${order.username}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white font-bold py-3 px-6 rounded-sm shadow-xs transition-all text-xs cursor-pointer"
      >
        <MessageCircle className="w-4 h-4" />
        <span>Chat with Case Specialist on WhatsApp</span>
      </a>

      {/* Demo Timeline Stage Advancement Tool */}
      <div className="bg-neutral-900 text-white rounded-lg p-4 space-y-2 text-xs">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold flex items-center gap-1 text-amber-400">
            <Sparkles className="w-3 h-3" />
            Demo: Test Timeline Progression
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {ORDER_TIMELINE_STAGES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => handleAdvanceStage(idx)}
              className={`text-[10px] font-bold px-2 py-1 rounded-sm transition-colors cursor-pointer ${
                order.currentStageIndex === idx
                  ? 'bg-[#0095F6] text-white'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              Step {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <Disclaimer variant="subtle" />
    </div>
  );
};

export default OrderDetails;
