import 'dotenv/config';

export const config = {
  port: process.env.PORT || 3000,
  corsOrigins: process.env.CORS_ORIGINS || '*',
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY,
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
  },
  mail: {
    brevoApiKey: process.env.BREVO_API_KEY,
    from: process.env.MAIL_FROM,
    fromName: process.env.MAIL_FROM_NAME || 'Mi app',
  },
  otp: {
    expiryMinutes: 10,
    length: 6,
  },
};
