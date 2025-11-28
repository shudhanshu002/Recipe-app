import { Router } from "express";
import { optionalAuth, verifyJWT } from "../middlewares/auth.middleware.js";
import { getUserChannelProfile, toggleSubscription } from "../controllers/subscription.controller.js";



const router = Router();

router.route("/c/:username").get(optionalAuth, getUserChannelProfile);
router.route("/c/:channelId").post(verifyJWT,toggleSubscription);

export default router;