import { PAYMENT_CONFIG } from '../config/payment';

export const PLANS_DATA = [
  {
    id: 'verification-assistance',
    title: 'Verification Assistance',
    badge: 'Most Popular',
    price: PAYMENT_CONFIG.amount,
    currencySymbol: PAYMENT_CONFIG.currencySymbol,
    billingPeriod: PAYMENT_CONFIG.billingPeriod,
    description: 'Complete step-by-step guidance, account audit, and application support for your Instagram profile.',
    features: [
      { text: 'Guided verification application walkthrough', highlight: true },
      { text: 'Profile readiness & bio optimization review', highlight: true },
      { text: 'Category & eligibility assessment', highlight: false },
      { text: 'Application assistance & form review', highlight: true },
      { text: 'Priority customer support (WhatsApp & Email)', highlight: false },
      { text: 'Instant verified badge onboarding', highlight: false },
      { text: 'One account per yearly subscription', highlight: false },
    ],
    ctaText: `Continue for ${PAYMENT_CONFIG.currencySymbol}${PAYMENT_CONFIG.amount}`,
    disclaimer: '',
    whatIncluded: [
      'Personal account readiness check against platform guidelines',
      'Step-by-step guidance for submitting your official application',
      'Recommendations for two-factor authentication and account security',
      'Guidance on public presence and profile accuracy',
      'Direct human support ticket access',
    ],
    whatNotIncluded: [],
  },
];

export default PLANS_DATA;
