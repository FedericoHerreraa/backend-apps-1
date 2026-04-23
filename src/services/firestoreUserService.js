import { FieldValue } from 'firebase-admin/firestore';
import { getFirestore } from './firebaseAdmin.js';

const USERS_COLLECTION = 'users';

const VALID_PREFERENCES = ['aventura', 'cultura', 'gastronomia', 'naturaleza', 'relax'];

function normalizeEmail(email) {
  if (typeof email !== 'string') return email ?? null;
  return email.toLowerCase().trim();
}

function sanitizePreferences(input) {
  if (!Array.isArray(input)) return [];
  // Filtramos a las categorías permitidas, deduplicamos y normalizamos
  const normalized = input
    .filter((p) => typeof p === 'string')
    .map((p) => p.toLowerCase().trim())
    .filter((p) => VALID_PREFERENCES.includes(p));
  return Array.from(new Set(normalized));
}

function mapDoc(uid, data) {
  return {
    uid,
    email: data.email ?? null,
    name: data.displayName ?? null,
    phone: data.phone ?? null,
    preferences: Array.isArray(data.preferences) ? data.preferences : [],
  };
}

export async function createUserDocument(uid, { email, displayName }) {
  const db = getFirestore();
  const ref = db.collection(USERS_COLLECTION).doc(uid);
  await ref.set(
    {
      email: normalizeEmail(email),
      displayName: displayName ?? null,
      phone: null,
      preferences: [],
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
      phone: null,
      preferences: [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  const snap = await ref.get();
  return mapDoc(uid, snap.data() || {});
}

export async function updateUserProfile(uid, { name, phone, preferences }) {
  const db = getFirestore();
  const ref = db.collection(USERS_COLLECTION).doc(uid);

  const updates = {
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (name !== undefined) {
    updates.displayName = typeof name === 'string' ? name.trim() : null;
  }
  if (phone !== undefined) {
    updates.phone = typeof phone === 'string' ? phone.trim() : null;
  }
  if (preferences !== undefined) {
    updates.preferences = sanitizePreferences(preferences);
  }

  await ref.set(updates, { merge: true });

  const snap = await ref.get();
  return mapDoc(uid, snap.data() || {});
}
