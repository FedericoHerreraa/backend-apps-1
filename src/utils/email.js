const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const t = email.trim();
  return t.length > 3 && EMAIL_RE.test(t);
}
