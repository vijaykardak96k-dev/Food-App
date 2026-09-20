// Small input validation helpers (kept simple on purpose).
import { AppError } from './AppError.js';

export const isEmail = (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const isPhone = (v) => typeof v === 'string' && /^\d{10}$/.test(v.replace(/[\s-]/g, ''));
export const cleanPhone = (v) => String(v).replace(/[\s-]/g, '');

export function text(value, label, { min = 1, max = 255, required = true } = {}) {
  const v = typeof value === 'string' ? value.trim() : '';
  if (!v) {
    if (required) throw new AppError(`${label} is required`, 400);
    return '';
  }
  if (v.length < min) throw new AppError(`${label} must be at least ${min} characters`, 400);
  if (v.length > max) throw new AppError(`${label} must be at most ${max} characters`, 400);
  return v;
}

export function positiveInt(value, label) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) throw new AppError(`${label} is invalid`, 400);
  return n;
}

export function price(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0 || n > 100000) throw new AppError('Price must be a number greater than 0', 400);
  return Math.round(n * 100) / 100;
}

export const toBool = (v) => v === true || v === 1 || v === '1' || v === 'true';
