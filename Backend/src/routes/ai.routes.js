import { Router } from 'express';
import { getChatResponse } from '../controllers/ai.controller.js';
import { verifyJWT, optionalAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// Chat route
// using optionalAuth allows both guests and logged-in users to chat
router.route('/chat').post(optionalAuth, getChatResponse);

export default router;
