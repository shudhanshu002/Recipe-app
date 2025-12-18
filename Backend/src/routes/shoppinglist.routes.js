import { Router } from 'express';
import {
  getShoppingList,
  addShoppingItem,
  toggleItemCheck,
  removeShoppingItem,
  addFromRecipe,
} from '../controllers/shoppinglist.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(verifyJWT); // Protect all routes

router.route('/').get(getShoppingList);
router.route('/add').post(addShoppingItem);
router.route('/add-from-recipe').post(addFromRecipe);
router.route('/:itemId/toggle').patch(toggleItemCheck);
router.route('/:itemId').delete(removeShoppingItem);

export default router;
