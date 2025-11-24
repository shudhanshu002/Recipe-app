import { Recipe } from '../models/recipe.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

// 1. CREATE RECIPE (With Video & Premium Flag)
const createRecipe = asyncHandler(async (req, res) => {
  const { title, description, ingredients, instructions, difficulty, cuisine, mainIngredient, isPremium } = req.body;

  // Handle Files (Image & Video)
  // req.files is used because we are uploading multiple fields
  const imageLocalPath = req.files?.image?.[0]?.path;
  const videoLocalPath = req.files?.video?.[0]?.path;

  if (!imageLocalPath) {
    throw new ApiError(400, 'Recipe image is required');
  }

  const image = await uploadOnCloudinary(imageLocalPath);

  let video = null;
  if (videoLocalPath) {
    video = await uploadOnCloudinary(videoLocalPath);
  }

  const ingredientsArray = Array.isArray(ingredients) ? ingredients : ingredients.split(',').map((i) => i.trim());

  const recipe = await Recipe.create({
    title,
    description,
    ingredients: ingredientsArray,
    mainIngredient: mainIngredient || ingredientsArray[0], // Default to first ingredient if not specified
    instructions,
    difficulty,
    cuisine,
    isPremium: isPremium === 'true', // Convert string to boolean
    imageUrl: image.url,
    videoUrl: video?.url || '',
    createdBy: req.user._id,
  });

  return res.status(201).json(new ApiResponse(201, recipe, 'Recipe created'));
});

// 2. GET SINGLE RECIPE (With Premium Lock Logic)
const getRecipeById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const recipe = await Recipe.findById(id).populate('createdBy', 'username avatar about');

  if (!recipe) {
    throw new ApiError(404, 'Recipe not found');
  }

  // --- PREMIUM LOGIC ---
  if (recipe.isPremium) {
    // If user is not logged in OR user is not premium
    if (!req.user || !req.user.isSubscriptionActive) {
      // We return restricted data (blurry preview logic for frontend)
      return res.status(403).json(
        new ApiResponse(
          403,
          {
            title: recipe.title,
            description: recipe.description,
            isPremium: true,
            message: 'This is a Premium Recipe. Please upgrade to view instructions and video.',
          },
          'Premium Content - Access Denied',
        ),
      );
    }
  }

  return res.status(200).json(new ApiResponse(200, recipe, 'Recipe fetched'));
});

// 3. GET ALL RECIPES (With Advanced Sorting)
const getAllRecipes = asyncHandler(async (req, res) => {
  const {
    search,
    cuisine,
    mainIngredient, // Sort by "Chicken", "Paneer", etc.
    sort,
    page = 1,
    limit = 10,
  } = req.query;

  const query = {};

  if (search) query.title = { $regex: search, $options: 'i' };
  if (cuisine) query.cuisine = cuisine;

  // Filter by Main Ingredient
  if (mainIngredient) {
    query.mainIngredient = { $regex: mainIngredient, $options: 'i' };
  }

  // Sorting Logic
  let sortOptions = { createdAt: -1 };

  if (sort === 'name_asc') {
    sortOptions = { title: 1 };
  } else if (sort === 'name_desc') {
    sortOptions = { title: -1 };
  } else if (sort === 'oldest') {
    sortOptions = { createdAt: 1 };
  }

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };
  const skip = (options.page - 1) * options.limit;

  const recipes = await Recipe.find(query).sort(sortOptions).skip(skip).limit(options.limit).select('-instructions -videoUrl'); // Optimize list view (don't send heavy data)

  return res.status(200).json(new ApiResponse(200, recipes, 'Recipes fetched'));
});

export { createRecipe, getRecipeById, getAllRecipes };
