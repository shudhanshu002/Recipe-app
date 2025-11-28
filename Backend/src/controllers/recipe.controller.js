import { Recipe } from '../models/recipe.model.js';
import { Like } from '../models/like.model.js';
import { Review } from '../models/review.model.js';
import { Bookmark } from '../models/bookmark.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';


const createRecipe = asyncHandler(async (req, res) => {
    console.log('--- START CREATING RECIPE ---');
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    const { title, description, ingredients, instructions, difficulty, cuisine, mainIngredient, isPremium, dietaryTags, cookingTime, calories } = req.body;

    if ([title, description, instructions, difficulty, cuisine].some((f) => f.trim === '')) {
        throw new ApiError(400, 'All fields are required');
    }

    const imageFiles = req.files?.images;
    if (!imageFiles || imageFiles.length === 0) {
        throw new ApiError(400, 'At least one recipe image is required');
    }

    console.log(`Processing ${imageFiles.length} images...`);

    const imageLocalPaths = imageFiles.map((file) => file.path);
    const uploadPromises = imageLocalPaths.map((path) => uploadOnCloudinary(path));
    const imageResponses = await Promise.all(uploadPromises);

    const imageUrls = imageResponses.filter((img) => img !== null).map((img) => img.url);

    console.log('--- GENERATED IMAGE URLS ---');
    console.log(imageUrls); // <--- CHECK THIS LOG IN TERMINAL

    if (imageUrls.length === 0) {
        throw new ApiError(500, 'Failed to upload images');
    }

    let videoUrl = '';
    const videoLocalPath = req.files?.video?.[0]?.path;

    if (videoLocalPath) {
        const videoResponse = await uploadOnCloudinary(videoLocalPath);
        if (videoResponse) {
            videoUrl = videoResponse.url; // get url string
        }
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
        images: imageUrls,
        videoUrl: videoUrl,
        createdBy: req.user._id,
        dietaryTags: dietaryTags ? dietaryTags.split(',').map((t) => t.trim()) : [],
        cookingTime: cookingTime || 30,
        calories: calories || 0,
    });

    console.log(recipe);

    return res.status(201).json(new ApiResponse(201, recipe, 'Recipe created'));
});


const getRecipeById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const recipe = await Recipe.findById(id).populate('createdBy', 'username avatar about');

  if (!recipe) {
    throw new ApiError(404, 'Recipe not found');
  }

  // --- PREMIUM ---
  if(recipe.isPremium){
    if(!req.user || !req.user.isSubscriptionActive) {
      return res.status(403).json(new ApiResponse(403, {
        _id: recipe._id,
        title: recipe.title,
        description: recipe.description,
        images: [recipe.images[0]],
        difficulty: recipe.difficulty,
        cuisine: recipe.cuisine,
        isPremium: true,
        message: "This is a Premium Recipe. Please upgrade to view instruction and video"
      },"Premium - content- Access- Denied"));
    }
  }

  return res.status(200).json(new ApiResponse(200, recipe, 'Recipe fetched successfully'));
});



const getAllRecipes = asyncHandler(async (req, res) => {
  try {
    const {
      search,
      cuisine,
      mainIngredient, // Sort by "Chicken", "Paneer", etc.
      sort,
    } = req.query;
  
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
  
    const query = {};
  
    if (search) query.title = { $regex: search, $options: 'i' };
    if (cuisine && cuisine !== 'All') query.cuisine = cuisine;
  
    
    if (mainIngredient) {
      query.mainIngredient = { $regex: mainIngredient, $options: 'i' };
    }
  
    
    let sortOptions = { createdAt: -1 };
  
    if (sort === 'name_asc') {
      sortOptions = { title: 1 };
    } else if (sort === 'name_desc') {
      sortOptions = { title: -1 };
    } else if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    }
  
    console.log('Fetching recipes with query:', JSON.stringify(query));
  
    const recipes = await Recipe.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .select('-instructions -videoUrl') // Optimize: Don't send heavy data
        .populate('createdBy', 'username avatar'); // Get Author details
  
    const total = await Recipe.countDocuments(query);
  
    return res.status(200).json(
      new ApiResponse(200, {
        recipes,
        currentPage: page,
        totalPages: Math.ceil(total/limit),
        totalRecipes: total
      }, "Recipes fetched successfully")
    );
  } catch (error) {
    console.error('ERROR IN GET ALL RECIPES:', error);
    throw new ApiError(500, 'Server Error while fetching recipes');
  }
});


const deleteRecipe = asyncHandler(async(req, res)=> {
  const {id} = req.params;
  const recipe = await Recipe.findById(id);

  if(!recipe) {
    throw new ApiError(404, "Recipe not found");
  }

  if(recipe.createdBy.toString() !== req.user._id.toString()){
    throw new ApiError(403, "You are not allowed to delete this recipe");
  }

  await Promise.all([
    Like.deleteMany({recipe: id}),
    Review.deleteMany({recipe: id}),
    Bookmark.deleteMany({ recipe: id})
  ]);

  await Recipe.findByIdAndDelete(id);

  return res.status(200).json(
    new ApiResponse(200, {}, "Recipe and all  associated data deleted successfully")
  );
})

export { 
  createRecipe, 
  getRecipeById, 
  getAllRecipes,
  deleteRecipe 
};
