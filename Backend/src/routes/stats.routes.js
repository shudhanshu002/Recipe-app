import { Router } from 'express';
import { getCuisineStats, getIngredientStats, getDashboardStats } from '../controllers/stats.controller.js';

const router = Router();

// Public stats for sidebar
router.route('/cuisines').get(getCuisineStats);
router.route('/ingredients').get(getIngredientStats);

// General platform stats
router.route('/overview').get(getDashboardStats);

export default router;
