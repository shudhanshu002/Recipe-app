import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    title: {
      type: String,
      default: 'Foodie',
    },
    coverImage: {
      type: String,
      default: 'https://placehold.co/1200x400?text=Cover+Image', // Default banner
    },
    password: {
      type: String,
      required: function () {
        return this.loginType === 'email';
      },
    },
    loginType: {
      type: String,
      enum: ['email', 'google', 'facebook'],
      default: 'email',
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    facebookId: {
      type: String,
      unique: true,
      sparse: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    avatar: {
      type: String,
      default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png', // Default user icon
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    refreshToken: {
      type: String,
    },
    accessToken: {
      type: String,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    subscriptionPlan: {
      type: String, // 'monthly' or 'yearly'
      default: null,
    },
    subscriptionExpiry: {
      type: Date, // The date when premium ends
      default: null,
    },
    subscriptionDate: {
      type: Date,
    },
    about: { type: String, trim: true, maxLength: 500 },
    isSubscriptionActive: { type: Boolean, default: false },
    razorpayOrderId: { type: String },
    isFollowingPublic: { type: Boolean, default: true },
    isNewsletterSubscribed: {
      type: Boolean,
      default: false,
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

//pre-save-hook
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return;
  if (!this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateForgotPasswordToken = function () {
  // Generate a random 20 byte hex string
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash the token using sha256 before saving to DB (Security Best Practice)
  this.forgotPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expiry to 20 minutes from now
  this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;

  return resetToken; // Return the un-hashed token to send to the user
};

export const User = mongoose.model('User', userSchema);
