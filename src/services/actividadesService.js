import { getFirestore } from './firebaseAdmin.js';

export async function getAllActividades() {
  const db = getFirestore();
  const snapshot = await db.collection('actividades').get();
  return snapshot.docs.map(doc => doc.data());
}

export async function getActividadById(id) {
  const db = getFirestore();
  const doc = await db.collection('actividades').doc(String(id)).get();
  if (!doc.exists) return null;
  return doc.data();
}

export async function actividadExistsById(rawId) {
  const id = typeof rawId === 'number' ? rawId : parseInt(String(rawId), 10);
  if (!Number.isInteger(id) || id < 1) return false;
  const db = getFirestore();
  const doc = await db.collection('actividades').doc(String(id)).get();
  return doc.exists;
}

export async function getActividadesByPreferencias(preferencias) {
  const db = getFirestore();
  const snapshot = await db.collection('actividades').get();
  return snapshot.docs
    .map(doc => doc.data())
    .filter(a => preferencias.includes(a.categoria));
}
