import { Recipe } from '../models/recipe.model.js';
import { Like } from '../models/like.model.js';
import { Review } from '../models/review.model.js';
import { Bookmark } from '../models/bookmark.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';


const createRecipe = asyncHandler(async (req, res) => {
    const { title, description, ingredients, instructions, difficulty, cuisine, mainIngredient, isPremium, dietaryTags, cookingTime, calories } = req.body;

    if ([title, description, instructions, difficulty, cuisine].some((f) => f.trim === '')) {
        throw new ApiError(400, 'All fields are required');
    }

    const imageFiles = req.files?.images;
    if (!imageFiles || imageFiles.length === 0) {
        throw new ApiError(400, 'At least one recipe image is required');
    }

    let imageUrls = [];
    try {
        const imagesLocalPaths = imageFiles.map((file) => file.path);
        const uploadPromises = imagesLocalPaths.map((path) => uploadOnCloudinary(path));
        const imageResponses = await Promise.all(uploadPromises);

        imageUrls = imageResponses.filter((img) => img !== null).map((img) => img.url);

        if (imageUrls.length === 0) throw new Error('All image uploads failed');
    } catch (error) {
        console.error('Image Upload Failed:', error);
        throw new ApiError(500, 'Failed to upload images');
    }

    let videoUrl = '';
    const videoFile = req.files?.video?.[0];

    if (videoFile) {
        try {
            console.log('Attempting to upload video:', videoFile.path);
            const videoResponse = await uploadOnCloudinary(videoFile.path);

            if (videoResponse) {
                videoUrl = videoResponse.url;
                console.log('Video uploaded successfully:', videoUrl);
            } else {
                console.error('Video upload returned null (check Cloudinary logs)');
            }
        } catch (error) {
            console.error('Video Upload Critical Fail:', error);
        }
    }

    const ingredientsArray = Array.isArray(ingredients) ? ingredients : ingredients.split(',').map((i) => i.trim());

    let parsedCookingTime = parseInt(cookingTime);
    if (isNaN(parsedCookingTime)) parsedCookingTime = 30;

    let parsedCalories = parseInt(calories);
    if (isNaN(parsedCalories)) parsedCalories = 0;

    const parsedTags = dietaryTags ? (Array.isArray(dietaryTags) ? dietaryTags : dietaryTags.split(',')) : [];

    const recipe = await Recipe.create({
        title,
        description,
        ingredients: ingredientsArray,
        mainIngredient: mainIngredient || ingredientsArray[0],
        instructions,
        difficulty,
        cuisine,
        isPremium: isPremium === 'true',
        images: imageUrls,
        videoUrl: videoUrl,
        createdBy: req.user._id,
        dietaryTags: parsedTags,
        cookingTime: parsedCookingTime,
        calories: parsedCalories,
    });

    return res.status(201).json(new ApiResponse(201, recipe, 'Recipe created'));
});


const getRecipeById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user ? req.user._id : null;

  const recipe = await Recipe.findById(id).populate('createdBy', 'username avatar about');

  if (!recipe) {
    throw new ApiError(404, 'Recipe not found');
  }

  let isLiked = false;
  let isBookmarked = false;

  if (userId) {
      const like = await Like.findOne({ recipe: id, likedBy: userId });
      const bookmark = await Bookmark.findOne({ recipe: id, user: userId });
      isLiked = !!like;
      isBookmarked = !!bookmark;
  }

  // --- PREMIUM ---
  if (recipe.isPremium && (!req.user || !req.user.isSubscriptionActive)) {
      return res.status(403).json(
          new ApiResponse(
              403,
              {
                  ...recipe.toObject(),
                  instructions: 'Locked',
                  isLiked, 
                  isBookmarked, 
              },
              'Premium Content',
          ),
      );
  }

  return res.status(200).json(
      new ApiResponse(
          200,
          {
              ...recipe.toObject(),
              isLiked,
              isBookmarked, 
          },
          'Fetched',
      ),
  );
});



const getAllRecipes = asyncHandler(async (req, res) => {
  try {
    const {
      search,
      cuisine,
      mainIngredient,
      sort,
    } = req.query;
  
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userId = req.user ? req.user._id : null;
  
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
        .select('-instructions -videoUrl') 
        .populate('createdBy', 'username avatar')
        .lean(); 
    

    if (userId) {
        const recipeIds = recipes.map((r) => r._id);

        
        const userLikes = await Like.find({ recipe: { $in: recipeIds }, likedBy: userId });
        const userBookmarks = await Bookmark.find({ recipe: { $in: recipeIds }, user: userId });

        const likedRecipeIds = new Set(userLikes.map((l) => l.recipe.toString()));
        const bookmarkedRecipeIds = new Set(userBookmarks.map((b) => b.recipe.toString()));

        
        recipes.forEach((recipe) => {
            recipe.isLiked = likedRecipeIds.has(recipe._id.toString());
            recipe.isBookmarked = bookmarkedRecipeIds.has(recipe._id.toString());
        });
    }

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
