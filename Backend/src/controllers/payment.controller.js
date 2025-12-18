import Razorpay from 'razorpay';
import crypto from 'crypto';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PLANS = {
  monthly: { amount: 499, months: 1 },
  yearly: { amount: 4999, months: 12 },
};

// 1. Get Key
export const getRazorpayKey = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(200, { key: process.env.RAZORPAY_KEY_ID }, 'Key fetched')
    );
});

// 2. Create Order
export const createOrder = asyncHandler(async (req, res) => {
  const { planType } = req.body; // Expects 'monthly' or 'yearly'

  if (!PLANS[planType]) {
    throw new ApiError(400, "Invalid plan type. Use 'monthly' or 'yearly'");
  }

  const user = await User.findById(req.user._id);

  // --- BLOCK ACTIVE SUBSCRIPTIONS ---
  if (
    user.isPremium &&
    user.subscriptionExpiry &&
    user.subscriptionExpiry > new Date()
  ) {
    const remainingDays = Math.ceil(
      (user.subscriptionExpiry - new Date()) / (1000 * 60 * 60 * 24)
    );
    throw new ApiError(
      400,
      `You already have an active subscription expiring in ${remainingDays} days.`
    );
  }

  const options = {
    amount: PLANS[planType].amount * 100,
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    return res.status(200).json(new ApiResponse(200, order, 'Order created'));
  } catch (error) {
    console.error('Razorpay Error:', error);
    throw new ApiError(500, 'Could not create order');
  }
});

// 3. Verify Payment
export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    planType,
  } = req.body;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !planType
  ) {
    throw new ApiError(400, 'Payment details or plan type missing');
  }

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    // Calculate Expiry Date based on Plan
    const monthsToAdd = PLANS[planType].months;
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + monthsToAdd);

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        isPremium: true,
        subscriptionPlan: planType,
        subscriptionExpiry: expiryDate,
      },
      { new: true }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedUser,
          'Payment verified & Premium activated'
        )
      );
  } else {
    throw new ApiError(400, 'Invalid signature');
  }
});
