import { Review } from '../models/review.model.js';
import { Recipe } from '../models/recipe.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';


const addReview = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;
  const { content, rating } = req.body;

  if (!content || !rating) {
    throw new ApiError(400, 'Content and rating are required');
  }

  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    throw new ApiError(404, 'Recipe not found');
  }

  
  const existingReview = await Review.findOne({
    recipe: recipeId,
    author: req.user._id,
  });

  if (existingReview) {
    throw new ApiError(400, 'You have already reviewed this recipe');
  }

  const review = await Review.create({
    content,
    rating,
    recipe: recipeId,
    author: req.user._id,
  });

  const stats = await Review.aggregate([{ $match: { recipe: recipe._id } }, { $group: { _id: '$recipe', avgRating: { $avg: '$rating' } } }]);

  if (stats.length > 0) {
    recipe.averageRating = stats[0].avgRating;
    await recipe.save({ validateBeforeSave: false });
  }

  return res.status(201).json(new ApiResponse(201, review, 'Review added'));
});



const getRecipeReviews = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;

  // Pagination
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const reviews = await Review.find({ recipe: recipeId })
    .populate('author', 'username avatar') // Show who commented
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  return res.status(200).json(new ApiResponse(200, reviews, 'Reviews fetched'));
});

export { addReview, getRecipeReviews };
