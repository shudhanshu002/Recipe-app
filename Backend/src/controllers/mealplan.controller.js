import { MealPlan } from '../models/mealplan.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// 1. ADD TO MEAL PLAN
const addToMealPlan = asyncHandler(async (req, res) => {
  const { recipeId, date, mealType } = req.body;

  if (!recipeId || !date) {
    throw new ApiError(400, 'Recipe and Date are required');
  }

  // Normalize Date to Midnight (Local)
  const planDate = new Date(date);
  planDate.setHours(0, 0, 0, 0);

  const plan = await MealPlan.create({
    user: req.user._id,
    recipe: recipeId,
    date: planDate,
    mealType: mealType || 'Dinner',
  });

  const populatedPlan = await MealPlan.findById(plan._id).populate(
    'recipe',
    'title images difficulty cookingTime'
  );

  return res
    .status(201)
    .json(new ApiResponse(201, populatedPlan, 'Added to meal plan'));
});

// 2. GET WEEKLY PLAN
const getWeeklyPlan = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  let start = startDate ? new Date(startDate) : new Date();
  start.setHours(0, 0, 0, 0);
  let end = endDate
    ? new Date(endDate)
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  end.setHours(23, 59, 59, 999);

  const plans = await MealPlan.find({
    user: req.user._id,
    date: { $gte: start, $lte: end },
  })
    .populate('recipe', 'title images difficulty cookingTime')
    .sort({ date: 1 });

  return res.status(200).json(new ApiResponse(200, plans, 'Meal plan fetched'));
});

// 3. GET MEAL HISTORY (Past Dates)
const getMealHistory = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const history = await MealPlan.find({
    user: req.user._id,
    date: { $lt: today },
  })
    .populate('recipe', 'title images difficulty cookingTime')
    .sort({ date: -1 });

  return res.status(200).json(new ApiResponse(200, history, 'History fetched'));
});

// 4. REMOVE FROM PLAN
const removeFromMealPlan = asyncHandler(async (req, res) => {
  const { planId } = req.params;

  const plan = await MealPlan.findById(planId);
  if (!plan) throw new ApiError(404, 'Meal plan not found');

  if (plan.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized');
  }

  await MealPlan.findByIdAndDelete(planId);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Removed from meal plan'));
});

export { addToMealPlan, getWeeklyPlan, getMealHistory, removeFromMealPlan };
