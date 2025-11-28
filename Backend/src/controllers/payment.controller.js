import { User } from '../models/user.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const upgradeToPremium = asyncHandler(async (req, res) => {
  // In real life: Verify Stripe signature here

  const user = await User.findById(req.user._id);

  user.isSubscriptionActive = true;
  user.subscriptionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 Days

  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, { isPremium: true }, 'Upgrade Successful! Enjoy Premium Recipes.'));
});

export { upgradeToPremium };
