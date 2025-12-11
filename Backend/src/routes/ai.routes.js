import { Router } from 'express';
import { getChatResponse } from '../controllers/ai.controller.js';
import { verifyJWT, optionalAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/chat').post(optionalAuth, getChatResponse);

export default router;
