import { BrevoClient } from '@getbrevo/brevo';
import { config } from '../config/index.js';

let brevoClient = null;

function getBrevoClient() {
  const { brevoApiKey } = config.mail;
  if (!brevoApiKey) {
    return null;
  }
  if (!brevoClient) {
    brevoClient = new BrevoClient({ apiKey: brevoApiKey });
  }
  return brevoClient;
}

function resolveSender() {
  const { from, fromName } = config.mail;
  if (from && from.includes('<') && from.includes('>')) {
    const email = from.substring(from.indexOf('<') + 1, from.indexOf('>')).trim();
    const name = from.substring(0, from.indexOf('<')).replaceAll('"', '').trim();
    return {
      email,
      name: name || fromName,
    };
  }
  if (from && from.includes('@')) {
    return {
      email: from.trim(),
      name: fromName,
    };
  }
  return null;
}

async function sendMail(to, subject, html) {
  const brevo = getBrevoClient();
  const sender = resolveSender();
  if (!brevo || !sender) {
    return false;
  }
  await brevo.transactionalEmails.sendTransacEmail({
    sender,
    to: [{ email: to }],
    subject,
    htmlContent: html,
    textContent: 'Este correo contiene contenido HTML.',
  });
  return true;
}

export async function sendOtpEmail(to, otpCode) {
  if (!getBrevoClient() || !resolveSender()) {
    console.warn(
      'Brevo no configurado (BREVO_API_KEY / MAIL_FROM). OTP solo en consola:',
      otpCode,
    );
    return { success: true, simulated: true };
  }

  const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">C?digo de verificaci?n</h2>
        <p>Tu c?digo para iniciar sesi?n es:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">
          ${otpCode}
        </p>
        <p style="color: #666;">Este c?digo expira en 10 minutos.</p>
        <p style="color: #999; font-size: 12px;">Si no solicitaste este c?digo, ignora este email.</p>
      </div>
    `;

  try {
    await sendMail(to, 'Tu c?digo de verificaci?n', html);
    return { success: true };
  } catch (err) {
    console.error('Error enviando OTP con Brevo:', err);
    throw new Error(err?.message || 'Error al enviar el email');
  }
}

export async function sendWelcomeEmail(to, name) {
  if (!getBrevoClient() || !resolveSender()) {
    console.warn('Brevo no configurado. Email de bienvenida no enviado.');
    return { success: true, simulated: true };
  }

  const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">?Bienvenido${name ? `, ${name}` : ''}!</h2>
        <p>Tu cuenta ha sido creada correctamente.</p>
        <p>Ya pod?s iniciar sesi?n solicitando un c?digo OTP a tu email.</p>
      </div>
    `;

  try {
    await sendMail(to, '?Bienvenido!', html);
    return { success: true };
  } catch (err) {
    console.error('Error al enviar email de bienvenida:', err);
    return { success: false };
  }
}
