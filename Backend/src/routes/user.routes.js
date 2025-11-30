import { Router } from "express";
import passport from "passport";
import { loginUser, logoutUser, registerUser, verifyUserOtp, handleSocialLogin, refreshAccessToken, updateUserAvatar, updateAccountDetails, updateUserCoverImage } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/verify-otp").post(verifyUserOtp);
router.route("/login").post(loginUser);
router.route('/refresh-token').post(refreshAccessToken);

//secure route
router.route("/logout").post(verifyJWT, logoutUser);


// --- SOCIAL LOGIN ROUTES ---

// 1. Trigger Google Login
router.route("/google").get(
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// 2. Google Callback
router.route("/google/callback").get(
    passport.authenticate("google", { session: false, failureRedirect: "/login" }),
    handleSocialLogin
);

// 3. Trigger Facebook Login
router.route("/facebook").get(
    passport.authenticate("facebook", { scope: ["email"] })
);

// 4. Facebook Callback
router.route("/facebook/callback").get(
    passport.authenticate("facebook", { session: false, failureRedirect: "/login" }),
    handleSocialLogin
);

router.route('/avatar').patch(verifyJWT, upload.single('avatar'), updateUserAvatar);
router.route('/update-account').patch(verifyJWT, updateAccountDetails);
router.route('/cover-image').patch(verifyJWT, upload.single('coverImage'), updateUserCoverImage);

export default router;