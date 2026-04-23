import { FieldValue } from 'firebase-admin/firestore';
import { getFirestore } from './firebaseAdmin.js';

const RESERVAS_COLLECTION = 'reservas';

function mapDoc(id, data) {
  return {
    id,
    userId: data.userId ?? null,
    actividadId: data.actividadId ?? null,
    actividadNombre: data.actividadNombre ?? null,
    fecha: data.fecha ?? null,
    cantidadPersonas: data.cantidadPersonas ?? null,
    totalPrecio: data.totalPrecio ?? null,
    estado: data.estado ?? null,
    creadaEn: data.creadaEn ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

export async function getReservasByUser(userId) {
  const db = getFirestore();
  const snap = await db
    .collection(RESERVAS_COLLECTION)
    .where('userId', '==', userId)
    .get();
  const reservas = snap.docs.map((doc) => mapDoc(doc.id, doc.data()));
  return reservas.sort((a, b) => {
    const ta = a.creadaEn?._seconds ?? 0;
    const tb = b.creadaEn?._seconds ?? 0;
    return tb - ta;
  });
}

export async function createReserva(userId, { actividadId, actividadNombre, fecha, cantidadPersonas, totalPrecio }) {
  const db = getFirestore();
  const ref = db.collection(RESERVAS_COLLECTION).doc();
  const now = FieldValue.serverTimestamp();
  await ref.set({
    userId,
    actividadId,
    actividadNombre,
    fecha,
    cantidadPersonas,
    totalPrecio: totalPrecio ?? null,
    estado: 'CONFIRMADA',
    creadaEn: now,
    updatedAt: now,
  });
  const snap = await ref.get();
  return mapDoc(ref.id, snap.data());
}

export async function cancelarReserva(id, userId) {
  const db = getFirestore();
  const ref = db.collection(RESERVAS_COLLECTION).doc(id);
  const snap = await ref.get();

  if (!snap.exists) {
    return { error: 'not_found' };
  }

  const data = snap.data();

  if (data.userId !== userId) {
    return { error: 'forbidden' };
  }

  if (data.estado === 'CANCELADA') {
    return { error: 'already_cancelled' };
  }

  await ref.set({ estado: 'CANCELADA', updatedAt: FieldValue.serverTimestamp() }, { merge: true });

  const updated = await ref.get();
  return { reserva: mapDoc(id, updated.data()) };
}
