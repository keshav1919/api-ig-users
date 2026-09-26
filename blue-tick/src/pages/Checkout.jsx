import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Lock,
  AlertCircle,
  AtSign,
  Mail,
  Phone,
  ArrowRight,
} from 'lucide-react';
import { PAYMENT_CONFIG } from '../config/payment';
import { sanitizeUsername, validateUsername, validateEmail, validatePhone } from '../utils/validation';
import { formatCurrency } from '../utils/formatters';
import paymentService from '../services/paymentService';
import { useUser } from '../context/UserContext';

export const Checkout = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser();

  // Form State
  const [username, setUsername] = useState(currentUser?.username || '');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);

  // Interaction / Touch states for modern valid-after-touch pattern
  const [touched, setTouched] = useState({
    username: Boolean(currentUser?.username),
    email: false,
    phone: false,
  });

  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Validation evaluations
  const usernameVal = validateUsername(username);
  const emailVal = validateEmail(email);
  const phoneVal = validatePhone(phone);

  const isFormValid =
    usernameVal.isValid &&
    emailVal.isValid &&
    phoneVal.isValid &&
    agreed;

  const handleUsernameChange = (e) => {
    // Automatically sanitize away leading '@'
    const raw = e.target.value;
    const clean = raw.startsWith('@') ? raw.slice(1) : raw;
    setUsername(clean);
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ username: true, email: true, phone: true });

    if (!isFormValid) return;

    setLoading(true);
    setGeneralError('');

    try {
      const customerData = {
        username: sanitizeUsername(username),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
      };

      // Create payment session via abstracted payment service
      const res = await paymentService.createPayment({ customerData });
      if (res && res.session) {
        navigate(`/payment?session=${res.session.sessionId}`);
      } else {
        navigate('/payment');
      }
    } catch (err) {
      console.error('Checkout creation error:', err);
      navigate('/payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto px-3.5 py-4 space-y-4 select-none">
      {/* Top Header with Back Button */}
      <div className="flex items-center justify-between border-b border-[#DBDBDB]/80 pb-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm font-semibold text-[#0F1419] hover:text-[#0095F6] transition-colors p-1 rounded-sm"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <h1 className="font-extrabold text-base text-[#0F1419] tracking-tight">
          Checkout
        </h1>
        <div className="w-12 text-right">
          <span className="text-[11px] font-bold text-neutral-400">Step 1/2</span>
        </div>
      </div>

      {generalError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Order Summary Card */}
      <div className="bg-white rounded-lg border border-[#DBDBDB] p-5 shadow-xs space-y-4">
        {/* Detected Instagram Profile Box */}
        {currentUser && (
          <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            <div className="w-12 h-12 rounded-full p-[2px] ig-story-gradient shrink-0">
              <div className="w-full h-full rounded-full bg-white p-[1.5px]">
                {currentUser.avatarUrl || currentUser.profilePic ? (
                  <img
                    src={currentUser.avatarUrl || currentUser.profilePic}
                    alt={currentUser.username}
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#262626] text-white flex items-center justify-center text-sm font-bold">
                    {currentUser.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 font-bold text-sm text-[#0F1419]">
                <span className="truncate">@{currentUser.username}</span>
              </div>
              <div className="text-[11px] text-[#737373] truncate">
                {currentUser.fullName || currentUser.username} • {currentUser.isPrivate ? 'Private Account' : `${currentUser.followers} followers`}
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Profile Photo Live Detected</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#0095F6] bg-blue-50 px-2 py-0.5 rounded-sm">
              Selected Subscription
            </span>
            <h3 className="font-black text-lg text-[#0F1419] mt-1">
              {PAYMENT_CONFIG.planName}
            </h3>
            <p className="text-xs text-[#737373]">
              Annual guided verification assistance & profile readiness review.
            </p>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="pt-3 border-t border-neutral-100 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[#737373]">
            <span>Subscription Fee</span>
            <span className="text-[#0F1419] font-medium">
              {formatCurrency(PAYMENT_CONFIG.amount)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[#737373]">
            <span>Taxes & GST</span>
            <span className="text-emerald-600 font-medium">
              Included
            </span>
          </div>
          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-sm font-extrabold text-[#0F1419]">
            <span>Total Payable</span>
            <span className="text-lg text-[#0095F6]">
              {formatCurrency(PAYMENT_CONFIG.amount)}
            </span>
          </div>
        </div>
      </div>

      {/* Account Information Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-[#DBDBDB] p-5 sm:p-6 shadow-xs space-y-5">
        <div>
          <h3 className="font-bold text-base text-[#0F1419] tracking-tight">
            Account Information
          </h3>
          <p className="text-xs text-[#737373] mt-0.5">
            Provide your contact details so our advisory team can reach you.
          </p>
        </div>

        {/* Instagram Username Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#0F1419]">
            Instagram Username
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-[#737373] pointer-events-none">
              <AtSign className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              onBlur={() => handleBlur('username')}
              placeholder="enter username"
              autoCapitalize="none"
              autoCorrect="off"
              className={`w-full pl-10 pr-4 py-2.5 rounded-sm border text-sm font-medium transition-all outline-none ${
                touched.username && !usernameVal.isValid
                  ? 'border-rose-400 bg-rose-50/30 text-[#0F1419] focus:ring-1 focus:ring-rose-300'
                  : 'border-[#DBDBDB] bg-neutral-50/50 text-[#0F1419] focus:border-[#0095F6] focus:bg-white focus:ring-1 focus:ring-blue-100'
              }`}
            />
          </div>
          {touched.username && !usernameVal.isValid ? (
            <p className="text-[11px] text-rose-500 font-medium pl-1">
              {usernameVal.error}
            </p>
          ) : (
            <p className="text-[11px] text-[#737373] pl-1">
              Enter your public handle without the @ symbol.
            </p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#0F1419]">
            Contact Email Address
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-[#737373] pointer-events-none">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="name@example.com"
              className={`w-full pl-10 pr-4 py-2.5 rounded-sm border text-sm font-medium transition-all outline-none ${
                touched.email && !emailVal.isValid
                  ? 'border-rose-400 bg-rose-50/30 text-[#0F1419] focus:ring-1 focus:ring-rose-300'
                  : 'border-[#DBDBDB] bg-neutral-50/50 text-[#0F1419] focus:border-[#0095F6] focus:bg-white focus:ring-1 focus:ring-blue-100'
              }`}
            />
          </div>
          {touched.email && !emailVal.isValid ? (
            <p className="text-[11px] text-rose-500 font-medium pl-1">
              {emailVal.error}
            </p>
          ) : (
            <p className="text-[11px] text-[#737373] pl-1">
              We send your verification audit report to this email.
            </p>
          )}
        </div>

        {/* Phone Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#0F1419]">
            Phone Number (India +91)
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center gap-1 text-[#737373] pointer-events-none text-xs font-bold">
              <Phone className="w-3.5 h-3.5" />
              <span>+91</span>
            </div>
            <input
              type="tel"
              inputMode="tel"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => handleBlur('phone')}
              placeholder="9876543210"
              className={`w-full pl-16 pr-4 py-2.5 rounded-sm border text-sm font-medium transition-all outline-none ${
                touched.phone && !phoneVal.isValid
                  ? 'border-rose-400 bg-rose-50/30 text-[#0F1419] focus:ring-1 focus:ring-rose-300'
                  : 'border-[#DBDBDB] bg-neutral-50/50 text-[#0F1419] focus:border-[#0095F6] focus:bg-white focus:ring-1 focus:ring-blue-100'
              }`}
            />
          </div>
          {touched.phone && !phoneVal.isValid ? (
            <p className="text-[11px] text-rose-500 font-medium pl-1">
              {phoneVal.error}
            </p>
          ) : (
            <p className="text-[11px] text-[#737373] pl-1">
              For instant WhatsApp updates and assistance tickets.
            </p>
          )}
        </div>

        {/* Strict Security Reminder */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-sm p-3 flex items-start gap-2.5 text-[11px] text-[#737373]">
          <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            <strong>Zero Password Policy:</strong> We never request your Instagram password, OTP, 2FA code, or recovery codes. Your account credentials remain solely in your control.
          </p>
        </div>

        {/* Agreement Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 mt-1 rounded-sm border-neutral-300 text-[#0095F6] focus:ring-[#0095F6] cursor-pointer"
            />
            <span className="text-xs text-[#0F1419] leading-relaxed">
              I agree to the Terms of Service and proceed with my verification assistance.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || loading}
          className={`w-full inline-flex items-center justify-center gap-2 font-bold py-3 px-6 rounded-sm shadow-xs transition-all text-sm ${
            isFormValid && !loading
              ? 'bg-[#0095F6] hover:bg-[#0081d6] active:scale-[0.98] text-white shadow-blue-500/25 cursor-pointer'
              : 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
          }`}
        >
          {loading ? (
            <span>Initializing Payment…</span>
          ) : (
            <>
              <span>Proceed to Payment ({formatCurrency(PAYMENT_CONFIG.amount)})</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Checkout;
