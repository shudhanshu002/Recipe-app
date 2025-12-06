import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendEmail } from '../utils/sendEmail.js';
import jwt from 'jsonwebtoken';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        user.accessToken = accessToken;

        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, 'Something went wrong while generating ACCESS and REFRESH tokens..');
    }
};

const handleSocialLogin = asyncHandler(async (req, res) => {
    const user = req.user;

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();



    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // False in dev
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    };

    return res.status(200).cookie('accessToken', accessToken, options).cookie('refreshToken', refreshToken, options).redirect('http://localhost:5173');
});

const registerUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if ([email, password, username].some((field) => field?.trim() === '')) {
        throw new ApiError(400, 'All fields are required');
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser && existedUser.isVerified) {
        throw new ApiError(409, 'User with email or username already exists');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    let user;
    if (existedUser && !existedUser.isVerified) {
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
            isVerified: false,
        });
    }

    await sendEmail({
        email: user.email,
        subject: 'Recipe App - Verify your account',
        message: `your Verification code is: ${otp}. It expires in 10 minutes.`,
    });

    return res.status(200).json(new ApiResponse(200, { userId: user._id, email: user.email }, 'OTP sent to email. Please verify.'));
});

const verifyUserOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, 'Email and OTP are required');
    }

    const normalizedEmail = email.trim().toLowerCase();

    console.log(`Verifying OTP for: ${normalizedEmail} with code: ${otp}`);

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    if (user.isVerified) {
        return res.status(200).json(new ApiResponse(200, {}, 'User is already verified. Please login.'));
    }

    if (user.otp !== otp) {
        throw new ApiError(400, 'Invalid OTP');
    }

    if (user.otpExpiry < Date.now()) {
        throw new ApiError(400, 'OTP has expired. Please request a new one.');
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, 'Account verified successfully. You can now login.'));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        throw new ApiError(400, 'Email is required');
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, 'USer NOT found');
    }

    if (!user.isVerified) {
        throw new ApiError(403, 'Please verify your email before logging in');
    }

    if (user.loginType === 'email') {
        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            throw new ApiError(401, 'Invalid credentials');
        }
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select('-password -refreshToken -accessToken');

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    };

    return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                'User logged in successfully',
            ),
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
                accessToken: undefined,
            },
        },
        {
            new: true,
        },
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    };

    return res.status(200).clearCookie('accessToken', options).clearCookie('refreshToken', options).json(new ApiResponse(200, {}, 'USer logged out'));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const cookies = req.cookies || {};
    const body = req.body || {};

    // Now we can safely access .refreshToken without crashing
    const incomingRefreshToken = cookies.refreshToken || body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, 'Unauthorized request');
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, 'Invalid refresh token');
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, 'Refresh token is expired or used');
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        const options = {
            httpOnly: true,
            secure: true,
        };

        return res
            .status(200)
            .cookie('accessToken', accessToken, options)
            .cookie('refreshToken', refreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken, user }, 'Access token refreshed'));
    } catch (error) {
        throw new ApiError(401, error?.message || 'Invalid refresh token');
    }
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar file is missing');
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(500, 'Error uploading avatar');
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { avatar: avatar.url },
        },
        { new: true },
    ).select('-password');

    return res.status(200).json(new ApiResponse(200, user, 'Avatar updated successfully'));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { about, title, isFollowingPublic } = req.body;

    const updates = {};
    if (about !== undefined) updates.about = about;
    if (title !== undefined) updates.title = title;
    if (isFollowingPublic !== undefined) updates.isFollowingPublic = isFollowingPublic;

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, 'No fields to update');
    }

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true }).select('-password');

    return res.status(200).json(new ApiResponse(200, user, 'Account details updated successfully'));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverLocalPath = req.file?.path;

    if (!coverLocalPath) {
        throw new ApiError(400, 'Cover image file is missing');
    }

    const coverImage = await uploadOnCloudinary(coverLocalPath);

    if (!coverImage) {
        throw new ApiError(500, 'Error uploading cover image');
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { coverImage: coverImage.url },
        },
        { new: true },
    ).select('-password');

    return res.status(200).json(new ApiResponse(200, user, 'Cover Image uploaded successfully'));
});


const getTopChefs = asyncHandler(async (req, res) => {
    const users = await User.aggregate([
        {
            $lookup: {
                from: 'subscriptions',
                localField: '_id',
                foreignField: 'channel',
                as: 'subscribers',
            },
        },
        {
            $addFields: {
                subscribersCount: { $size: '$subscribers' },
            },
        },
        { $sort: { subscribersCount: -1 } },
        { $limit: 20 },
        {
            $project: {
                username: 1,
                avatar: 1,
                title: 1,
                subscribersCount: 1,
            },
        },
    ]);

    return res.status(200).json(new ApiResponse(200, users, 'Community fetched'));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    // 1. Fetch user from DB (Always fetch fresh to check expiry)
    const user = await User.findById(req.user?._id).select('-password');

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // --- AUTO-EXPIRATION CHECK ---
    // If premium is true BUT the expiry date has passed, revoke it immediately.
    if (user.isPremium && user.subscriptionExpiry) {
        if (new Date() > user.subscriptionExpiry) {
            console.log(`[Auto-Expire] Subscription expired for ${user.username}. Revoking status.`);

            user.isPremium = false;
            user.subscriptionPlan = null;
            user.subscriptionExpiry = null;
            await user.save();
        }
    }
    // -----------------------------

    return res.status(200).json(new ApiResponse(200, user, 'User details fetched successfully'));
});

export { registerUser, loginUser, verifyUserOtp, logoutUser, handleSocialLogin, refreshAccessToken, updateUserAvatar, updateAccountDetails, updateUserCoverImage, getTopChefs, getCurrentUser };
