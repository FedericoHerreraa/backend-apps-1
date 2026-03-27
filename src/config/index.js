import 'dotenv/config';

export const config = {
  port: process.env.PORT || 3000,
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY,
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
  },
  otp: {
    expiryMinutes: 10,
    length: 6,
  },
};
