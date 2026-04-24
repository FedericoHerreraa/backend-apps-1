import * as firestoreReservaService from '../services/firestoreReservaService.js';

export async function getMisReservas(req, res) {
  try {
    const reservas = await firestoreReservaService.getReservasByUserId(req.user.uid);
    return res.status(200).json({ success: true, reservas });
  } catch (error) {
    console.error('Error en getMisReservas:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener las reservas' });
  }
}

export async function crearReserva(req, res) {
  try {
    const { actividadId, fecha, horario, cantidadParticipantes } = req.body;

    if (!actividadId || !fecha || !horario || cantidadParticipantes == null) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: actividadId, fecha, horario, cantidadParticipantes',
      });
    }

    const cantidad = Number(cantidadParticipantes);
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      return res.status(400).json({
        success: false,
        error: 'cantidadParticipantes debe ser un número entero mayor o igual a 1',
      });
    }

    const reserva = await firestoreReservaService.createReserva(req.user.uid, {
      ...req.body,
      cantidadParticipantes: cantidad,
    });

    return res.status(201).json({ success: true, reserva });
  } catch (error) {
    console.error('Error en crearReserva:', error);
    const statusCode = error.statusCode ?? 500;
    const errorMsg =
      statusCode === 500 ? 'Error al crear la reserva' : error.message;
    return res.status(statusCode).json({ success: false, error: errorMsg });
  }
}

export async function cancelarReserva(req, res) {
  try {
    const reservaId = req.params.id;
    const reserva = await firestoreReservaService.cancelarReserva(reservaId, req.user.uid);
    return res.status(200).json({
      success: true,
      message: 'Reserva cancelada correctamente',
      reserva,
    });
  } catch (error) {
    console.error('Error en cancelarReserva:', error);
    const statusCode = error.statusCode ?? 500;
    const errorMsg =
      statusCode === 500 ? 'Error al cancelar la reserva' : error.message;
    return res.status(statusCode).json({ success: false, error: errorMsg });
  }
}
