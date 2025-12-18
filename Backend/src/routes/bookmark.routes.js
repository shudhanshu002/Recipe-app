import { Router } from 'express';
import {
  toggleBookmark,
  getUserBookmarks,
} from '../controllers/bookmark.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.route('/:recipeId').post(toggleBookmark);
router.route('/').get(getUserBookmarks);

export default router;
