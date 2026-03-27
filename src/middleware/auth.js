import * as firebaseAuthService from '../services/firebaseAuthService.js';


export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token no proporcionado',
    });
  }

  const token = authHeader.split(' ')[1];

  firebaseAuthService
    .getUserByIdToken(token)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch(() => {
      return res.status(401).json({
        success: false,
        error: 'Token inválido o expirado',
      });
    });
}
