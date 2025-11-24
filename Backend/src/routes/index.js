import { Router } from "express";
import userRouter from "./user.routes.js";
import recipeRouter from "./recipe.routes.js";
import reviewRouter from "./review.routes.js";

const router = Router();

router.use("/users", userRouter);
router.use('/recipes', recipeRouter);

export default router;