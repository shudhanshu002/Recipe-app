import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/sendEmail.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        user.accessToken = accessToken;

        await user.save({validateBeforeSave: false});

        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating ACCESS and REFRESH tokens..");
    }
};

const handleSocialLogin = asyncHandler(async(req, res)=> {
    const user = req.user;

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const options = {
        httpOnly: true,
        secure: true, 
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .redirect("http://localhost:5173");
})

const registerUser = asyncHandler(async (req,res)=> {
    const {email, username, password} = req.body;

    if([email, password, username].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{username} , {email}]
    });

    if(existedUser && existedUser.isVerified) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    let user;
    if(existedUser && !existedUser.isVerified) {
        existedUser.password = password;
        existedUser.username = username;
        existedUser.otp = otp;
        existedUser.otpExpiry = otpExpiry;
        user = await existedUser.save();
    } else {
        user = await User.create({
            email,
            password,
            username: username.toLowerCase(),
            otp,
            otpExpiry,
            isVerified: false
        });
    }

    await sendEmail({
        email: user.email,
        subject: "Recipe App - Verify your account",
        message: `your Verification code is: ${otp}. It expires in 10 minutes.`
    });

    return res.status(200).json(
        new ApiResponse(200, 
            { userId: user._id, email: user.email }, 
            'OTP sent to email. Please verify.'
        )
    );
});

const verifyUserOtp = asyncHandler(async (req,res) => {
    const {email , otp} = req.body;

    if(!email || !otp){
        throw new ApiError(400, "Email and OTP are required");
    }

    const normalizedEmail = email.trim().toLowerCase();

    console.log(`Verifying OTP for: ${normalizedEmail} with code: ${otp}`);

    const user = await User.findOne({email});

    if(!user) {
        throw new ApiError(404, "User not found");
    }

    if(user.isVerified){
        return res.status(200).json(new ApiResponse(200, {}, "User is already verified. Please login."));
    }

    if(user.otp !== otp) {
        throw new ApiError(400, "Invalid OTP");
    }

    if(user.otpExpiry < Date.now()) {
        throw new ApiError(400, "OTP has expired. Please request a new one.");
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save({validateBeforeSave: false});

    return res.status(200).json(
        new ApiResponse(200, {}, "Account verified successfully. You can now login.")
    );
});


const loginUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body;

    if(!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({email});

    if(!user) {
        throw new ApiError(404, "USer NOT found");
    }

    if(!user.isVerified) {
        throw new ApiError(403, "Please verify your email before logging in");
    }

    if(user.loginType === 'email') {
        const isPasswordValid = await user.isPasswordCorrect(password);
        if(!isPasswordValid){
            throw new ApiError(401, "Invalid credentials");
        }
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -accessToken"
    );

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        );
});


const logoutUser = asyncHandler(async (req,res)=> {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
                accessToken: undefined
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "USer logged out"));
});

export {
    registerUser,
    loginUser,
    verifyUserOtp,
    logoutUser,
    handleSocialLogin
}