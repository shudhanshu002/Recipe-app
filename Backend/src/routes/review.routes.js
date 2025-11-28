import { Router } from 'express';
import { addReview, getRecipeReviews } from '../controllers/review.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Allow anyone to see reviews, but only logged in users can add them
router.route('/:recipeId').get(getRecipeReviews);
router.route('/:recipeId').post(verifyJWT, addReview);

export default router;
