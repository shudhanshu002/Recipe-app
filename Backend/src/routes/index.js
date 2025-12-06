import { Router } from "express";


import userRouter from "./user.routes.js";
import recipeRouter from "./recipe.routes.js";
import reviewRouter from "./review.routes.js";
import bookmarkRouter from "./bookmark.routes.js"
import statsRouter from "./stats.routes.js";
import subscriptionRouter from "./subscription.routes.js";
import likeRouter from "./like.routes.js";
import notificationRouter from "./notification.routes.js";
import mealPlanRouter from "./mealplan.routes.js";
import shoppingListRouter from "./shoppinglist.routes.js"
import shortRouter from './short.routes.js';
import blogRouter from './blog.routes.js';
import aiRouter from './ai.routes.js';


import paymentRouter from './payment.routes.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.use("/users", userRouter);
router.use("/recipes", recipeRouter);
router.use("/reviews", reviewRouter);
router.use("/bookmarks",bookmarkRouter);
router.use("/stats", statsRouter);
router.use("/likes", likeRouter);
router.use("/subscriptions",subscriptionRouter);
router.use("/notifications",notificationRouter);
router.use("/mealplanner", mealPlanRouter); 
router.use("/shoppinglist", shoppingListRouter);
router.use("/shorts", shortRouter);
router.use('/blogs', blogRouter);
router.use('/ai', aiRouter);
// Payment
router.use('/payment', paymentRouter);

export default router;