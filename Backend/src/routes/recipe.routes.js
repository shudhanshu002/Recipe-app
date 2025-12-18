import { Router } from 'express';
import {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  deleteRecipe,
  getUserLikedVideos,
  getTopChefs,
  getRecipeOfTheDay,
} from '../controllers/recipe.controller.js';
import { verifyJWT, optionalAuth } from '../middlewares/auth.middleware.js'; // Import optionalAuth
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.route('/').get(optionalAuth, getAllRecipes);
router.route('/user/liked-videos').get(verifyJWT, getUserLikedVideos);

router.route('/daily').get(getRecipeOfTheDay);
router.route('/top-chefs').get(getTopChefs);

router.route('/').post(
  verifyJWT,
  upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'video', maxCount: 1 },
    { name: 'videoThumbnail', maxCount: 1 },
  ]),
  createRecipe
);

router
  .route('/:id')
  .get(optionalAuth, getRecipeById)
  .delete(verifyJWT, deleteRecipe);

export default router;
