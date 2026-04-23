import * as firestoreReservaService from '../services/firestoreReservaService.js';

export async function getReservas(req, res) {
  try {
    const reservas = await firestoreReservaService.getReservasByUser(req.user.uid);
    return res.status(200).json({ success: true, reservas });
  } catch (error) {
    console.error('Error en GET /reservas:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener las reservas' });
  }
}

export async function createReserva(req, res) {
  try {
    const { actividadId, actividadNombre, fecha, cantidadPersonas, totalPrecio } = req.body || {};

    if (!actividadId || typeof actividadId !== 'string' || actividadId.trim() === '') {
      return res.status(400).json({ success: false, error: 'actividadId es requerido' });
    }

    if (!actividadNombre || typeof actividadNombre !== 'string' || actividadNombre.trim() === '') {
      return res.status(400).json({ success: false, error: 'actividadNombre es requerido' });
    }

    if (!fecha || typeof fecha !== 'string' || fecha.trim() === '') {
      return res.status(400).json({ success: false, error: 'fecha es requerida' });
    }

    if (
      cantidadPersonas === undefined ||
      cantidadPersonas === null ||
      !Number.isInteger(cantidadPersonas) ||
      cantidadPersonas < 1
    ) {
      return res.status(400).json({ success: false, error: 'cantidadPersonas debe ser un entero mayor a 0' });
    }

    if (totalPrecio !== undefined && totalPrecio !== null && (typeof totalPrecio !== 'number' || totalPrecio < 0)) {
      return res.status(400).json({ success: false, error: 'totalPrecio debe ser un número mayor o igual a 0' });
    }

    const reserva = await firestoreReservaService.createReserva(req.user.uid, {
      actividadId: actividadId.trim(),
      actividadNombre: actividadNombre.trim(),
      fecha: fecha.trim(),
      cantidadPersonas,
      totalPrecio,
    });

    return res.status(201).json({ success: true, message: 'Reserva creada correctamente', reserva });
  } catch (error) {
    console.error('Error en POST /reservas:', error);
    return res.status(500).json({ success: false, error: 'Error al crear la reserva' });
  }
}

export async function cancelarReserva(req, res) {
  try {
    const { id } = req.params;
    const result = await firestoreReservaService.cancelarReserva(id, req.user.uid);

    if (result.error === 'not_found') {
      return res.status(404).json({ success: false, error: 'Reserva no encontrada' });
    }
    if (result.error === 'forbidden') {
      return res.status(403).json({ success: false, error: 'No tenés permiso para cancelar esta reserva' });
    }
    if (result.error === 'already_cancelled') {
      return res.status(400).json({ success: false, error: 'La reserva ya fue cancelada' });
    }

    return res.status(200).json({ success: true, message: 'Reserva cancelada correctamente', reserva: result.reserva });
  } catch (error) {
    console.error('Error en PATCH /reservas/:id/cancelar:', error);
    return res.status(500).json({ success: false, error: 'Error al cancelar la reserva' });
  }
}
