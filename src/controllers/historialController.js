import * as firestoreReviewService from '../services/firestoreReviewService.js';
import { actividadExistsById } from './actividadesController.js';

const MIN_CAL = 1;
const MAX_CAL = 5;
const MAX_COMENTARIO_LEN = 2000;

function isIntInRange(n, min, max) {
  return Number.isInteger(n) && n >= min && n <= max;
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

    if (!actividadExistsById(actividadId)) {
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
