import { createHmac, timingSafeEqual } from "node:crypto";

export const adminCookieName = "homun_admin_session";
export const adminSessionSeconds = 8 * 60 * 60;

export function getAdminPassword() {
  const value = process.env.HOMUN_ADMIN_PASSWORD;
  return value && value.length >= 24 ? value : null;
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left), b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function passwordMatches(candidate: string) {
  const password = getAdminPassword();
  return !!password && safeEqual(candidate, password);
}

export function createAdminSession() {
  const password = getAdminPassword();
  if (!password) return null;
  const expiresAt = Math.floor(Date.now() / 1000) + adminSessionSeconds;
  const signature = createHmac("sha256", password).update(String(expiresAt)).digest("base64url");
  return `${expiresAt}.${signature}`;
}

export function isAdminSessionValid(token?: string) {
  const password = getAdminPassword();
  if (!password || !token) return false;
  const [expiresText, signature, extra] = token.split(".");
  if (extra !== undefined || !/^\d{10}$/.test(expiresText) || !signature) return false;
  const expiresAt = Number(expiresText);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000) || expiresAt > Math.floor(Date.now() / 1000) + adminSessionSeconds + 60) return false;
  const expected = createHmac("sha256", password).update(expiresText).digest("base64url");
  return safeEqual(signature, expected);
}
