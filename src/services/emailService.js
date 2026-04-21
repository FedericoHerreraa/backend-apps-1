import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

let transporter = null;

function getTransporter() {
  const { smtpUser, smtpPass } = config.mail;
  if (!smtpUser || !smtpPass) {
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.mail.smtpHost,
      port: config.mail.smtpPort,
      secure: config.mail.smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }
  return transporter;
}

function resolveFrom() {
  if (config.mail.from) {
    return config.mail.from;
  }
  return `"${config.mail.fromName}" <${config.mail.smtpUser}>`;
}

async function sendMail(to, subject, html) {
  const transport = getTransporter();
  if (!transport) {
    return false;
  }
  await transport.sendMail({
    from: resolveFrom(),
    to,
    subject,
    html,
  });
  return true;
}

export async function sendOtpEmail(to, otpCode) {
  const transport = getTransporter();
  if (!transport) {
    console.warn(
      'SMTP no configurado (SMTP_USER / SMTP_PASS). OTP solo en consola:',
      otpCode,
    );
    return { success: true, simulated: true };
  }

  const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Código de verificación</h2>
        <p>Tu código para iniciar sesión es:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">
          ${otpCode}
        </p>
        <p style="color: #666;">Este código expira en 10 minutos.</p>
        <p style="color: #999; font-size: 12px;">Si no solicitaste este código, ignora este email.</p>
      </div>
    `;

  try {
    await sendMail(to, 'Tu código de verificación', html);
    return { success: true };
  } catch (err) {
    console.error('Error enviando OTP por SMTP:', err);
    throw new Error(err?.message || 'Error al enviar el email');
  }
}

export async function sendWelcomeEmail(to, name) {
  if (!getTransporter()) {
    console.warn('SMTP no configurado. Email de bienvenida no enviado.');
    return { success: true, simulated: true };
  }

  const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">¡Bienvenido${name ? `, ${name}` : ''}!</h2>
        <p>Tu cuenta ha sido creada correctamente.</p>
        <p>Ya podés iniciar sesión solicitando un código OTP a tu email.</p>
      </div>
    `;

  try {
    await sendMail(to, '¡Bienvenido!', html);
    return { success: true };
  } catch (err) {
    console.error('Error al enviar email de bienvenida:', err);
    return { success: false };
  }
}
