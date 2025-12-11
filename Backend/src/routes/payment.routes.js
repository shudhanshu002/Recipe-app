import { Router } from 'express';
import { createOrder, verifyPayment, getRazorpayKey } from '../controllers/payment.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/razorpay-key').get(verifyJWT, getRazorpayKey);

router.route('/create-order').post(verifyJWT, createOrder);
router.route('/verify-payment').post(verifyJWT, verifyPayment);

export default router;
