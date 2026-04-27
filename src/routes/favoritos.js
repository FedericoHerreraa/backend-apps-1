import { Router } from 'express';
import * as favoritosController from '../controllers/favoritosController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, favoritosController.getMisFavoritos);
router.post('/:actividadId', authenticate, favoritosController.addFavorito);
router.delete('/:actividadId', authenticate, favoritosController.removeFavorito);
router.get('/:actividadId/check', authenticate, favoritosController.checkFavorito);

export default router;
