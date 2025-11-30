import { Review } from '../models/review.model.js';
import { Recipe } from '../models/recipe.model.js';
import { Notification } from '../models/notification.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

// 1. ADD REVIEW
const addReview = asyncHandler(async (req, res) => {
    const { recipeId } = req.params;
    const { content, rating } = req.body;

    const mediaLocalPath = req.file?.path;
    let mediaUrl = '';

    if (mediaLocalPath) {
        const uploaded = await uploadOnCloudinary(mediaLocalPath);
        if (uploaded) mediaUrl = uploaded.url;
    }

    if (!content || !rating) {
        throw new ApiError(400, 'Content and rating are required');
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
        throw new ApiError(404, 'Recipe not found');
    }

    const review = await Review.create({
        content,
        rating,
        recipe: recipeId,
        author: req.user._id,
        media: mediaUrl,
        reactions: [],
    });

    // Update Avg Rating
    const stats = await Review.aggregate([{ $match: { recipe: recipe._id } }, { $group: { _id: '$recipe', avgRating: { $avg: '$rating' } } }]);

    if (stats.length > 0) {
        recipe.averageRating = stats[0].avgRating;
        await recipe.save({ validateBeforeSave: false });
    }

    // Notify Author
    if (recipe.createdBy.toString() !== req.user._id.toString()) {
        try {
            await Notification.create({
                recipient: recipe.createdBy,
                sender: req.user._id,
                type: 'COMMENT',
                recipe: recipe._id,
            });
        } catch (e) {}
    }

    const populatedReview = await Review.findById(review._id).populate('author', 'username avatar');
    return res.status(201).json(new ApiResponse(201, populatedReview, 'Review added'));
});

// 2. ADD REPLY
const addReply = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const { content, parentId } = req.body;

    const mediaLocalPath = req.file?.path;
    let mediaUrl = '';
    if (mediaLocalPath) {
        const uploaded = await uploadOnCloudinary(mediaLocalPath);
        if (uploaded) mediaUrl = uploaded.url;
    }

    if (!content) throw new ApiError(400, 'Content is required');

    const review = await Review.findById(reviewId);
    if (!review) throw new ApiError(404, 'Review not found');

    review.replies.push({
        content,
        author: req.user._id,
        media: mediaUrl,
        parentId: parentId || null,
        reactions: [],
        createdAt: new Date(),
    });

    await review.save();

    return res.status(201).json(new ApiResponse(201, review, 'Reply added'));
});

// 3. TOGGLE REVIEW REACTION
const toggleReviewReaction = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) throw new ApiError(404, 'Review not found');

    const existingIndex = review.reactions.findIndex((r) => r.user.toString() === userId.toString());

    if (existingIndex > -1) {
        if (review.reactions[existingIndex].emoji === emoji) {
            review.reactions.splice(existingIndex, 1);
        } else {
            review.reactions[existingIndex].emoji = emoji;
        }
    } else {
        review.reactions.push({ user: userId, emoji });
    }

    await review.save();
    return res.status(200).json(new ApiResponse(200, review.reactions, 'Reaction updated'));
});

// 4. TOGGLE REPLY REACTION
const toggleReplyReaction = asyncHandler(async (req, res) => {
    const { reviewId, replyId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) throw new ApiError(404, 'Review not found');

    const reply = review.replies.id(replyId);
    if (!reply) throw new ApiError(404, 'Reply not found');

    const existingIndex = reply.reactions.findIndex((r) => r.user.toString() === userId.toString());

    if (existingIndex > -1) {
        if (reply.reactions[existingIndex].emoji === emoji) {
            reply.reactions.splice(existingIndex, 1);
        } else {
            reply.reactions[existingIndex].emoji = emoji;
        }
    } else {
        reply.reactions.push({ user: userId, emoji });
    }

    await review.save();
    return res.status(200).json(new ApiResponse(200, reply.reactions, 'Reply reaction updated'));
});

// 5. GET REVIEWS
const getRecipeReviews = asyncHandler(async (req, res) => {
    const { recipeId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ recipe: recipeId })
        .populate('author', 'username avatar')
        .populate('replies.author', 'username avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    return res.status(200).json(new ApiResponse(200, reviews, 'Reviews fetched'));
});

// For backward compatibility if frontend still calls toggleReviewLike
const toggleReviewLike = toggleReviewReaction;

export {
    addReview,
    getRecipeReviews,
    addReply,
    toggleReviewLike, // keeping export to avoid breaking imports
    toggleReviewReaction,
    toggleReplyReaction,
};
