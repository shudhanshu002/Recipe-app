import { MealPlan } from "../models/mealplan.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const addToMealPlan = asyncHandler(async( req, res) => {
    const {recipeId, date, mealType} = req.body;

    if(!recipeId || !date){
        throw new ApiError(400, "recipe and Date are required");
    }

    const plan = await MealPlan.create({
        user: req.user._id,
        recipe: recipeId,
        date: new Date(date),
        mealType: mealType || "Dinner"
    });

    return res.status(201).json(new ApiResponse(201, plan, "Added to meal plan"));
})


const getWeeklyPlan = asyncHandler(async (req,res) => {
    const {startDate, endDate} = req.query;

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 7*24*60*60*1000);

    const plans = await MealPlan.find({
        user: req.user._id,
        date: {$gte: start, $lte: end}
    })
    .populate("recipe", "title images difficulty cookingTime")
    .sort({date: 1});

    return res.status(200).json(new ApiResponse(200, plans, "Meal plan fetched"));
});


const removeFromMealPlan = asyncHandler(async(req, res)=> {
    const {planId} = req.params;
    await MealPlan.findByIdAndDelete(planId);
    return res.status(200).json(new ApiResponse(200, {}, "Removed from meal plan"));
})


export {
    addToMealPlan,
    getWeeklyPlan,
    removeFromMealPlan
}