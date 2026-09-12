/**
 * PAYMENT SERVICE ABSTRACTION
 * 
 * This service provides a unified interface for payment initiation, status polling,
 * and verification. In development/demo mode, it manages simulated session tokens in
 * localStorage.
 * 
 * IN PRODUCTION:
 * - Replace the simulated endpoints with actual API calls to your backend server
 *   (e.g., POST /api/v1/payments/initiate, GET /api/v1/payments/:id/status).
 * - NEVER perform server-side signature verification or store gateway secret keys here.
 * - All financial verifications must occur on your backend via signed webhooks.
 */

import { PAYMENT_CONFIG } from '../config/payment';

export const PAYMENT_STATES = {
  WAITING: 'WAITING',
  PROCESSING: 'PROCESSING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
};

const STORAGE_KEY_CURRENT_SESSION = 'verifyassist_payment_session';

export const paymentService = {
  /**
   * Generates a standard National Payments Corporation of India (NPCI) UPI Intent URI
   */
  generateUpiUri: ({
    upiId = PAYMENT_CONFIG.upiId,
    payeeName = PAYMENT_CONFIG.payeeName,
    amount = PAYMENT_CONFIG.amount,
    transactionNote = PAYMENT_CONFIG.transactionNote,
    transactionRef = '',
  } = {}) => {
    const params = new URLSearchParams({
      pa: upiId,
      pn: payeeName,
      am: String(amount),
      cu: PAYMENT_CONFIG.currency,
      tn: transactionNote,
    });
    if (transactionRef) {
      params.append('tr', transactionRef);
    }
    return `upi://pay?${params.toString()}`;
  },

  /**
   * Initiates a new payment session
   */
  async createPayment({ customerData, planId = 'verification-assistance' }) {
    const timestamp = Date.now();
    const sessionId = `PAY-${timestamp.toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
    const transactionRef = `TRX${timestamp}`;

    const upiUri = this.generateUpiUri({
      amount: PAYMENT_CONFIG.amount,
      transactionRef,
      transactionNote: `${PAYMENT_CONFIG.transactionNote} (${customerData.username})`,
    });

    const session = {
      sessionId,
      transactionRef,
      planId,
      amount: PAYMENT_CONFIG.amount,
      currency: PAYMENT_CONFIG.currency,
      customerData: {
        username: customerData.username,
        email: customerData.email,
        phone: customerData.phone,
      },
      upiUri,
      status: PAYMENT_STATES.WAITING,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(timestamp + PAYMENT_CONFIG.qrExpirySeconds * 1000).toISOString(),
    };

    localStorage.setItem(STORAGE_KEY_CURRENT_SESSION, JSON.stringify(session));
    return { success: true, session };
  },

  /**
   * Fetches current payment status
   */
  async getPaymentStatus(sessionId) {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_SESSION);
    if (!raw) return { status: PAYMENT_STATES.EXPIRED };
    const session = JSON.parse(raw);
    if (session.sessionId !== sessionId) return { status: PAYMENT_STATES.EXPIRED };

    // Check client-side expiry
    if (new Date() > new Date(session.expiresAt) && session.status === PAYMENT_STATES.WAITING) {
      session.status = PAYMENT_STATES.EXPIRED;
      localStorage.setItem(STORAGE_KEY_CURRENT_SESSION, JSON.stringify(session));
    }
    return { status: session.status, session };
  },

  /**
   * Updates payment status (Used in demo mode to simulate webhook / gateway callback)
   */
  async updateStatusInDemo(newStatus) {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_SESSION);
    if (!raw) return null;
    const session = JSON.parse(raw);
    session.status = newStatus;
    localStorage.setItem(STORAGE_KEY_CURRENT_SESSION, JSON.stringify(session));
    return session;
  },

  /**
   * Confirms/verifies payment on server
   */
  async verifyPayment(sessionId) {
    if (PAYMENT_CONFIG.isDemoMode) {
      const { session } = await this.getPaymentStatus(sessionId);
      if (session && session.status === PAYMENT_STATES.SUCCESS) {
        return { verified: true, session };
      }
      return { verified: false, error: 'Payment not yet verified by bank gateway.' };
    }

    // Production: Backend calls gateway verification endpoint
    const response = await fetch(`/api/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    return response.json();
  },

  /**
   * Cancels payment session
   */
  async cancelPayment(sessionId) {
    if (PAYMENT_CONFIG.isDemoMode) {
      const raw = localStorage.getItem(STORAGE_KEY_CURRENT_SESSION);
      if (raw) {
        const session = JSON.parse(raw);
        session.status = PAYMENT_STATES.FAILED;
        localStorage.setItem(STORAGE_KEY_CURRENT_SESSION, JSON.stringify(session));
      }
      return { success: true };
    }
    return { success: true };
  },

  /**
   * Cleans current session
   */
  clearCurrentSession() {
    localStorage.removeItem(STORAGE_KEY_CURRENT_SESSION);
  },
};

export default paymentService;
