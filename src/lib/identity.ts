'use client';

// Cookie-based identity — pick name once, remembered on device
// No passwords, no auth — private 2-person app

const COOKIE_KEY = 'omo_reviewer_id';
const COOKIE_DAYS = 365;

export function getReviewerId(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_KEY}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setReviewerId(reviewerId: string): void {
  const expires = new Date();
  expires.setDate(expires.getDate() + COOKIE_DAYS);
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(reviewerId)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

export function clearReviewerId(): void {
  document.cookie = `${COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}
