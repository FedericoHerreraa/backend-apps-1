import { Router } from 'express';
import * as historialController from '../controllers/historialController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/review', authenticate, historialController.postReview);

export default router;
