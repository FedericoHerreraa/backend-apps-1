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
  return saved.data();
}
