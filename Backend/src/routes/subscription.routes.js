import { Router } from "express";
import { optionalAuth, verifyJWT } from "../middlewares/auth.middleware.js";
import { getUserChannelProfile, toggleSubscription, getUserFollowers, getUserFollowing } from "../controllers/subscription.controller.js";



const router = Router();

router.route("/c/:username").get(optionalAuth, getUserChannelProfile);
router.route("/c/:channelId").post(verifyJWT,toggleSubscription);
router.route('/followers/:channelId').get(getUserFollowers);
router.route('/following/:subscriberId').get(optionalAuth, getUserFollowing);

export default router;