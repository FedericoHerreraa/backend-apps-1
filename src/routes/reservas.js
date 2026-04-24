import { Router } from 'express';
import * as reservaController from '../controllers/reservaController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, reservaController.getMisReservas);
router.post('/', authenticate, reservaController.crearReserva);
router.patch('/:id/cancelar', authenticate, reservaController.cancelarReserva);

export default router;
