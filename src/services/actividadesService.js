import { getFirestore } from './firebaseAdmin.js';

const db = getFirestore();

export async function actividadExistsById(rawId) {
  const id = typeof rawId === 'number' ? rawId : parseInt(String(rawId), 10);
  if (!Number.isInteger(id) || id < 1) return false;
  const doc = await db.collection('actividades').doc(String(id)).get();
  return doc.exists;
}
