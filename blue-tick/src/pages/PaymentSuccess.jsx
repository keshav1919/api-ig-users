import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowRight,
  Calendar,
  Layers,
  CreditCard,
  AtSign,
  Clock,
} from 'lucide-react';
import orderService from '../services/orderService';
import { PAYMENT_CONFIG } from '../config/payment';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Disclaimer } from '../components/Disclaimer';

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (orderId) {
      const found = orderService.getOrderById(orderId);
      if (found) {
        setOrder(found);
      }
    } else {
      const allOrders = orderService.getOrders();
      if (allOrders.length > 0) {
        setOrder(allOrders[0]);
      }
    }
  }, [orderId]);

  const displayOrder = order || {
    orderId: 'VA-849204',
    planName: PAYMENT_CONFIG.planName,
    amount: PAYMENT_CONFIG.amount,
    currencySymbol: PAYMENT_CONFIG.currencySymbol,
    paymentMethod: 'UPI',
    username: 'creator_studio',
    date: new Date().toISOString(),
    statusLabel: 'Application Review Pending',
  };

  return (
    <div className="w-full max-w-[420px] mx-auto px-3.5 py-4 space-y-4 select-none">
      {/* Success Badge Banner */}
      <div className="bg-white rounded-lg border border-[#DBDBDB] p-6 text-center space-y-4 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-600 animate-check-pop">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-sm">
            Payment Confirmed
          </span>
          <h1 className="text-2xl font-black text-[#0F1419] tracking-tight mt-2">
            Payment Successful
          </h1>
          <p className="text-xs text-[#737373] mt-1 max-w-xs mx-auto">
            Your verification assistance request has been created. Our specialists will begin your readiness review.
          </p>
        </div>

        <div className="text-3xl font-extrabold text-[#0095F6] tracking-tight">
          {formatCurrency(displayOrder.amount, displayOrder.currencySymbol)}
        </div>
      </div>

      {/* Order Details Receipt Card */}
      <div className="bg-white rounded-lg border border-[#DBDBDB] p-5 shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <span className="font-bold text-[#0F1419]">Receipt Details</span>
          <span className="text-[11px] font-mono text-[#737373]">
            {displayOrder.orderId}
          </span>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[#737373]">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-neutral-400" />
              <span>Plan</span>
            </span>
            <span className="font-bold text-[#0F1419]">{displayOrder.planName}</span>
          </div>

          <div className="flex items-center justify-between text-[#737373]">
            <span className="flex items-center gap-1.5">
              <AtSign className="w-3.5 h-3.5 text-neutral-400" />
              <span>Account Username</span>
            </span>
            <span className="font-bold text-[#0F1419]">@{displayOrder.username}</span>
          </div>

          <div className="flex items-center justify-between text-[#737373]">
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-neutral-400" />
              <span>Payment Method</span>
            </span>
            <span className="font-medium text-[#0F1419]">{displayOrder.paymentMethod}</span>
          </div>

          <div className="flex items-center justify-between text-[#737373]">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span>Date</span>
            </span>
            <span className="font-medium text-[#0F1419]">{formatDate(displayOrder.date)}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#0095F6]" />
              <span className="font-bold text-[#0F1419]">Status</span>
            </span>
            <span className="font-bold text-[#0095F6] bg-blue-50 px-2.5 py-0.5 rounded-sm border border-blue-200">
              {displayOrder.statusLabel || 'Application Review Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <Link
        to="/"
        className="w-full inline-flex items-center justify-center gap-2 bg-[#0095F6] hover:bg-[#0081d6] active:scale-95 text-white font-bold py-3 px-6 rounded-sm shadow-xs transition-all text-sm text-center cursor-pointer"
      >
        <span>Back to Home</span>
        <ArrowRight className="w-4 h-4" />
      </Link>

      <Disclaimer variant="subtle" />
    </div>
  );
};

export default PaymentSuccess;
