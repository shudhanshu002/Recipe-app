import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendEmail } from '../utils/sendEmail.js';
import jwt from 'jsonwebtoken';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { getOtpTemplate } from '../utils/getOTPTemplate.js';
import mongoose, { isValidObjectId } from 'mongoose';
import crypto from 'crypto';

// 1. generating tokens
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
    throw new ApiError(
      500,
      'Something went wrong while generating ACCESS and REFRESH tokens..'
    );
  }
};

// 2. social login handker
const handleSocialLogin = asyncHandler(async (req, res) => {
  const user = req.user;

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.accessToken = accessToken;
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
  };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .redirect(process.env.CLIENT_URL);
});

// 3. normal register
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
    subject: 'Welcome to the Zaika_Vault Kitchen! 👨‍🍳 - Verify your account',
    html: getOtpTemplate(otp),
    message: `Your Verification code is: ${otp}. It expires in 10 minutes.`,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { userId: user._id, email: user.email },
        'OTP sent to email. Please verify.'
      )
    );
});

// 4. otp sending
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
    return res
      .status(200)
      .json(
        new ApiResponse(200, {}, 'User is already verified. Please login.')
      );
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

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        'Account verified successfully. You can now login.'
      )
    );
});

// 5. login--
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

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    '-password -refreshToken -accessToken'
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
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
        'User logged in successfully'
      )
    );
});

// 6. logoutuser--
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
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
  };

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, 'USer logged out'));
});

// 7. refreshing token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const cookies = req.cookies || {};
  const body = req.body || {};

  const incomingRefreshToken = cookies.refreshToken || body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Unauthorized request');
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, 'Refresh token is expired or used');
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    };

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken, user },
          'Access token refreshed'
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid refresh token');
  }
});

// 8. update avatar
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
    { new: true }
  ).select('-password');

  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Avatar updated successfully'));
});

// 9. updating account details
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { about, title, isFollowingPublic } = req.body;

  const updates = {};
  if (about !== undefined) updates.about = about;
  if (title !== undefined) updates.title = title;
  if (isFollowingPublic !== undefined)
    updates.isFollowingPublic = isFollowingPublic;

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, 'No fields to update');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true }
  ).select('-password');

  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Account details updated successfully'));
});

// 10. update user cover image
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
    { new: true }
  ).select('-password');

  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Cover Image uploaded successfully'));
});

// 11. fetching top chef
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

// 12. fetching current user
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).select('-password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.isPremium && user.subscriptionExpiry) {
    if (new Date() > user.subscriptionExpiry) {
      console.log(
        `[Auto-Expire] Subscription expired for ${user.username}. Revoking status.`
      );

      user.isPremium = false;
      user.subscriptionPlan = null;
      user.subscriptionExpiry = null;
      await user.save();
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, 'User details fetched successfully'));
});

// 13. fetching channel
const getUserChannelProfileById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId || !isValidObjectId(userId)) {
    throw new ApiError(400, 'Invalid User ID provided');
  }

  const channel = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'channel',
        as: 'subscribers',
      },
    },
    {
      $lookup: {
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'subscriber',
        as: 'subscribedTo',
      },
    },
    {
      $addFields: {
        subscribersCount: { $size: '$subscribers' },
        channelsSubscribedToCount: { $size: '$subscribedTo' },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, '$subscribers.subscriber'] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        username: 1,
        fullName: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
        bio: 1,
        location: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, 'Chef not found');
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], 'Chef profile fetched successfully')
    );
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // For security, you might want to return success even if user doesn't exist
    // to prevent email enumeration, but here we throw error for simplicity.
    throw new ApiError(404, 'User not found');
  }

  // Generate token via Model method
  const resetToken = user.generateForgotPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Construct Reset URL (Frontend URL)
  // Example: http://localhost:5173/reset-password/24234234234234
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const message = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #f97316;">Reset Your Password</h2>
            <p>You requested a password reset for your Zaika Vault account.</p>
            <p>Please click the link below to reset your password:</p>
            <a href="${resetUrl}" style="background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">Reset Password</a>
            <p>This link is valid for 20 minutes.</p>
            <p style="font-size: 12px; color: #666;">If you did not request this, please ignore this email.</p>
        </div>
    `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Zaika Vault - Password Reset Request',
      message: `Click here to reset your password: ${resetUrl}`, // Plain text fallback
      html: message,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, 'Password reset email sent successfully'));
  } catch (error) {
    // If email fails, clear the token so the user can try again cleanly
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    throw new ApiError(500, 'Email sending failed. Please try again later.');
  }
});

// 15. Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    throw new ApiError(400, 'New password is required');
  }

  // Hash the token from the URL to compare with the one in DB
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpiry: { $gt: Date.now() }, // Check if expiry is in the future
  });

  if (!user) {
    throw new ApiError(400, 'Password reset token is invalid or has expired');
  }

  // Update password
  user.password = password;

  // Clear reset fields
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  await user.save(); // Will run pre('save') middleware to hash password

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Password reset successfully'));
});

export {
  registerUser,
  loginUser,
  verifyUserOtp,
  logoutUser,
  handleSocialLogin,
  refreshAccessToken,
  updateUserAvatar,
  updateAccountDetails,
  updateUserCoverImage,
  getTopChefs,
  getCurrentUser,
  getUserChannelProfileById,
  forgotPassword,
  resetPassword
};
