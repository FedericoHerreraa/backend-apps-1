import 'dotenv/config';

export const config = {
  port: process.env.PORT || 3000,
  corsOrigins: process.env.CORS_ORIGINS || '*',
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY,
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
  },
  mail: {
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: parseInt(process.env.SMTP_PORT || '587', 10) || 587,
    smtpSecure: process.env.SMTP_SECURE === 'true',
    smtpForceIpv4: process.env.SMTP_FORCE_IPV4 !== 'false',
    smtpConnectionTimeoutMs: parseInt(process.env.SMTP_CONNECTION_TIMEOUT_MS || '10000', 10) || 10000,
    smtpGreetingTimeoutMs: parseInt(process.env.SMTP_GREETING_TIMEOUT_MS || '10000', 10) || 10000,
    smtpSocketTimeoutMs: parseInt(process.env.SMTP_SOCKET_TIMEOUT_MS || '15000', 10) || 15000,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM,
    fromName: process.env.MAIL_FROM_NAME || 'Mi app',
  },
  otp: {
    expiryMinutes: 10,
    length: 6,
  },
};
