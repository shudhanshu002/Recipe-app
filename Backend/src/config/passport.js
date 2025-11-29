import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { User } from '../models/user.model.js';
import dotenv from 'dotenv';

// ✅ Load env variables immediately
dotenv.config();

// Helper to handle the logic for both Google and Facebook
const socialLoginCallback = async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
            return done(new Error('No email found from provider'), null);
        }

        let user = await User.findOne({ email });

        if (user) {
            if (profile.provider === 'google' && !user.googleId) {
                user.googleId = profile.id;
                user.loginType = 'google';
                await user.save({ validateBeforeSave: false });
            } else if (profile.provider === 'facebook' && !user.facebookId) {
                user.facebookId = profile.id;
                user.loginType = 'facebook';
                await user.save({ validateBeforeSave: false });
            }
            return done(null, user);
        } else {
            const newUser = await User.create({
                username: profile.displayName.split(' ').join('').toLowerCase() + Math.floor(Math.random() * 1000),
                email: email,
                avatar: profile.photos?.[0]?.value,
                loginType: profile.provider,
                googleId: profile.provider === 'google' ? profile.id : undefined,
                facebookId: profile.provider === 'facebook' ? profile.id : undefined,
                isVerified: true,
            });
            return done(null, newUser);
        }
    } catch (error) {
        return done(error, null);
    }
};

// --- GOOGLE STRATEGY ---
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: '/api/v1/users/google/callback',
            },
            socialLoginCallback,
        ),
    );
}

// --- FACEBOOK STRATEGY ---
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
        new FacebookStrategy(
            {
                clientID: process.env.FACEBOOK_APP_ID,
                clientSecret: process.env.FACEBOOK_APP_SECRET,
                callbackURL: '/api/v1/users/facebook/callback',
                profileFields: ['id', 'displayName', 'photos', 'email'],
            },
            socialLoginCallback,
        ),
    );
}

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

export default passport;
