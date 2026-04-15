import { readFileSync, existsSync } from 'fs';
import admin from 'firebase-admin';
import { config } from '../config/index.js';

let initialized = false;

function looksLikeServiceAccountJson(obj) {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.type === 'service_account' &&
    typeof obj.private_key === 'string'
  );
}

function parseBase64ServiceAccount(value) {
  const trimmed = value.trim();
  if (trimmed.length < 80) {
    return null;
  }
  try {
    const json = Buffer.from(trimmed, 'base64').toString('utf8');
    const obj = JSON.parse(json);
    return looksLikeServiceAccountJson(obj) ? obj : null;
  } catch {
    return null;
  }
}

function loadServiceAccountObject() {
  const value = config.firebase.serviceAccountPath?.trim();
  if (!value) {
    return null;
  }

  if (existsSync(value)) {
    const obj = JSON.parse(readFileSync(value, 'utf8'));
    if (!looksLikeServiceAccountJson(obj)) {
      throw new Error('El archivo de cuenta de servicio no tiene el formato esperado');
    }
    return obj;
  }

  const fromBase64 = parseBase64ServiceAccount(value);
  if (fromBase64) {
    return fromBase64;
  }

  throw new Error(
    'FIREBASE_SERVICE_ACCOUNT_PATH: no existe el archivo indicado o el valor no es un base64 válido del JSON de cuenta de servicio.',
  );
}

export function ensureFirebaseAdmin() {
  if (initialized) {
    return;
  }

  const serviceAccount = loadServiceAccountObject();

  if (!serviceAccount) {
    throw new Error(
      'Configurá FIREBASE_SERVICE_ACCOUNT_PATH: en local la ruta al JSON; en Render el contenido en base64 (una línea).',
    );
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  initialized = true;
}

export function getFirestore() {
  ensureFirebaseAdmin();
  return admin.firestore();
}
