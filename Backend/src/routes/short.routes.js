import { Router } from 'express';
import { addShort, getRecipeShorts } from '../controllers/short.controller.js';
import { verifyJWT, optionalAuth } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.route('/:recipeId').get(optionalAuth, getRecipeShorts);
router.route('/:recipeId').post(verifyJWT, upload.single('video'), addShort);

export default router;
