import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, RefreshCw, Headphones } from 'lucide-react';
import { PAYMENT_CONFIG } from '../config/payment';
import { formatCurrency } from '../utils/formatters';

export const PaymentFailed = () => {
  return (
    <div className="w-full max-w-[420px] mx-auto px-3.5 py-4 space-y-4 select-none">
      {/* Failure Header */}
      <div className="bg-white rounded-lg border border-[#DBDBDB] p-6 text-center space-y-4 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-rose-50 border-2 border-rose-500 flex items-center justify-center mx-auto text-rose-600">
          <XCircle className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-sm">
            Transaction Declined
          </span>
          <h1 className="text-2xl font-black text-[#0F1419] tracking-tight mt-2">
            Payment could not be completed
          </h1>
          <p className="text-xs text-[#737373] mt-1 max-w-xs mx-auto">
            Your payment for {PAYMENT_CONFIG.planName} ({formatCurrency(PAYMENT_CONFIG.amount)}) was not received. No funds were debited.
          </p>
        </div>
      </div>

      {/* Common Reasons Card */}
      <div className="bg-white rounded-lg border border-[#DBDBDB] p-5 shadow-xs space-y-3 text-xs">
        <h4 className="font-bold text-[#0F1419]">Possible Reasons:</h4>
        <ul className="space-y-2 text-[#737373]">
          <li className="flex items-start gap-2">
            <span className="text-rose-500 font-bold">•</span>
            <span>The 2-minute dynamic QR code session timed out.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-rose-500 font-bold">•</span>
            <span>Transaction was cancelled or declined inside your UPI app.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-rose-500 font-bold">•</span>
            <span>Temporary banking server downtime or UPI network latency.</span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5">
        <Link
          to="/payment"
          className="w-full inline-flex items-center justify-center gap-2 bg-[#0095F6] hover:bg-[#0081d6] active:scale-95 text-white font-bold py-3 px-6 rounded-sm shadow-xs transition-all text-sm text-center cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again with New QR</span>
        </Link>

        <Link
          to="/checkout"
          className="w-full inline-flex items-center justify-center gap-2 bg-neutral-100 hover:bg-neutral-200 active:scale-95 text-[#0F1419] font-bold py-2.5 px-6 rounded-sm transition-all text-xs text-center cursor-pointer"
        >
          <span>Choose Another Method / Edit Details</span>
        </Link>

        <Link
          to="/support"
          className="w-full inline-flex items-center justify-center gap-2 text-[#737373] hover:text-[#0095F6] font-semibold py-2 transition-all text-xs text-center cursor-pointer"
        >
          <Headphones className="w-3.5 h-3.5" />
          <span>Contact Support Desk</span>
        </Link>
      </div>
    </div>
  );
};

export default PaymentFailed;
