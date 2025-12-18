import { Router } from 'express';
import {
  toggleRecipeLike,
  toggleReviewLike,
  getLikedRecipes,
} from '../controllers/like.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(verifyJWT);

router.route('/toggle/r/:recipeId').post(toggleRecipeLike);
router.route('/toggle/c/:reviewId').post(toggleReviewLike);
router.route('/videos').get(getLikedRecipes);

export default router;
