import { Review } from '../models/review.model.js';
import { Recipe } from '../models/recipe.model.js';
import { Notification } from '../models/notification.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

// 1. ADD OR UPDATE REVIEW
const addReview = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;
  const { content, rating } = req.body;

  const mediaLocalPath = req.file?.path;
  let mediaUrl = '';

  if (mediaLocalPath) {
    const uploaded = await uploadOnCloudinary(mediaLocalPath);
    if (uploaded) mediaUrl = uploaded.url;
  }

  if (!rating && !content) {
    throw new ApiError(400, 'Content or rating is required');
  }

  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    throw new ApiError(404, 'Recipe not found');
  }

  if (recipe.createdBy.toString() === req.user._id.toString()) {
    throw new ApiError(403, 'You cannot rate your own recipe');
  }

  let review = await Review.findOne({ recipe: recipeId, author: req.user._id });

  if (review) {
    if (rating) review.rating = rating;
    if (content) review.content = content;
    if (mediaUrl) review.media = mediaUrl;
    await review.save();
  } else {
    if (!rating && !content)
      throw new ApiError(400, 'Rating is required for new review');

    review = await Review.create({
      content: content || 'Rated via star click',
      rating: rating || 0,
      recipe: recipeId,
      author: req.user._id,
      media: mediaUrl,
      reactions: [],
    });

    // Notify Author
    if (recipe.createdBy.toString() !== req.user._id.toString()) {
      try {
        await Notification.create({
          recipient: recipe.createdBy,
          sender: req.user._id,
          type: 'COMMENT',
          recipe: recipe._id,
        });
      } catch (e) {
        console.log('Notification failed', e);
      }
    }
  }

  // Update Average Rating
  const stats = await Review.aggregate([
    { $match: { recipe: recipe._id, rating: { $gt: 0 } } },
    { $group: { _id: '$recipe', avgRating: { $avg: '$rating' } } },
  ]);

  if (stats.length > 0) {
    recipe.averageRating = parseFloat(stats[0].avgRating.toFixed(1));
    await recipe.save({ validateBeforeSave: false });
  }

  const populatedReview = await Review.findById(review._id).populate(
    'author',
    'username avatar'
  );
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        populatedReview,
        review ? 'Review updated' : 'Review added'
      )
    );
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

  const reply = {
    content,
    author: req.user._id,
    media: mediaUrl,
    parentId: parentId || null,
    likes: [],
    createdAt: new Date(),
  };

  review.replies.push(reply);
  await review.save();

  if (review.author.toString() !== req.user._id.toString()) {
    try {
      await Notification.create({
        recipient: review.author,
        sender: req.user._id,
        type: 'COMMENT',
        recipe: review.recipe,
      });
    } catch (e) {
      console.error(e);
    }
  }

  return res.status(201).json(new ApiResponse(201, review, 'Reply added'));
});

// 3. TOGGLE REVIEW LIKE (Main Comment)
const toggleReviewLike = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  const review = await Review.findById(reviewId);
  if (!review) throw new ApiError(404, 'Review not found');

  const isLiked = review.likes.includes(userId);
  if (isLiked) {
    review.likes.pull(userId);
  } else {
    review.likes.push(userId);
    if (review.author.toString() !== userId.toString()) {
      try {
        await Notification.create({
          recipient: review.author,
          sender: userId,
          type: 'LIKE_RECIPE',
          recipe: review.recipe,
        });
      } catch (e) {
        console.error(e);
      }
    }
  }

  await review.save();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isLiked: !isLiked, likesCount: review.likes.length },
        'Like toggled'
      )
    );
});

// 4. TOGGLE REPLY LIKE
const toggleReplyLike = asyncHandler(async (req, res) => {
  const { reviewId, replyId } = req.params;
  const userId = req.user._id;

  const review = await Review.findById(reviewId);
  if (!review) throw new ApiError(404, 'Review not found');

  const reply = review.replies.id(replyId);
  if (!reply) throw new ApiError(404, 'Reply not found');

  const isLiked = reply.likes.includes(userId);
  if (isLiked) {
    reply.likes.pull(userId);
  } else {
    reply.likes.push(userId);
  }

  await review.save();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isLiked: !isLiked, likesCount: reply.likes.length },
        'Reply like toggled'
      )
    );
});

// 5. GET REVIEWS
const getRecipeReviews = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;
  const reviews = await Review.find({ recipe: recipeId })
    .populate('author', 'username avatar')
    .populate('replies.author', 'username avatar')
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, reviews, 'Reviews fetched'));
});

const toggleReviewReaction = toggleReviewLike;
const toggleReplyReaction = toggleReplyLike;

export {
  addReview,
  getRecipeReviews,
  addReply,
  toggleReviewLike,
  toggleReplyLike,
  toggleReviewReaction,
  toggleReplyReaction,
};
