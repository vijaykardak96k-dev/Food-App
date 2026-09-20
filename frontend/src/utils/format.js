export function formatPrice(value) {
  const n = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatDateTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// "12 min ago", "3 days ago"
export function timeAgo(value) {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

export const PAYMENT_LABELS = { COD: 'Cash on delivery', MOCK_ONLINE: 'Online payment (demo)' };

// Short text like "2 x Chicken Biryani, 1 x Raita"
export function itemSummary(items = [], max = 2) {
  const shown = items.slice(0, max).map((i) => `${i.quantity} x ${i.food_name}`);
  const rest = items.length - max;
  return rest > 0 ? `${shown.join(', ')} +${rest} more` : shown.join(', ');
}
