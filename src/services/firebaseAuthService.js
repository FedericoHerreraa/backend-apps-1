import { config } from '../config/index.js';
import * as firestoreUserService from './firestoreUserService.js';

const FIREBASE_AUTH_BASE_URL = 'https://identitytoolkit.googleapis.com/v1/accounts';

function getFirebaseApiKey() {
  if (!config.firebase.apiKey) {
    throw new Error('FIREBASE_API_KEY no está configurada');
  }
  return config.firebase.apiKey;
}

async function firebaseAuthRequest(endpoint, payload) {
  const apiKey = getFirebaseApiKey();
  const response = await fetch(`${FIREBASE_AUTH_BASE_URL}:${endpoint}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    const message = data?.error?.message || 'Error en Firebase Auth';
    const error = new Error(message);
    error.code = message;
    throw error;
  }

  return data;
}

function mapFirebaseError(error) {
  const raw = error?.code ?? error?.message ?? '';
  const code = String(raw).toUpperCase();

  switch (code) {
    case 'EMAIL_EXISTS':
      return 'El email ya está registrado';
    case 'INVALID_EMAIL':
      return 'El email no es válido';
    case 'WEAK_PASSWORD : PASSWORD SHOULD BE AT LEAST 6 CHARACTERS':
    case 'WEAK_PASSWORD':
      return 'La contraseña debe tener al menos 6 caracteres';
    case 'INVALID_LOGIN_CREDENTIALS':
    case 'INVALID_PASSWORD':
    case 'EMAIL_NOT_FOUND':
      return 'Credenciales inválidas';
    case 'USER_DISABLED':
      return 'La cuenta está deshabilitada';
    case 'INVALID_ID_TOKEN':
    case 'TOKEN_EXPIRED':
      return 'Token inválido o expirado';
    case 'OPERATION_NOT_ALLOWED':
      return 'El inicio de sesión con email/contraseña no está habilitado en Firebase';
    case 'TOO_MANY_ATTEMPTS_TRY_LATER':
      return 'Demasiados intentos. Probá de nuevo más tarde';
    case '7':
    case 'PERMISSION_DENIED':
      return 'Sin permiso para acceder a Firestore (revisá la cuenta de servicio y el proyecto)';
    case '5':
    case 'NOT_FOUND':
      return 'Recurso no encontrado en Firestore';
    default:
      return 'Error de autenticación con Firebase';
  }
}

export async function registerUser({ email, password, name }) {
  const registerData = await firebaseAuthRequest('signUp', {
    email: email.toLowerCase().trim(),
    password,
    returnSecureToken: true,
  });

  if (name) {
    await firebaseAuthRequest('update', {
      idToken: registerData.idToken,
      displayName: name,
      returnSecureToken: true,
    });
  }

  const displayName = name || null;
  await firestoreUserService.createUserDocument(registerData.localId, {
    email: registerData.email,
    displayName,
  });

  return {
    uid: registerData.localId,
    email: registerData.email,
    displayName,
    idToken: registerData.idToken,
    refreshToken: registerData.refreshToken,
    expiresIn: registerData.expiresIn,
  };
}

export async function loginUser({ email, password }) {
  const loginData = await firebaseAuthRequest('signInWithPassword', {
    email: email.toLowerCase().trim(),
    password,
    returnSecureToken: true,
  });

  const profile = await firestoreUserService.ensureUserDocument(loginData.localId, {
    email: loginData.email,
    displayName: loginData.displayName || null,
  });

  return {
    uid: profile.uid,
    email: profile.email,
    displayName: profile.displayName,
    idToken: loginData.idToken,
    refreshToken: loginData.refreshToken,
    expiresIn: loginData.expiresIn,
  };
}

export async function getUserByIdToken(idToken) {
  const lookupData = await firebaseAuthRequest('lookup', { idToken });
  const user = lookupData?.users?.[0];

  if (!user) {
    const error = new Error('INVALID_ID_TOKEN');
    error.code = 'INVALID_ID_TOKEN';
    throw error;
  }

  return {
    uid: user.localId,
    email: user.email,
    displayName: user.displayName || null,
    emailVerified: Boolean(user.emailVerified),
    disabled: Boolean(user.disabled),
    providerUserInfo: user.providerUserInfo || [],
  };
}

export async function exchangeCustomTokenForIdToken(customToken) {
  const data = await firebaseAuthRequest('signInWithCustomToken', {
    token: customToken,
    returnSecureToken: true,
  });
  return {
    idToken: data.idToken,
    refreshToken: data.refreshToken,
    expiresIn: data.expiresIn,
  };
}

export function getReadableFirebaseError(error) {
  return mapFirebaseError(error);
}
