import { Router } from 'express';
import { subscribeToNewsletter } from '../controllers/newsletter.controller.js';

const router = Router();

router.route('/subscribe').post(subscribeToNewsletter);

export default router;
