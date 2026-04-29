import * as firestoreReviewService from '../services/firestoreReviewService.js';
import { actividadExistsById } from '../services/actividadesService.js';

const MIN_CAL = 1;
const MAX_CAL = 5;
const MAX_COMENTARIO_LEN = 2000;

function isIntInRange(n, min, max) {
  return Number.isInteger(n) && n >= min && n <= max;
}

function parseActividadIdParam(raw) {
  const n = parseInt(String(raw), 10);
  if (!isIntInRange(n, 1, Number.MAX_SAFE_INTEGER)) {
    return null;
  }
  return n;
}

export async function getReviewByUserAndActivity(req, res) {
  try {
    const { userId, actividadId: actividadIdRaw } = req.query;
    if (userId == null || String(userId).trim() === '') {
      return res.status(400).json({ success: false, error: 'Falta o es inválido: userId' });
    }
    if (actividadIdRaw == null || String(actividadIdRaw).trim() === '') {
      return res.status(400).json({ success: false, error: 'Falta o es inválido: actividadId' });
    }
    const uid = String(userId);
    if (uid !== req.user.uid) {
      return res.status(403).json({ success: false, error: 'No autorizado a ver reseñas de otro usuario' });
    }

    const actividadId = parseActividadIdParam(actividadIdRaw);
    if (actividadId == null) {
      return res.status(400).json({ success: false, error: 'actividadId inválido' });
    }

    const review = await firestoreReviewService.getUserActivityReview(uid, actividadId);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Reseña no encontrada' });
    }

    return res.status(200).json({ success: true, review });
  } catch (error) {
    console.error('Error en GET /usuarios/historial/review:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener la reseña' });
  }
}

export async function postReview(req, res) {
  try {
    const body = req.body || {};
    const actividadId = body.actividadId;
    const calificacionActividad = body.calificacionActividad;
    const calificacionGuia = body.calificacionGuia;
    const comentarioRaw = body.comentario;

    if (!isIntInRange(actividadId, 1, Number.MAX_SAFE_INTEGER)) {
      return res.status(400).json({
        success: false,
        error: 'actividadId inválido',
      });
    }

    if (!(await actividadExistsById(actividadId))) {
      return res.status(404).json({
        success: false,
        error: 'Actividad no encontrada',
      });
    }

    if (!isIntInRange(calificacionActividad, MIN_CAL, MAX_CAL)) {
      return res.status(400).json({
        success: false,
        error: `calificacionActividad debe ser un entero entre ${MIN_CAL} y ${MAX_CAL}`,
      });
    }

    if (!isIntInRange(calificacionGuia, MIN_CAL, MAX_CAL)) {
      return res.status(400).json({
        success: false,
        error: `calificacionGuia debe ser un entero entre ${MIN_CAL} y ${MAX_CAL}`,
      });
    }

    let comentario = '';
    if (comentarioRaw !== undefined && comentarioRaw !== null) {
      if (typeof comentarioRaw !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'comentario debe ser texto',
        });
      }
      comentario = comentarioRaw.trim();
      if (comentario.length > MAX_COMENTARIO_LEN) {
        return res.status(400).json({
          success: false,
          error: `comentario no puede superar ${MAX_COMENTARIO_LEN} caracteres`,
        });
      }
    }

    const review = await firestoreReviewService.upsertActivityReview(req.user.uid, {
      actividadId,
      calificacionActividad,
      calificacionGuia,
      comentario,
    });

    return res.status(200).json({
      success: true,
      message: 'Reseña guardada correctamente',
      review,
    });
  } catch (error) {
    console.error('Error en POST /usuarios/historial/review:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al guardar la reseña',
    });
  }
}
