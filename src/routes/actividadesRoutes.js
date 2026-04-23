import { Router } from 'express';
import * as actividadesController from '../controllers/actividadesController.js';

const router = Router();

router.get('/', actividadesController.getActividades);
router.get('/recomendadas', actividadesController.getRecomendadas);
router.get('/:id', actividadesController.getActividadById);

export default router;