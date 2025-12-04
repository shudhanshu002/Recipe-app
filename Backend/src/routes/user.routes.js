import { Router } from "express";
import passport from "passport";
import { loginUser, logoutUser, registerUser, verifyUserOtp, handleSocialLogin, refreshAccessToken, updateUserAvatar, updateAccountDetails, updateUserCoverImage, getTopChefs } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

const checkStrategy = (strategyName) => (req, res, next) => {
    // Check if passport has this strategy registered
    const strategy = passport._strategy(strategyName);
    if (!strategy) {
        console.error(`❌ Error: ${strategyName} strategy not initialized. Check .env keys.`);
        return res.status(500).json({
            message: `${strategyName} login is not configured on the server.`,
        });
    }
    next();
};

router.route("/register").post(registerUser);
router.route("/verify-otp").post(verifyUserOtp);
router.route("/login").post(loginUser);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/community').get(getTopChefs);

//secure route
router.route("/logout").post(verifyJWT, logoutUser);


// --- SOCIAL LOGIN ROUTES ---

// 1. Trigger Google Login
// router.route("/google").get(
//     passport.authenticate("google", { scope: ["profile", "email"] })
// );

// 2. Google Callback
// router.route("/google/callback").get(
//     passport.authenticate("google", { session: false, failureRedirect: "/login" }),
//     handleSocialLogin
// );

// 3. Trigger Facebook Login
// router.route("/facebook").get(
//     passport.authenticate("facebook", { scope: ["email"] })
// );

// 4. Facebook Callback
// router.route("/facebook/callback").get(
//     passport.authenticate("facebook", { session: false, failureRedirect: "/login" }),
//     handleSocialLogin
// );


// --- Social Auth Routes ---

// Google
router.route("/google").get(
    checkStrategy('google'), // ✅ Safe Check
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.route("/google/callback").get(
    passport.authenticate("google", { session: false, failureRedirect: "http://localhost:5173/login" }),
    handleSocialLogin
);

// Facebook
router.route("/facebook").get(
    checkStrategy('facebook'), // ✅ Safe Check
    passport.authenticate("facebook", { scope: ["email"] })
);

router.route("/facebook/callback").get(
    passport.authenticate("facebook", { session: false, failureRedirect: "http://localhost:5173/login" }),
    handleSocialLogin
);

router.route('/avatar').patch(verifyJWT, upload.single('avatar'), updateUserAvatar);
router.route('/update-account').patch(verifyJWT, updateAccountDetails);
router.route('/cover-image').patch(verifyJWT, upload.single('coverImage'), updateUserCoverImage);

export default router;