import { normalizeActividadForApi } from '../schemas/actividad.js';
import { getFirestore } from './firebaseAdmin.js';

const PREFERENCIA_A_CATEGORIAS = {
  aventura: ['aventura'],
  cultura: ['visita guiada', 'free tour'],
  gastronomia: ['experiencia gastronómica'],
  naturaleza: ['excursión'],
  relax: [],
};

export async function getAllActividades() {
  const db = getFirestore();
  const snapshot = await db.collection('actividades').get();
  return snapshot.docs.map((doc) => normalizeActividadForApi(doc.data()));
}

export async function getActividadById(id) {
  const db = getFirestore();
  const doc = await db.collection('actividades').doc(String(id)).get();
  if (!doc.exists) return null;
  return normalizeActividadForApi(doc.data());
}

export async function actividadExistsById(rawId) {
  const id = typeof rawId === 'number' ? rawId : parseInt(String(rawId), 10);
  if (!Number.isInteger(id) || id < 1) return false;
  const db = getFirestore();
  const doc = await db.collection('actividades').doc(String(id)).get();
  return doc.exists;
}

export async function getActividadesByPreferencias(preferencias) {
  const categoriasObjetivo = preferencias.flatMap(
    (p) => PREFERENCIA_A_CATEGORIAS[p] || [],
  );

  if (categoriasObjetivo.length === 0) {
    return [];
  }

  const db = getFirestore();
  const snapshot = await db.collection('actividades').get();
  return snapshot.docs
    .map((doc) => normalizeActividadForApi(doc.data()))
    .filter((a) => categoriasObjetivo.includes(a.categoria));
}