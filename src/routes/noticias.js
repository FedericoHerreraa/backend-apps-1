import { Router } from 'express';
import { getNoticias } from '../controllers/noticiasController.js';

const router = Router();

router.get('/', getNoticias);

export default router;
