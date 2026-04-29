import { FieldValue } from 'firebase-admin/firestore';
import { getFirestore } from './firebaseAdmin.js';

const USERS_COLLECTION = 'users';
const REVIEWS_SUBCOLLECTION = 'reviews';


export async function upsertActivityReview(uid, payload) {
  const { actividadId, calificacionActividad, calificacionGuia, comentario } = payload;
  const db = getFirestore();
  const docId = String(actividadId);
  const ref = db.collection(USERS_COLLECTION).doc(uid).collection(REVIEWS_SUBCOLLECTION).doc(docId);
  const snap = await ref.get();

  const data = {
    actividadId,
    calificacionActividad,
    calificacionGuia,
    comentario,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (!snap.exists) {
    data.createdAt = FieldValue.serverTimestamp();
  }

  await ref.set(data, { merge: true });

  const saved = await ref.get();
  return serializeReviewDoc(saved.data());
}

function tsToIso(t) {
  if (t == null) return null;
  if (typeof t.toDate === 'function') {
    const d = t.toDate();
    return d instanceof Date && !Number.isNaN(d.getTime()) ? d.toISOString() : null;
  }
  if (t instanceof Date) return t.toISOString();
  return null;
}

function serializeReviewDoc(data) {
  if (!data) return null;
  return {
    ...data,
    createdAt: tsToIso(data.createdAt) ?? data.createdAt,
    updatedAt: tsToIso(data.updatedAt) ?? data.updatedAt,
  };
}


export async function getUserActivityReview(uid, actividadId) {
  const db = getFirestore();
  const docId = String(actividadId);
  const ref = db
    .collection(USERS_COLLECTION)
    .doc(uid)
    .collection(REVIEWS_SUBCOLLECTION)
    .doc(docId);
  const snap = await ref.get();
  if (!snap.exists) return null;
  return serializeReviewDoc(snap.data());
}
