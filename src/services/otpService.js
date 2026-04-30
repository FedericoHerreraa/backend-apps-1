import { config } from '../config/index.js';

const otpStore = new Map();

function generateOtp() {
  const length = config.otp.length;
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

export function createOtp(email) {
  const key = email.toLowerCase().trim();
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + config.otp.expiryMinutes * 60 * 1000);

  otpStore.set(key, {
    otp,
    expiresAt,
    attempts: 0,
  });

  return { otp, expiresAt };
}


export function verifyOtp(email, code) {
  const key = email.toLowerCase().trim();
  const normalizedCode = String(code ?? '').trim();
  const stored = otpStore.get(key);

  if (!stored) {
    return { valid: false, error: 'OTP no encontrado o expirado' };
  }

  if (new Date() > stored.expiresAt) {
    otpStore.delete(key);
    return { valid: false, error: 'OTP expirado' };
  }

  if (stored.attempts >= 5) {
    otpStore.delete(key);
    return { valid: false, error: 'Demasiados intentos fallidos' };
  }

  if (stored.otp !== normalizedCode) {
    stored.attempts += 1;
    return { valid: false, error: 'Código incorrecto' };
  }

  otpStore.delete(key);
  return { valid: true };
}

export function hasValidOtp(email) {
  const key = email.toLowerCase().trim();
  const stored = otpStore.get(key);

  if (!stored) {
    return false;
  }

  if (new Date() > stored.expiresAt) {
    otpStore.delete(key);
    return false;
  }

  return true;
}
