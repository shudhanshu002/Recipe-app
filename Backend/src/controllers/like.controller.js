import { Like } from '../models/like.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Notification } from '../models/notification.model.js';
import { Recipe } from '../models/recipe.model.js';

// 1. liking recipe / dislike
const toggleRecipeLike = asyncHandler(async (req, res) => {
    const { recipeId } = req.params;

    if (!recipeId) throw new ApiError(400, 'Recipe ID is required');

    const alreadyLiked = await Like.findOne({
        recipe: recipeId,
        likedBy: req.user._id,
    });

    if (alreadyLiked) {
        // UNLIKE
        await Like.findByIdAndDelete(alreadyLiked._id);
        return res.status(200).json(new ApiResponse(200, { isLiked: false }, 'Unliked successfully'));
    } else {
        // LIKE
        await Like.create({
            recipe: recipeId,
            likedBy: req.user._id,
        });

        // Send Notification (Only if liking someone else's recipe)
        const recipe = await Recipe.findById(recipeId);
        if (recipe && recipe.createdBy.toString() !== req.user._id.toString()) {
            try {
                await Notification.create({
                    recipient: recipe.createdBy,
                    sender: req.user._id,
                    type: 'LIKE_RECIPE',
                    recipe: recipeId,
                });
            } catch (err) {
                console.log('Notification fail:', err.message);
            }
        }

        return res.status(200).json(new ApiResponse(200, { isLiked: true }, 'Liked successfully'));
    }
});

// 2. fetching liked recipe
const getLikedRecipes = asyncHandler(async (req, res) => {
    const likes = await Like.find({ likedBy: req.user._id }).populate('recipe');
    const recipes = likes.map((like) => like.recipe).filter((r) => r !== null);

    return res.status(200).json(new ApiResponse(200, recipes, 'Liked recipes fetched'));
});

// 3. review like/dislike
const toggleReviewLike = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;

    const likedAlready = await Like.findOne({
        review: reviewId,
        likedBy: req.user._id,
    });

    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready._id);
        return res.status(200).json(new ApiResponse(200, { isLiked: false }, 'Unlike'));
    }

    await Like.create({
        review: reviewId,
        likedBy: req.user._id,
    });

    return res.status(200).json(new ApiResponse(200, { isLiked: true }, 'Liked'));
});

export { toggleRecipeLike, getLikedRecipes, toggleReviewLike };