import { Recipe } from '../models/recipe.model.js';
import { Like } from '../models/like.model.js';
import { Review } from '../models/review.model.js';
import { Bookmark } from '../models/bookmark.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { User } from '../models/user.model.js';

// 1. CREATE RECIPE 
const createRecipe = asyncHandler(async (req, res) => {
    const { title, description, ingredients, instructions, difficulty, cuisine, mainIngredient, isPremium, isVegetarian, dietaryTags, cookingTime, calories } = req.body;

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
        isVegetarian: isVegetarian === 'true',
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

// 2. GET SINGLE RECIPE 
const getRecipeById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user ? req.user._id : null;

    let recipe = await Recipe.findById(id);
    if (!recipe) throw new ApiError(404, 'Recipe not found');

    // View Logic
    if (userId) {
        const alreadyViewed = recipe.viewedBy.includes(userId);
        if (!alreadyViewed) {
            recipe = await Recipe.findByIdAndUpdate(
                id,
                {
                    $push: { viewedBy: userId },
                    $inc: { views: 1 },
                },
                { new: true },
            ).populate('createdBy', 'username avatar about');
        } else {
            recipe = await Recipe.findById(id).populate('createdBy', 'username avatar about');
        }
    } else {
        recipe = await Recipe.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true }).populate('createdBy', 'username avatar about');
    }

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
        const isPremiumUser = req.user && (req.user.isPremium === true || req.user.subscriptionStatus === 'premium');

        // Check 2: Is user the Creator? (Creator should always see their own recipe)
        const isCreator = req.user && recipe.createdBy && req.user._id.toString() === recipe.createdBy._id.toString();

        if (!isPremiumUser && !isCreator) {
            // Return 403 with partial data (so frontend can show preview)
            return res.status(403).json(
                new ApiResponse(
                    403,
                    {
                        ...recipe.toObject(),
                        instructions: null, 
                        videoUrl: null,
                        isLiked,
                        isBookmarked,
                        likesCount,
                        isLocked: true,
                    },
                    'Premium Content: Upgrade required',
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

// 3. GET ALL RECIPES 
const getAllRecipes = asyncHandler(async (req, res) => {
    const { search, cuisine, mainIngredient, sort, category, maxTime, difficulty } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userId = req.user ? req.user._id : null;

    const query = {};

    // Text Search
    if (search && search !== 'null' && search !== 'undefined') {
        query.title = { $regex: search, $options: 'i' };
    }

    // Standard Filters (Check for "null" string explicitly)
    if (cuisine && cuisine !== 'All' && cuisine !== 'null') query.cuisine = cuisine;
    if (mainIngredient && mainIngredient !== 'null') query.mainIngredient = { $regex: mainIngredient, $options: 'i' };
    if (difficulty && difficulty !== 'All' && difficulty !== 'null') query.difficulty = difficulty;

    // Time Filter: Only apply if it's a valid number
    if (maxTime && maxTime !== 'null' && !isNaN(parseInt(maxTime))) {
        query.cookingTime = { $lte: parseInt(maxTime) };
    }

    // Category/Diet Filters
    if (category && category !== 'null') {
        if (category === 'veg') query.isVegetarian = true;
        if (category === 'non-veg') query.isVegetarian = false;
        if (category === 'premium') query.isPremium = true;
        if (category === 'healthy') query.calories = { $lte: 500 };
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'name_asc') sortOptions = { title: 1 };
    else if (sort === 'name_desc') sortOptions = { title: -1 };
    else if (sort === 'oldest') sortOptions = { createdAt: 1 };
    else if (sort === 'popular') sortOptions = { views: -1 };

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

// 5. GET USER LIKED VIDEOS (New Function)
const getUserLikedVideos = asyncHandler(async (req, res) => {
    const likes = await Like.find({ likedBy: req.user._id });

    const recipeIds = likes.map((like) => like.recipe);

    const recipes = await Recipe.find({
        _id: { $in: recipeIds },
        videoUrl: { $ne: null, $ne: '' }, 
    })
        .select('title videoUrl videoThumbnail images cookingTime calories isPremium isVegetarian')
        .populate('createdBy', 'username avatar');

    return res.status(200).json(new ApiResponse(200, recipes, 'Liked videos fetched successfully'));
});

//  6. GET TOP CHEFS
const getTopChefs = asyncHandler(async (req, res) => {
    const stats = await Recipe.aggregate([
        {
            $group: {
                _id: "$createdBy",
                totalRecipes: { $sum: 1 },
                avgRating: { $avg: { $ifNull: ["$averageRating", 0] } },
                totalViews: { $sum: "$views" }
            }
        },
        { 
            $sort: { totalRecipes: -1, avgRating: -1 } 
        },
        { $limit: 8 }
    ]);

    if (!stats.length) {
        return res.status(200).json(new ApiResponse(200, [], "No chefs found"));
    }

    const userIds = stats.map(s => s._id);
    const users = await User.find({ _id: { $in: userIds } }).select("username avatar");

    const topChefs = stats.map(stat => {
        const user = users.find(u => u._id.toString() === stat._id.toString());
        
        if (!user) return null; 

        return {
            _id: user._id,
            username: user.username,
            avatar: user.avatar,
            totalRecipes: stat.totalRecipes,
            avgRating: parseFloat(stat.avgRating.toFixed(1)),
            totalViews: stat.totalViews
        };
    }).filter(chef => chef !== null);

    return res.status(200).json(new ApiResponse(200, topChefs, "Top chefs fetched"));
});

const getRecipeOfTheDay = asyncHandler(async (req, res) => {
    const matchStage = {};

    // If logged in, exclude own recipes
    if (req.user) {
        matchStage.createdBy = { $ne: req.user._id };
    }

    const recipe = await Recipe.aggregate([
        { $match: matchStage },
        { $sample: { size: 1 } },
        {
            $lookup: {
                from: 'users',
                localField: 'createdBy',
                foreignField: '_id',
                as: 'creator',
            },
        },
        { $unwind: '$creator' },
    ]);

    if (!recipe || recipe.length === 0) {
        return res.status(404).json(new ApiResponse(404, null, 'No recipes found'));
    }

    return res.status(200).json(new ApiResponse(200, recipe[0], 'Recipe of the Day'));
});

export { createRecipe, getRecipeById, getAllRecipes, deleteRecipe, getUserLikedVideos, getTopChefs , getRecipeOfTheDay};
