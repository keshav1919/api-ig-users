import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export const OrderCard = ({ order }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-sm flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case 'in-review':
        return (
          <span className="text-[11px] font-bold text-[#0095F6] bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-sm flex items-center gap-1">
            <Clock className="w-3 h-3" />
            In Review
          </span>
        );
      case 'action-required':
        return (
          <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-sm flex items-center gap-1">
            Action Required
          </span>
        );
      case 'submitted':
        return (
          <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-sm flex items-center gap-1">
            Submitted to Platform
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-bold text-[#737373] bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-sm flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Review Pending
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#DBDBDB] p-5 shadow-xs transition-all hover:border-[#0095F6]/50 hover:shadow-xs">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <span className="text-[11px] font-mono font-medium text-[#737373]">
            {order.orderId}
          </span>
          <h4 className="font-bold text-base text-[#0F1419] tracking-tight">
            {order.planName}
          </h4>
        </div>
        {getStatusBadge(order.status)}
      </div>

      <div className="flex items-center justify-between text-xs text-[#737373] py-2 border-y border-neutral-100 my-3">
        <div>
          <span>Account: </span>
          <strong className="text-[#0F1419]">@{order.username}</strong>
        </div>
        <div>
          <span>Amount: </span>
          <strong className="text-[#0F1419] font-bold">
            {formatCurrency(order.amount, order.currencySymbol)}
          </strong>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-[#737373]">
          {formatDate(order.date)}
        </span>
        <Link
          to={`/order/${order.orderId}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#0095F6] hover:text-[#0081d6] transition-colors"
        >
          <span>View Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default OrderCard;
