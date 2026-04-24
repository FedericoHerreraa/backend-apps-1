import { FieldValue } from 'firebase-admin/firestore';
import { getFirestore } from './firebaseAdmin.js';

const RESERVAS_COLLECTION = 'reservas';
const ACTIVIDADES_COLLECTION = 'actividades';

export async function getReservasByUserId(userId) {
  const db = getFirestore();
  const snapshot = await db
    .collection(RESERVAS_COLLECTION)
    .where('userId', '==', userId)
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function createReserva(userId, data) {
  const { actividadId, fecha, horario, cantidadParticipantes } = data;
  const db = getFirestore();

  const actividadRef = db.collection(ACTIVIDADES_COLLECTION).doc(String(actividadId));
  const actividadSnap = await actividadRef.get();

  if (!actividadSnap.exists) {
    const err = new Error('Actividad no encontrada');
    err.statusCode = 404;
    throw err;
  }

  const actividad = actividadSnap.data();

  if (actividad.cuposDisponibles < cantidadParticipantes) {
    const err = new Error('Sin cupos disponibles');
    err.statusCode = 400;
    throw err;
  }

  const nuevaReserva = {
    actividadId,
    actividadNombre: actividad.actividadNombre ?? actividad.nombre ?? null,
    fecha,
    horario,
    cantidadParticipantes,
    estado: 'confirmada',
    userId,
    politicaCancelacion: actividad.politicaCancelacion ?? actividad.politica_cancelacion ?? null,
    cuposDisponibles: actividad.cuposDisponibles - cantidadParticipantes,
    creadoEn: FieldValue.serverTimestamp(),
  };

  const reservaRef = await db.collection(RESERVAS_COLLECTION).add(nuevaReserva);

  await actividadRef.update({
    cuposDisponibles: FieldValue.increment(-cantidadParticipantes),
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
