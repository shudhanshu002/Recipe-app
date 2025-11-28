import { Recipe } from "../models/recipe.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getCuisineStats = asyncHandler(async (req, res)=> {
    const cuisines = await Recipe.aggregate([
        {
            $group: {
                _id: "$cuisine",
                count: { $sum: 1}
            }
        },
        { $sort: { count: -1 }}
    ]);

    return res.status(200).json(new ApiResponse(200, cuisines, "Cuisine stats fetched successfully"));
});


const getIngredientStats = asyncHandler(async (req, res)=> {
    const ingredients = await Recipe.aggregate([
        {
            $group: {
                _id: "$mainIngredient",
                count: {$sum: 1}
            }
        },
        {$sort: {count: -1}},
        {$limit: 10}
    ]);

    return res.status(200).json(new ApiResponse(200, ingredients, 'Ingredient stats fetched'));
});


const getDashboardStats = asyncHandler(async (req, res) => {
    const totalRecipes = await Recipe.countDocuments();
    const totalUsers = await User.countDocuments();
    const premiumRecipes = await Recipe.countDocuments({ isPremium: true });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalRecipes,
                totalUsers,
                premiumRecipes,
            },
            'Dashboard stats fetched',
        ),
    );
});


export {
    getCuisineStats,
    getIngredientStats,
    getDashboardStats
}