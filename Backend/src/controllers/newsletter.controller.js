import { Newsletter } from '../models/newsletter.model.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { newsletterSubscribtionTemplate } from '../utils/newsletterSubscriptionTemplate.js';
import { sendEmail } from '../utils/sendEmail.js';

export const subscribeToNewsletter = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, 'Email is required');
    }

    // 1. Check if already in Newsletter collection
    const existingSubscriber = await Newsletter.findOne({ email });

    if (existingSubscriber) {
        return res.status(200).json(new ApiResponse(200, {}, 'You are already subscribed!'));
    }

    // 2. Check if this email belongs to a registered User
    const registeredUser = await User.findOne({ email });

    // 3. Save to Newsletter Collection
    await Newsletter.create({
        email,
        user: registeredUser ? registeredUser._id : null, 
    });

    // 4. Update User Model (if user exists)
    if (registeredUser) {
        registeredUser.isNewsletterSubscribed = true;
        await registeredUser.save({ validateBeforeSave: false });
    }

    // 5. Send Welcome Email (Backend Task)
    const message = newsletterSubscribtionTemplate ;

    try {
        await sendEmail({
            email: email,
            subject: 'Subscription Confirmed! 🥗',
            message: message,
        });
    } catch (error) {
        console.error('Email send failed (Check Nodemailer config):', error);
    }

    return res.status(201).json(new ApiResponse(201, {}, 'Subscription successful!'));
});
