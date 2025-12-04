import { Recipe } from '../models/recipe.model.js';
import { Like } from '../models/like.model.js';
import { Review } from '../models/review.model.js';
import { Bookmark } from '../models/bookmark.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

// 1. CREATE RECIPE (Standard)
const createRecipe = asyncHandler(async (req, res) => {
    const { title, description, ingredients, instructions, difficulty, cuisine, mainIngredient, isPremium, dietaryTags, cookingTime, calories } = req.body;

    if ([title, description, instructions, difficulty, cuisine].some((field) => field?.trim() === '')) {
        throw new ApiError(400, 'All fields are required');
    }

    const imageFiles = req.files?.images;
    if (!imageFiles || imageFiles.length === 0) {
        throw new ApiError(400, 'At least one recipe image is required');
    }

    const imagesLocalPaths = imageFiles.map((file) => file.path);
    const uploadPromises = imagesLocalPaths.map((path) => uploadOnCloudinary(path));
    const imageResponses = await Promise.all(uploadPromises);
    const imageUrls = imageResponses.filter((img) => img !== null).map((img) => img.url);

    let videoUrl = '';
    if (req.files?.video?.[0]) {
        const videoResponse = await uploadOnCloudinary(req.files.video[0].path);
        if (videoResponse) videoUrl = videoResponse.url;
    }

    let videoThumbnail = '';
    if (req.files?.videoThumbnail?.[0]) {
        const thumbResponse = await uploadOnCloudinary(req.files.videoThumbnail[0].path);
        if (thumbResponse) videoThumbnail = thumbResponse.url;
    } else if (videoUrl) {
        // If no thumbnail provided but video exists, use first image as fallback or Cloudinary auto-thumbnail
        // Here we just default to empty string, frontend will handle fallback to recipe image[0]
    }

    const ingredientsArray = Array.isArray(ingredients) ? ingredients : ingredients.split(',');

    const recipe = await Recipe.create({
        title,
        description,
        ingredients: ingredientsArray,
        mainIngredient,
        instructions,
        difficulty,
        cuisine,
        videoThumbnail,
        isPremium: isPremium === 'true',
        images: imageUrls,
        videoUrl,
        createdBy: req.user._id,
        dietaryTags: dietaryTags ? dietaryTags.split(',') : [],
        cookingTime: parseInt(cookingTime) || 30,
        calories: parseInt(calories) || 0,
        viewedBy: [],
        views: 0,
    });

    return res.status(201).json(new ApiResponse(201, recipe, 'Recipe created'));
});

// 2. GET SINGLE RECIPE (✅ FIXED: Smart View Counting)
const getRecipeById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user ? req.user._id : null;

    let recipe = await Recipe.findById(id);
    if (!recipe) throw new ApiError(404, 'Recipe not found');

    // View Logic
    if (userId) {
        // Logged In: Check if unique
        const alreadyViewed = recipe.viewedBy.includes(userId);
        if (!alreadyViewed) {
            // Increment view and add user ID
            recipe = await Recipe.findByIdAndUpdate(
                id,
                {
                    $push: { viewedBy: userId },
                    $inc: { views: 1 },
                },
                { new: true },
            ).populate('createdBy', 'username avatar about');
        } else {
            // Just fetch without incrementing
            recipe = await Recipe.findById(id).populate('createdBy', 'username avatar about');
        }
    } else {
        // Guest: Always increment
        recipe = await Recipe.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true }).populate('createdBy', 'username avatar about');
    }

    // Interactions
    let isLiked = false;
    let isBookmarked = false;
    if (userId) {
        const like = await Like.findOne({ recipe: id, likedBy: userId });
        const bookmark = await Bookmark.findOne({ recipe: id, user: userId });
        isLiked = !!like;
        isBookmarked = !!bookmark;
    }
    const likesCount = await Like.countDocuments({ recipe: id });

    // Premium Check
    if (recipe.isPremium) {
        if (!req.user || !req.user.isSubscriptionActive) {
            return res.status(403).json(
                new ApiResponse(
                    403,
                    {
                        ...recipe.toObject(),
                        instructions: 'Locked',
                        isLiked,
                        isBookmarked,
                        likesCount,
                    },
                    'Premium Content',
                ),
            );
        }
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                ...recipe.toObject(),
                isLiked,
                isBookmarked,
                likesCount,
            },
            'Fetched',
        ),
    );
});

// 3. GET ALL RECIPES (✅ Return explicit 'views' field)
const getAllRecipes = asyncHandler(async (req, res) => {
    const { search, cuisine, mainIngredient, sort } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userId = req.user ? req.user._id : null;

    const query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    if (cuisine && cuisine !== 'All') query.cuisine = cuisine;
    if (mainIngredient) query.mainIngredient = { $regex: mainIngredient, $options: 'i' };

    let sortOptions = { createdAt: -1 };
    if (sort === 'name_asc') sortOptions = { title: 1 };
    else if (sort === 'name_desc') sortOptions = { title: -1 };
    else if (sort === 'oldest') sortOptions = { createdAt: 1 };

    let recipes = await Recipe.find(query).sort(sortOptions).skip(skip).limit(limit).select('-instructions -videoUrl').populate('createdBy', 'username avatar').lean();

    const recipeIds = recipes.map((r) => r._id);

    const likeCounts = await Like.aggregate([{ $match: { recipe: { $in: recipeIds } } }, { $group: { _id: '$recipe', count: { $sum: 1 } } }]);
    const likeMap = {};
    likeCounts.forEach((item) => {
        likeMap[item._id.toString()] = item.count;
    });

    let likedRecipeIds = new Set();
    let bookmarkedRecipeIds = new Set();
    if (userId) {
        const userLikes = await Like.find({ recipe: { $in: recipeIds }, likedBy: userId });
        const userBookmarks = await Bookmark.find({ recipe: { $in: recipeIds }, user: userId });
        likedRecipeIds = new Set(userLikes.map((l) => l.recipe.toString()));
        bookmarkedRecipeIds = new Set(userBookmarks.map((b) => b.recipe.toString()));
    }

    recipes = recipes.map((recipe) => ({
        ...recipe,
        likesCount: likeMap[recipe._id.toString()] || 0,
        isLiked: likedRecipeIds.has(recipe._id.toString()),
        isBookmarked: bookmarkedRecipeIds.has(recipe._id.toString()),
        // No change needed here if 'views' is in DB, .lean() returns it automatically
    }));

    const total = await Recipe.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                recipes,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalRecipes: total,
            },
            'Fetched',
        ),
    );
});

// 4. DELETE RECIPE
const deleteRecipe = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const recipe = await Recipe.findById(id);
    if (!recipe) throw new ApiError(404, 'Recipe not found');
    if (recipe.createdBy.toString() !== req.user._id.toString()) throw new ApiError(403, 'Unauthorized');

    await Promise.all([Like.deleteMany({ recipe: id }), Review.deleteMany({ recipe: id }), Bookmark.deleteMany({ recipe: id })]);
    await Recipe.findByIdAndDelete(id);
    return res.status(200).json(new ApiResponse(200, {}, 'Deleted'));
});

export { createRecipe, getRecipeById, getAllRecipes, deleteRecipe };
