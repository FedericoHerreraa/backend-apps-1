import { FieldValue } from 'firebase-admin/firestore';
import { getFirestore } from './firebaseAdmin.js';

const USERS_COLLECTION = 'users';

function normalizeEmail(email) {
  if (typeof email !== 'string') return email ?? null;
  return email.toLowerCase().trim();
}

// Aca se deberia agregar la informacion que se quiere devolver del usuario
function mapDoc(uid, data) {
  return {
    uid,
    email: data.email ?? null,
    displayName: data.displayName ?? null,
  };
}

export async function createUserDocument(uid, { email, displayName }) {
  const db = getFirestore();
  const ref = db.collection(USERS_COLLECTION).doc(uid);
  await ref.set(
    {
      email: normalizeEmail(email),
      displayName: displayName ?? null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: false },
  );
  const snap = await ref.get();
  return mapDoc(uid, snap.data() || {});
}

export async function getUserDocument(uid) {
  const db = getFirestore();
  const snap = await db.collection(USERS_COLLECTION).doc(uid).get();
  if (!snap.exists) {
    return null;
  }
  return mapDoc(uid, snap.data() || {});
}

export async function ensureUserDocument(uid, { email, displayName }) {
  const existing = await getUserDocument(uid);
  if (existing) {
    return existing;
  }
  const db = getFirestore();
  const ref = db.collection(USERS_COLLECTION).doc(uid);
  await ref.set(
    {
      email: normalizeEmail(email),
      displayName: displayName ?? null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  const snap = await ref.get();
  return mapDoc(uid, snap.data() || {});
}
