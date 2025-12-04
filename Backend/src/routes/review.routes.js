import { Router } from 'express';
import {
    addReview,
    getRecipeReviews,
    addReply,
    toggleReviewReaction,
    toggleReplyReaction,
    toggleReviewLike,
    toggleReplyLike, // ✅ Ensure this is imported
} from '../controllers/review.controller.js';
import { verifyJWT, optionalAuth } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.route('/:recipeId').get(optionalAuth, getRecipeReviews).post(verifyJWT, upload.single('media'), addReview);

router.route('/:reviewId/reply').post(verifyJWT, upload.single('media'), addReply);

// Reaction Routes
router.route('/:reviewId/react').post(verifyJWT, toggleReviewReaction);
router.route('/:reviewId/replies/:replyId/react').post(verifyJWT, toggleReplyReaction);

// Legacy Like Routes (for compatibility if frontend calls these)
router.route('/:reviewId/like').post(verifyJWT, toggleReviewLike);
router.route('/:reviewId/replies/:replyId/like').post(verifyJWT, toggleReplyLike);

export default router;
