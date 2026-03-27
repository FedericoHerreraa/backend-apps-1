import * as firebaseAuthService from '../services/firebaseAuthService.js';


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
    const readableError = firebaseAuthService.getReadableFirebaseError(error);
    const statusCode = readableError === 'Credenciales inválidas' ? 401 : 500;
    return res.status(statusCode).json({
      success: false,
      error: readableError,
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
