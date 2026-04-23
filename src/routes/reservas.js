import { Router } from 'express';
import * as reservaController from '../controllers/reservaController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, reservaController.getReservas);
router.post('/', authenticate, reservaController.createReserva);
router.patch('/:id/cancelar', authenticate, reservaController.cancelarReserva);

export default router;
