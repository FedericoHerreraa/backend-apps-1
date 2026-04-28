import { FieldValue } from 'firebase-admin/firestore';
import { getFirestore } from './firebaseAdmin.js';

const FAVORITOS_COLLECTION = 'favoritos';
const ACTIVIDADES_COLLECTION = 'actividades';

function buildDocId(userId, actividadId) {
  return `${userId}__${actividadId}`;
}

export async function isFavorito(userId, actividadId) {
  const db = getFirestore();
  const docId = buildDocId(userId, actividadId);
  const snap = await db.collection(FAVORITOS_COLLECTION).doc(docId).get();
  return snap.exists;
}

export async function addFavorito(userId, actividadId) {
  const db = getFirestore();

  const actividadSnap = await db
    .collection(ACTIVIDADES_COLLECTION)
    .doc(String(actividadId))
    .get();

  if (!actividadSnap.exists) {
    const err = new Error('Actividad no encontrada');
    err.statusCode = 404;
    throw err;
  }

  const actividad = actividadSnap.data();
  const docId = buildDocId(userId, actividadId);

  await db.collection(FAVORITOS_COLLECTION).doc(docId).set({
    userId,
    actividadId: actividad.id ?? Number(actividadId),
    precioAlGuardar: actividad.precio ?? null,
    cuposAlGuardar: actividad.cupos_disponibles ?? null,
    creadoEn: FieldValue.serverTimestamp(),
  });

  return {
    actividadId: actividad.id ?? Number(actividadId),
    precioAlGuardar: actividad.precio ?? null,
    cuposAlGuardar: actividad.cupos_disponibles ?? null,
  };
}

export async function removeFavorito(userId, actividadId) {
  const db = getFirestore();
  const docId = buildDocId(userId, actividadId);
  await db.collection(FAVORITOS_COLLECTION).doc(docId).delete();
}

export async function listFavoritosByUser(userId) {
  const db = getFirestore();

  const snapshot = await db
    .collection(FAVORITOS_COLLECTION)
    .where('userId', '==', userId)
    .get();

  if (snapshot.empty) {
    return [];
  }

  const favoritos = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const fav = doc.data();
      const actividadSnap = await db
        .collection(ACTIVIDADES_COLLECTION)
        .doc(String(fav.actividadId))
        .get();

      if (!actividadSnap.exists) {
        return {
          actividadId: fav.actividadId,
          precioAlGuardar: fav.precioAlGuardar,
          cuposAlGuardar: fav.cuposAlGuardar,
          actividadDisponible: false,
          tieneNovedad: false,
          tipoNovedad: null,
          actividad: null,
        };
      }

      const actividad = actividadSnap.data();
      const precioActual = actividad.precio;
      const cuposActuales = actividad.cupos_disponibles;

      const precioBajo = precioActual < fav.precioAlGuardar;
      const cuposLiberados = cuposActuales > fav.cuposAlGuardar;

      let tipoNovedad = null;
      if (precioBajo && cuposLiberados) tipoNovedad = 'ambos';
      else if (precioBajo) tipoNovedad = 'precio_bajo';
      else if (cuposLiberados) tipoNovedad = 'cupos_liberados';

      return {
        actividadId: fav.actividadId,
        precioAlGuardar: fav.precioAlGuardar,
        cuposAlGuardar: fav.cuposAlGuardar,
        actividadDisponible: true,
        tieneNovedad: tipoNovedad !== null,
        tipoNovedad,
        actividad,
      };
    }),
  );

  return favoritos;
}
