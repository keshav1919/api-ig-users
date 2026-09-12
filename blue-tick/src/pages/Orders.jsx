import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, PlusCircle, Search } from 'lucide-react';
import orderService from '../services/orderService';
import OrderCard from '../components/OrderCard';
import { Disclaimer } from '../components/Disclaimer';
import { PAYMENT_CONFIG } from '../config/payment';

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const list = orderService.getOrders();
    setOrders(list);
  }, []);

  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase();
    return (
      order.orderId.toLowerCase().includes(q) ||
      order.username.toLowerCase().includes(q) ||
      order.planName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full max-w-[420px] mx-auto px-3.5 py-4 space-y-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#0F1419] tracking-tight">
            My Orders & Requests
          </h1>
          <p className="text-xs text-[#737373]">
            Track the status of your verification assistance requests.
          </p>
        </div>
        <Link
          to="/plans"
          className="inline-flex items-center gap-1.5 bg-[#0095F6] hover:bg-[#0081d6] active:scale-95 text-white text-xs font-bold px-3 py-2 rounded-sm shadow-xs transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Request</span>
        </Link>
      </div>

      {/* Search Input */}
      {orders.length > 0 && (
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-[#737373] pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID or @username..."
            className="w-full pl-10 pr-4 py-2.5 rounded-sm border border-[#DBDBDB] bg-white text-xs font-medium focus:border-[#0095F6] focus:ring-1 focus:ring-blue-100 outline-none transition-all"
          />
        </div>
      )}

      {/* Order List */}
      <div className="space-y-3.5">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard key={order.orderId} order={order} />
          ))
        ) : (
          <div className="bg-white rounded-lg border border-[#DBDBDB] p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-[#737373]">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-[#0F1419]">No Orders Found</h3>
            <p className="text-xs text-[#737373] max-w-xs mx-auto">
              You haven't initiated any verification requests yet. Get started with our guided onboarding for {PAYMENT_CONFIG.currencySymbol}{PAYMENT_CONFIG.amount}/month.
            </p>
            <Link
              to="/plans"
              className="inline-block bg-[#0095F6] text-white text-xs font-bold px-5 py-2.5 rounded-sm shadow-xs hover:bg-[#0081d6] transition-all"
            >
              Start Verification Assistance
            </Link>
          </div>
        )}
      </div>

      <Disclaimer variant="subtle" />
    </div>
  );
};

export default Orders;
