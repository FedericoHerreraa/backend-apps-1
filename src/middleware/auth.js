import * as firebaseAuthService from '../services/firebaseAuthService.js';
import * as firestoreUserService from '../services/firestoreUserService.js';


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
    .then(async (authUser) => {
      try {
        const profile = await firestoreUserService.ensureUserDocument(authUser.uid, {
          email: authUser.email,
          displayName: authUser.displayName || null,
        });
        req.user = {
          uid: authUser.uid,
          ...profile,
          emailVerified: authUser.emailVerified,
        };
        next();
      } catch (err) {
        console.error('Error cargando perfil desde Firestore:', err);
        return res.status(500).json({
          success: false,
          error: 'Error al cargar el perfil de usuario',
        });
      }
    })
    .catch(() => {
      return res.status(401).json({
        success: false,
        error: 'Token inválido o expirado',
      });
    });
}
