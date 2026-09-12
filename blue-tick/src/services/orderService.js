/**
 * ORDER SERVICE
 * 
 * Manages customer order creation, persistence, and status tracking.
 * Uses localStorage in demo mode, structured to allow a REST / GraphQL backend
 * replacement without UI rewrites.
 */

import { generateOrderId } from '../utils/formatters';
import { PAYMENT_CONFIG } from '../config/payment';

const STORAGE_KEY_ORDERS = 'verifyassist_customer_orders';

export const ORDER_TIMELINE_STAGES = [
  {
    id: 'payment_received',
    title: 'Payment Received',
    description: 'Payment verified and service ticket created.',
  },
  {
    id: 'profile_review',
    title: 'Profile Review',
    description: 'Advisory team conducting initial Instagram readiness audit.',
  },
  {
    id: 'application_assistance',
    title: 'Application Assistance',
    description: 'Personalized guidance notes and checklist prepared.',
  },
  {
    id: 'submitted',
    title: 'Submitted to Platform',
    description: 'Application submitted directly via Instagram Account Center.',
  },
  {
    id: 'completed',
    title: 'Completed',
    description: 'Platform review evaluated and case closed.',
  },
];

const INITIAL_DEMO_ORDERS = [
  {
    orderId: 'VA-928415',
    planName: PAYMENT_CONFIG.planName,
    amount: PAYMENT_CONFIG.amount,
    currencySymbol: PAYMENT_CONFIG.currencySymbol,
    paymentMethod: 'UPI (PhonePe)',
    username: 'alex_visuals',
    email: 'alex@example.com',
    phone: '+91 98765 12345',
    date: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    status: 'in-review',
    statusLabel: 'Profile In Review',
    currentStageIndex: 1, // Profile Review
    notes: 'Audit underway. Account has strong public posts and consistent bio formatting.',
    checklist: [
      { item: 'Public Account Verification', completed: true },
      { item: 'High-Resolution Profile Picture', completed: true },
      { item: 'Consistent Bio & Categorization', completed: true },
      { item: 'Two-Factor Authentication Setup', completed: false },
      { item: 'Official Government ID Ready', completed: false },
    ],
  },
];

export const orderService = {
  getOrders() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(INITIAL_DEMO_ORDERS));
        return INITIAL_DEMO_ORDERS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_DEMO_ORDERS;
    }
  },

  getOrderById(orderId) {
    const orders = this.getOrders();
    return orders.find((o) => o.orderId.toLowerCase() === orderId.toLowerCase()) || null;
  },

  createOrder({ username, email, phone, paymentSessionId, paymentMethod = 'UPI' }) {
    const orders = this.getOrders();
    const newOrder = {
      orderId: generateOrderId(),
      planName: PAYMENT_CONFIG.planName,
      amount: PAYMENT_CONFIG.amount,
      currencySymbol: PAYMENT_CONFIG.currencySymbol,
      paymentMethod,
      paymentSessionId,
      username,
      email,
      phone,
      date: new Date().toISOString(),
      status: 'pending',
      statusLabel: 'Application Review Pending',
      currentStageIndex: 0, // Payment Received
      notes: 'Payment confirmed. Our review team will begin your profile audit within 24 hours.',
      checklist: [
        { item: 'Public Account Check', completed: true },
        { item: 'Profile Photo & Bio Standards', completed: false },
        { item: 'Category & Niche Alignment', completed: false },
        { item: 'Security & 2FA Setup', completed: false },
        { item: 'Verification Request Preparation', completed: false },
      ],
    };

    const updated = [newOrder, ...orders];
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updated));
    return newOrder;
  },

  updateOrderStatus(orderId, nextStageIndex, newStatus, newStatusLabel, notes) {
    const orders = this.getOrders();
    const updated = orders.map((o) => {
      if (o.orderId === orderId) {
        return {
          ...o,
          currentStageIndex: nextStageIndex,
          status: newStatus || o.status,
          statusLabel: newStatusLabel || o.statusLabel,
          notes: notes || o.notes,
        };
      }
      return o;
    });
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updated));
    return updated.find((o) => o.orderId === orderId);
  },
};

export default orderService;
