import { FieldValue } from 'firebase-admin/firestore';
import { getFirestore } from './firebaseAdmin.js';

const RESERVAS_COLLECTION = 'reservas';
const ACTIVIDADES_COLLECTION = 'actividades';

function calcularEstado(reserva) {
  if (reserva.estado === 'cancelada') return 'cancelada';
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaReserva = new Date(reserva.fecha);
  fechaReserva.setHours(0, 0, 0, 0);
  if (fechaReserva < hoy) return 'finalizada';
  return 'confirmada';
}

export async function getReservasByUserId(userId) {
  const db = getFirestore();
  const snapshot = await db
    .collection(RESERVAS_COLLECTION)
    .where('userId', '==', userId)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      estado: calcularEstado(data),
    };
  });
}

export async function createReserva(userId, data) {
  const db = getFirestore();

  const actividadRef = db.collection(ACTIVIDADES_COLLECTION).doc(String(data.actividadId));
  const actividadSnap = await actividadRef.get();

  if (actividadSnap.data().cuposDisponibles < data.cantidadParticipantes) {
    const err = new Error('Sin cupos disponibles');
    err.statusCode = 400;
    throw err;
  }

  const nuevaReserva = {
    ...data,
    estado: 'confirmada',
    userId,
    creadoEn: FieldValue.serverTimestamp(),
  };

  const reservaRef = await db.collection(RESERVAS_COLLECTION).add(nuevaReserva);

  await actividadRef.update({
    cuposDisponibles: FieldValue.increment(-data.cantidadParticipantes),
  });

  const reservaSnap = await reservaRef.get();
  return { id: reservaRef.id, ...reservaSnap.data() };
}

export async function cancelarReserva(reservaId, userId) {
  const db = getFirestore();

  const reservaRef = db.collection(RESERVAS_COLLECTION).doc(reservaId);
  const reservaSnap = await reservaRef.get();

  if (!reservaSnap.exists) {
    const err = new Error('Reserva no encontrada');
    err.statusCode = 404;
    throw err;
  }

  const reserva = reservaSnap.data();

  if (reserva.userId !== userId) {
    const err = new Error('No autorizado');
    err.statusCode = 403;
    throw err;
  }

  if (reserva.estado !== 'confirmada') {
    const err = new Error('Solo se pueden cancelar reservas confirmadas');
    err.statusCode = 400;
    throw err;
  }

  await reservaRef.update({ estado: 'cancelada' });

  const actividadRef = db.collection(ACTIVIDADES_COLLECTION).doc(String(reserva.actividadId));
  await actividadRef.update({
    cuposDisponibles: FieldValue.increment(reserva.cantidadParticipantes),
  });

  const updatedSnap = await reservaRef.get();
  return { id: reservaId, ...updatedSnap.data() };
}