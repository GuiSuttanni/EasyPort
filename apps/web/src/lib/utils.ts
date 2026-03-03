import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function formatWhatsAppUrl(whatsapp: string, message?: string): string {
  const cleaned = whatsapp.replace(/\D/g, '');
  const number = cleaned.startsWith('55') ? cleaned : `55${cleaned}`;
  const msg = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${number}${msg ? `?text=${msg}` : ''}`;
}

export function formatInstagramUrl(handle: string): string {
  const cleaned = handle.replace('@', '');
  return `https://instagram.com/${cleaned}`;
}

export function formatFacebookUrl(handle: string): string {
  if (handle.startsWith('http')) return handle;
  return `https://facebook.com/${handle}`;
}

export function getPublicCatalogUrl(slug: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${base}/c/${slug}`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}
