import sgMail from '@sendgrid/mail';
import { config } from '../config/index.js';

function getSendGridClient() {
  if (!config.mail.sendgridApiKey) {
    return null;
  }
  sgMail.setApiKey(config.mail.sendgridApiKey);
  return sgMail;
}

function getFromEmail() {
  if (config.mail.from) {
    return config.mail.from;
  }
  return config.mail.sendgridFromEmail || 'noreply@xplorenow.app';
}

async function sendMail(to, subject, html) {
  const client = getSendGridClient();
  if (!client) {
    return false;
  }

  try {
    await client.send({
      to,
      from: getFromEmail(),
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Error enviando email con SendGrid:', error);
    throw error;
  }
}

export async function sendOtpEmail(to, otpCode) {
  const client = getSendGridClient();
  if (!client) {
    console.warn(
      '⚠️  SendGrid no configurado. OTP en consola:',
      otpCode,
      '\n📝 Configura SENDGRID_API_KEY en .env para enviar por email real'
    );
    return { success: true, simulated: true };
  }

  const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Código de verificación</h2>
        <p>Tu código para iniciar sesión en XploreNow es:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">
          ${otpCode}
        </p>
        <p style="color: #666;">Este código expira en 10 minutos.</p>
        <p style="color: #999; font-size: 12px;">Si no solicitaste este código, ignora este email.</p>
      </div>
    `;

  try {
    await sendMail(to, 'Tu código de verificación - XploreNow', html);
    return { success: true };
  } catch (err) {
    console.error('❌ Error enviando OTP:', err?.message || err);
    throw new Error(err?.message || 'Error al enviar el email');
  }
}

export async function sendWelcomeEmail(to, name) {
  if (!getSendGridClient()) {
    console.warn('⚠️  SendGrid no configurado. Email de bienvenida no enviado.');
    return { success: true, simulated: true };
  }

  const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">¡Bienvenido${name ? `, ${name}` : ''}!</h2>
        <p>Tu cuenta en XploreNow ha sido creada correctamente.</p>
        <p>Ya podés iniciar sesión solicitando un código OTP a tu email.</p>
      </div>
    `;

  try {
    await sendMail(to, '¡Bienvenido a XploreNow!', html);
    return { success: true };
  } catch (err) {
    console.error('❌ Error al enviar email de bienvenida:', err);
    return { success: false };
  }
}
