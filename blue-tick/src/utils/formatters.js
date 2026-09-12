export const formatCurrency = (amount, symbol = '₹') => {
  return `${symbol}${Number(amount).toLocaleString('en-IN')}`;
};

export const generateOrderId = () => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomStr = '';
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `VA-${randomStr}`;
};

export const formatDate = (dateInput = new Date()) => {
  const d = new Date(dateInput);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
