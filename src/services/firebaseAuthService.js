import { config } from '../config/index.js';

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

function mapFirebaseError(errorCode) {
  const code = (errorCode || '').toUpperCase();

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

  return {
    uid: registerData.localId,
    email: registerData.email,
    displayName: name || null,
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

  return {
    uid: loginData.localId,
    email: loginData.email,
    displayName: loginData.displayName || null,
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

export function getReadableFirebaseError(error) {
  return mapFirebaseError(error?.code || error?.message);
}
