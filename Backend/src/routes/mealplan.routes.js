import { Router } from 'express';
import { addToMealPlan, getWeeklyPlan, removeFromMealPlan } from '../controllers/mealplan.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(verifyJWT); // Protect all routes

router.route('/').get(getWeeklyPlan);
router.route('/add').post(addToMealPlan);
router.route('/:planId').delete(removeFromMealPlan);

export default router;
