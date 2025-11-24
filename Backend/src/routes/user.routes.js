import { Router } from "express";
import { loginUser, logoutUser, registerUser, verifyUserOtp } from "../controllers/user.controller.js";
import { verify } from "jsonwebtoken";

const router = Router();

router.route("/register").post(registerUser);
router.route("/verify-otp").post(verifyUserOtp);
router.route("/login").post(loginUser);

//secure route
router.route("/logout").post(verify, logoutUser);

export default router;