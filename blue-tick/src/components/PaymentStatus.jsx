import React from 'react';
import { CheckCircle2, XCircle, Loader2, ArrowRight, RefreshCw } from 'lucide-react';
import { PAYMENT_STATES } from '../services/paymentService';

export const PaymentStatus = ({
  status,
  onViewOrder,
  onTryAgain,
  onChooseAnotherMethod,
}) => {
  if (status === PAYMENT_STATES.WAITING) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 bg-white rounded-lg border border-[#DBDBDB]">
        {/* Animated radar/pulsing circle */}
        <div className="relative flex items-center justify-center w-14 h-14">
          <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-radar" />
          <div className="relative w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0095F6]">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-base text-[#0F1419]">Waiting for payment…</h4>
          <p className="text-xs text-[#737373] max-w-xs">
            Scan the QR code or approve the request in your UPI app. Do not refresh this page.
          </p>
        </div>
      </div>
    );
  }

  if (status === PAYMENT_STATES.PROCESSING) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 bg-white rounded-lg border border-[#DBDBDB]">
        <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-base text-[#0F1419]">Confirming payment…</h4>
          <p className="text-xs text-[#737373] max-w-xs">
            Verifying transaction confirmation with the banking network.
          </p>
        </div>
      </div>
    );
  }

  if (status === PAYMENT_STATES.SUCCESS) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 bg-white rounded-lg border-2 border-emerald-500/40 shadow-xs">
        {/* Animated checkmark */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 animate-check-pop">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>
        <div className="space-y-1">
          <h4 className="font-extrabold text-xl text-[#0F1419]">Payment Successful</h4>
          <p className="text-xs text-[#737373] max-w-xs">
            Your verification assistance request has been created. Our team has received your details.
          </p>
        </div>
        <button
          onClick={onViewOrder}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#0095F6] hover:bg-[#0081d6] active:scale-95 text-white font-bold py-2.5 px-6 rounded-sm shadow-xs transition-all text-sm cursor-pointer"
        >
          <span>View Order</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (status === PAYMENT_STATES.FAILED) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 bg-white rounded-lg border-2 border-rose-500/40 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-rose-50 border-2 border-rose-500 flex items-center justify-center text-rose-600">
          <XCircle className="w-10 h-10 stroke-[2.5]" />
        </div>
        <div className="space-y-1">
          <h4 className="font-extrabold text-xl text-[#0F1419]">Payment could not be completed</h4>
          <p className="text-xs text-[#737373] max-w-xs">
            The transaction was declined by your UPI app or timed out. No amount was debited.
          </p>
        </div>
        <div className="w-full space-y-2 pt-2">
          <button
            onClick={onTryAgain}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#0095F6] hover:bg-[#0081d6] active:scale-95 text-white font-bold py-2.5 px-6 rounded-sm shadow-xs transition-all text-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <button
            onClick={onChooseAnotherMethod}
            className="w-full bg-neutral-100 hover:bg-neutral-200 active:scale-95 text-[#0F1419] font-semibold py-2 px-6 rounded-sm transition-all text-xs cursor-pointer"
          >
            Choose Another Method
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default PaymentStatus;
