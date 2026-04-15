import { readFileSync, existsSync } from 'fs';
import admin from 'firebase-admin';
import { config } from '../config/index.js';

let initialized = false;

function resolveServiceAccountPath() { return config.firebase.serviceAccountPath }

export function ensureFirebaseAdmin() {
  if (initialized) {
    return;
  }

  const path = resolveServiceAccountPath();
  if (!path || !existsSync(path)) {
    throw new Error(
      'Firestore requiere credenciales de servicio: configure FIREBASE_SERVICE_ACCOUNT_PATH o GOOGLE_APPLICATION_CREDENTIALS con la ruta al JSON de la cuenta de servicio.',
    );
  }

  const serviceAccount = JSON.parse(readFileSync(path, 'utf8'));

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
