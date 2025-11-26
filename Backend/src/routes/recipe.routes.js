import { Router } from 'express';
import { createRecipe, getAllRecipes, getRecipeById, deleteRecipe } from '../controllers/recipe.controller.js';
import { verifyJWT, optionalAuth } from '../middlewares/auth.middleware.js'; // Import optionalAuth
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.route('/').get(getAllRecipes);


router.route('/:id')
  .get(optionalAuth, getRecipeById)
  .delete(verifyJWT, deleteRecipe);

router.route('/').post(
  verifyJWT,
  upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'video', maxCount: 1 },
  ]),
  createRecipe,
);

export default router;
