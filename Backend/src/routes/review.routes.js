import { Router } from 'express';
import { addReview, getRecipeReviews, addReply, toggleReviewReaction, toggleReplyReaction } from '../controllers/review.controller.js';
import { verifyJWT, optionalAuth } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js'; // Import

const router = Router();

router.route('/:recipeId').get(optionalAuth, getRecipeReviews).post(verifyJWT, upload.single('media'), addReview);

router.route('/:reviewId/reply').post(verifyJWT, upload.single('media'), addReply);

router.route('/:reviewId/react').post(verifyJWT, toggleReviewReaction);

router.route('/:reviewId/replies/:replyId/react').post(verifyJWT, toggleReplyReaction);

router.route('/:reviewId/like').post(verifyJWT, toggleReviewReaction);

export default router;
