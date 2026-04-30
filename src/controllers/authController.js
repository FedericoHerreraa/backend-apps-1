import * as firebaseAuthService from '../services/firebaseAuthService.js';
import * as otpService from '../services/otpService.js';
import * as emailService from '../services/emailService.js';
import * as otpSessionService from '../services/otpSessionService.js';
import { isValidEmail } from '../utils/email.js';


export async function register(req, res) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres',
      });
    }

    const user = await firebaseAuthService.registerUser({ email, password, name });

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      user,
    });
  } catch (error) {
    const readableError = firebaseAuthService.getReadableFirebaseError(error);
    if (readableError === 'El email ya está registrado') {
      return res.status(409).json({ success: false, error: readableError });
    }
    if (readableError === 'La contraseña debe tener al menos 6 caracteres') {
      return res.status(400).json({ success: false, error: readableError });
    }
    console.error('Error en registro:', error);
    return res.status(500).json({ success: false, error: readableError });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos',
      });
    }

    const user = await firebaseAuthService.loginUser({ email, password });

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      user,
    });
  } catch (error) {
    console.error('Error en login:', error?.message || error, error?.code != null ? `(code: ${error.code})` : '');
    const readableError = firebaseAuthService.getReadableFirebaseError(error);
    const statusCode = readableError === 'Credenciales inválidas' ? 401 : 500;
    return res.status(statusCode).json({
      success: false,
      error: readableError,
    });
  }
}

export async function sendOtp(req, res) {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email inválido',
      });
    }

    const normalized = email.toLowerCase().trim();
    const { otp } = otpService.createOtp(normalized);
    
    try {
      await emailService.sendOtpEmail(normalized, otp);
    } catch (emailError) {
      console.error('Error enviando email OTP:', emailError);
      return res.status(500).json({
        success: false,
        error: 'No se pudo enviar el código. Verifica que SMTP esté configurado en .env',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Si el correo es válido, recibirás un código en los próximos minutos.',
    });
  } catch (error) {
    console.error('Error en sendOtp:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'No se pudo enviar el código',
    });
  }
}

export async function resendOtp(req, res) {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email inválido',
      });
    }

    const normalized = email.toLowerCase().trim();
    
    // Generar nuevo OTP
    const { otp } = otpService.createOtp(normalized);
    
    try {
      await emailService.sendOtpEmail(normalized, otp);
    } catch (emailError) {
      console.error('Error enviando email OTP:', emailError);
      return res.status(500).json({
        success: false,
        error: 'No se pudo enviar el código. Verifica que SMTP esté configurado en .env',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Se ha enviado un nuevo código a tu email.',
    });
  } catch (error) {
    console.error('Error en resendOtp:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'No se pudo reenviar el código',
    });
  }
}

export async function verifyOtpAndSignIn(req, res) {
  try {
    const { email, code } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email inválido',
      });
    }

    if (code == null || String(code).trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'El código es requerido',
      });
    }

    const normalized = email.toLowerCase().trim();
    const result = otpService.verifyOtp(normalized, code);

    if (!result.valid) {
      const status = result.error === 'Demasiados intentos fallidos' ? 429 : 401;
      return res.status(status).json({
        success: false,
        error: result.error,
      });
    }

    const { customToken, user } = await otpSessionService.createSessionAfterOtpVerified(normalized);

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión correcto',
      customToken,
      user,
    });
  } catch (error) {
    console.error('Error en verify OTP:', error);
    return res.status(500).json({
      success: false,
      error: 'No se pudo completar el inicio de sesión',
    });
  }
}

export async function me(req, res) {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error('Error en /me:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener usuario' });
  }
}
