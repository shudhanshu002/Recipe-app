import { Subscription } from '../models/subscription.model.js';
import { User } from '../models/user.model.js';
import { Notification } from '../models/notification.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import mongoose from 'mongoose';


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!req.user?._id) {
        throw new ApiError(401, 'Login to subscribe');
    }

    if (channelId.toString() === req.user._id.toString()) {
        throw new ApiError(400, 'You cannot subscribe to yourself');
    }

    const isSubscribed = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId,
    });

    if (isSubscribed) {
        await Subscription.findByIdAndDelete(isSubscribed._id);
        return res.status(200).json(new ApiResponse(200, { subscribed: false }, 'Unsubscribed successfully'));
    }

    await Subscription.create({
        subscriber: req.user._id,
        channel: channelId,
    });

    
    await Notification.create({
        recipient: channelId,
        sender: req.user._id,
        type: 'FOLLOW',
    });

    return res.status(200).json(new ApiResponse(200, { subscribed: true }, 'Subscribed successfully'));
});


const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, 'Username is missing');
    }

    
    const user = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    const channelId = user._id;

    const currentUserId = req.user ? req.user._id : null;

    
    const channel = await User.aggregate([
        {
            $match: {
                _id: channelId,
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
                        if: { $in: [currentUserId, '$subscribers.subscriber'] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                username: 1,
                email: 1,
                avatar: 1,
                about: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                isVerified: 1,
            },
        },
    ]);

    if (!channel?.length) {
        throw new ApiError(404, 'Channel does not exist');
    }

    return res.status(200).json(new ApiResponse(200, channel[0], 'User channel fetched successfully'));
});

export { toggleSubscription, getUserChannelProfile };
