import { Router } from 'express';
import passport from 'passport';
import {
  loginUser,
  logoutUser,
  registerUser,
  verifyUserOtp,
  handleSocialLogin,
  refreshAccessToken,
  updateUserAvatar,
  updateAccountDetails,
  updateUserCoverImage,
  getTopChefs,
  getUserChannelProfileById,
  forgotPassword,
  resetPassword,
} from '../controllers/user.controller.js';
import { optionalAuth, verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();
const clientURL = process.env.CLIENT_URL;

const checkStrategy = (strategyName) => (req, res, next) => {
  // Check if passport has this strategy registered
  const strategy = passport._strategy(strategyName);
  if (!strategy) {
    console.error(
      `❌ Error: ${strategyName} strategy not initialized. Check .env keys.`
    );
    return res.status(500).json({
      message: `${strategyName} login is not configured on the server.`,
    });
  }
  next();
};

router.route('/register').post(registerUser);
router.route('/verify-otp').post(verifyUserOtp);
router.route('/login').post(loginUser);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/community').get(getTopChefs);

router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:token').post(resetPassword);

//secure route
router.route('/logout').post(verifyJWT, logoutUser);
// --- Social Auth Routes ---

// Google
router.route('/google').get(
  checkStrategy('google'), // ✅ Safe Check
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.route('/google/callback').get(
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${clientURL}/login`,
  }),
  handleSocialLogin
);

// Facebook
router.route('/facebook').get(
  checkStrategy('facebook'), // ✅ Safe Check
  passport.authenticate('facebook', { scope: ['email'] })
);

router.route('/facebook/callback').get(
  passport.authenticate('facebook', {
    session: false,
    failureRedirect: `${clientURL}/login`,
  }),
  handleSocialLogin
);

router
  .route('/avatar')
  .patch(verifyJWT, upload.single('avatar'), updateUserAvatar);
router.route('/update-account').patch(verifyJWT, updateAccountDetails);
router
  .route('/cover-image')
  .patch(verifyJWT, upload.single('coverImage'), updateUserCoverImage);
router.route('/c/id/:userId').get(optionalAuth, getUserChannelProfileById);

export default router;
