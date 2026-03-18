import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import * as userService from '../services/userService.js';
import * as otpService from '../services/otpService.js';
import * as emailService from '../services/emailService.js';


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

    const user = await userService.createUser({ email, password, name });
    await emailService.sendWelcomeEmail(user.email, user.name);

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      user,
    });
  } catch (error) {
    if (error.message === 'El email ya está registrado') {
      return res.status(409).json({ success: false, error: error.message });
    }
    console.error('Error en registro:', error);
    return res.status(500).json({ success: false, error: 'Error al registrar usuario' });
  }
}

export async function requestOtp(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'El email es requerido',
      });
    }

    const user = userService.findByEmail(email);
    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return res.status(200).json({
        success: true,
        message: 'Si el email está registrado, recibirás un código de verificación',
      });
    }

    const { otp } = otpService.createOtp(email);
    await emailService.sendOtpEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: 'Si el email está registrado, recibirás un código de verificación',
    });
  } catch (error) {
    console.error('Error al solicitar OTP:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al enviar el código de verificación',
    });
  }
}


export async function verifyOtp(req, res) {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: 'Email y código son requeridos',
      });
    }

    const result = otpService.verifyOtp(email, code);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    const user = userService.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no encontrado',
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Error al verificar OTP:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al verificar el código',
    });
  }
}


export async function me(req, res) {
  try {
    const user = userService.findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Error en /me:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener usuario' });
  }
}
