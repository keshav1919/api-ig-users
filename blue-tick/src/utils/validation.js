/**
 * Form Validation Utilities
 */

export const sanitizeUsername = (raw) => {
  if (!raw) return '';
  // Remove leading '@' and whitespace
  return raw.trim().replace(/^@+/, '').toLowerCase();
};

export const validateUsername = (raw) => {
  const clean = sanitizeUsername(raw);
  if (!clean) {
    return { isValid: false, error: 'Instagram username is required.' };
  }
  if (clean.length < 2) {
    return { isValid: false, error: 'Username must be at least 2 characters.' };
  }
  if (clean.length > 30) {
    return { isValid: false, error: 'Username cannot exceed 30 characters.' };
  }
  // Instagram handles can only contain letters, numbers, periods, and underscores
  const igRegex = /^[a-zA-Z0-9._]+$/;
  if (!igRegex.test(clean)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, periods, and underscores.' };
  }
  if (clean.startsWith('.') || clean.endsWith('.')) {
    return { isValid: false, error: 'Username cannot start or end with a period.' };
  }
  if (clean.includes('..')) {
    return { isValid: false, error: 'Username cannot contain consecutive periods.' };
  }
  return { isValid: true, error: '' };
};

export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email address is required.' };
  }
  const clean = email.trim().toLowerCase();
  // Standard email validation regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(clean)) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }
  return { isValid: true, error: '' };
};

export const sanitizePhone = (raw) => {
  if (!raw) return '';
  // Remove spaces, hyphens, parentheses, and leading +91 or 91 if present
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits;
};

export const validatePhone = (raw) => {
  if (!raw || !raw.trim()) {
    return { isValid: false, error: 'Phone number is required.' };
  }
  const digits = sanitizePhone(raw);
  if (digits.length !== 10) {
    return { isValid: false, error: 'Please enter a valid 10-digit mobile number.' };
  }
  // Indian mobile numbers typically begin with 6, 7, 8, or 9
  if (!/^[6-9]\d{9}$/.test(digits)) {
    return { isValid: false, error: 'Please enter a valid Indian mobile number starting with 6, 7, 8, or 9.' };
  }
  return { isValid: true, error: '' };
};
