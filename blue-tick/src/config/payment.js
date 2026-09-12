/**
 * PAYMENT CONFIGURATION
 * 
 * Central configuration file for all payment settings.
 * Supports dynamic configuration via Admin Panel and backend sync.
 */

export const STORAGE_KEY = 'app_web_settings';

export const DEFAULT_PAYMENT_CONFIG = {
  // Main Subscription Price in INR
  amount: 30,
  currency: 'INR',
  currencySymbol: '₹',
  billingPeriod: 'year',
  planName: 'Verification Assistance',

  // UPI Receiver Settings (Used for Dynamic QR & Direct UPI App Intent)
  upiId: 'paytm.s1x87m2@pty',
  payeeName: 'Verified Badge',
  transactionNote: 'Verified Badge',

  // QR Session Expiry in seconds (02:00 = 120s)
  qrExpirySeconds: 120,

  // Architecture flags
  isDemoMode: false,
  gatewayEndpoint: '/api/create-order',
  gatewayWebhookUrl: '/api/webhook/payment-verify',

  // Tax and billing calculation
  taxIncluded: true,
  taxRatePercent: 0,

  // Theme & Script Engine
  themeMode: 'verification', // 'verification' | 'portfolio' | 'custom'
  customHtml: '',
};

export const getStoredSettings = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    }
  } catch (err) {
    console.warn('Error reading app_web_settings from localStorage:', err);
  }
  return null;
};

// Initial state merged with any previously saved settings
const initialOverrides = getStoredSettings() || {};

export const PAYMENT_CONFIG = {
  ...DEFAULT_PAYMENT_CONFIG,
  ...initialOverrides,
};

export const updatePaymentConfig = (newSettings) => {
  if (!newSettings || typeof newSettings !== 'object') return;
  Object.assign(PAYMENT_CONFIG, newSettings);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(PAYMENT_CONFIG));
      window.dispatchEvent(new CustomEvent('app_settings_updated', { detail: PAYMENT_CONFIG }));
    }
  } catch (err) {
    console.warn('Error saving app_web_settings to localStorage:', err);
  }
};

export const resetPaymentConfig = () => {
  Object.assign(PAYMENT_CONFIG, DEFAULT_PAYMENT_CONFIG);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('app_settings_updated', { detail: DEFAULT_PAYMENT_CONFIG }));
    }
  } catch (err) {
    console.warn('Error resetting app_web_settings in localStorage:', err);
  }
};

export default PAYMENT_CONFIG;
