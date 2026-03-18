import { Resend } from 'resend';
import { config } from '../config/index.js';

const resend = config.resend.apiKey ? new Resend(config.resend.apiKey) : null;


export async function sendOtpEmail(to, otpCode) {
  if (!resend) {
    console.warn('RESEND_API_KEY no configurada. OTP simulado:', otpCode);
    return { success: true, simulated: true };
  }

  const { data, error } = await resend.emails.send({
    from: config.resend.fromEmail,
    to: [to],
    subject: 'Tu código de verificación',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Código de verificación</h2>
        <p>Tu código para iniciar sesión es:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">
          ${otpCode}
        </p>
        <p style="color: #666;">Este código expira en 10 minutos.</p>
        <p style="color: #999; font-size: 12px;">Si no solicitaste este código, ignora este email.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Error al enviar email: ${error.message}`);
  }

  return { success: true, data };
}


export async function sendWelcomeEmail(to, name) {
  if (!resend) {
    console.warn('RESEND_API_KEY no configurada. Email de bienvenida no enviado.');
    return { success: true, simulated: true };
  }

  const { data, error } = await resend.emails.send({
    from: config.resend.fromEmail,
    to: [to],
    subject: '¡Bienvenido!',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">¡Bienvenido${name ? `, ${name}` : ''}!</h2>
        <p>Tu cuenta ha sido creada correctamente.</p>
        <p>Ya puedes iniciar sesión solicitando un código OTP a tu email.</p>
      </div>
    `,
  });

  if (error) {
    console.error('Error al enviar email de bienvenida:', error);
    return { success: false };
  }

  return { success: true, data };
}
