import { Like } from "../models/like.model.js";
import { Notification } from "../models/notification.model.js";
import { Recipe } from "../models/recipe.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const toggleRecipeLike = asyncHandler(async (req, res)=> {
    const {recipeId} = req.params;

    const likedAlready = await Like.findOne({
        recipe: recipeId,
        likedBy: req.user._id
    });

    if(likedAlready) {
        await Like.findByIdAndDelete(likedAlready._id);
        return res.status(200).json(new ApiResponse(200, {isLiked: false},"Unliked"));
    } else {
        await Like.create({ recipe: recipeId, likedBy: req.user._id });

        
        const recipe = await Recipe.findById(recipeId);
        if (recipe.createdBy.toString() !== req.user._id.toString()) { 
            await Notification.create({
                recipient: recipe.createdBy, 
                sender: req.user._id,      
                type: "LIKE_RECIPE",
                recipe: recipeId
            });
        }
        return res.status(200).json(new ApiResponse(200, { isLiked: true }, 'Liked'));
    }
})

const toggleReviewLike = asyncHandler(async(req,res) => {
    const {reviewId} = req.params;

    const likedAlready = await Like.findOne({
        review: reviewId,
        likedBy: req.user._id
    });

    if(likedAlready){
        await Like.findByIdAndDelete(likedAlready._id);
        return res.status(200).json(new ApiResponse(200, {isLiked: false}, "Unlike"));
    }

    await Like.create({
        review: reviewId,
        likedBy: req.user._id
    });

    return res.status(200).json(new ApiResponse(200, {isLiked: true}, "Liked"));
});


const getLikedRecipes = asyncHandler(async(req,res)=> {
    const likes = await Like.find({likedBy: req.user._id, recipe: {$exists: true}})
        .populate("recipe");

    const recipes = likes.map(item => item.recipe);
    return res.status(200).json(new ApiResponse(200, recipes, "Liked recipe fetched"));
})


export {
    toggleRecipeLike,
    toggleReviewLike,
    getLikedRecipes
}