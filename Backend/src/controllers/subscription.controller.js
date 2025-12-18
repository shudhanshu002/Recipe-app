import { Subscription } from '../models/subscription.model.js';
import { User } from '../models/user.model.js';
import { Recipe } from '../models/recipe.model.js';
import { Like } from '../models/like.model.js';
import { Notification } from '../models/notification.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// 1. subscribing -- fn
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
    return res
      .status(200)
      .json(
        new ApiResponse(200, { subscribed: false }, 'Unsubscribed successfully')
      );
  }

  await Subscription.create({
    subscriber: req.user._id,
    channel: channelId,
  });

  try {
    await Notification.create({
      recipient: channelId,
      sender: req.user._id,
      type: 'FOLLOW',
    });
  } catch (err) {
    console.log('Notification error ignored:', err.message);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { subscribed: true }, 'Subscribed successfully')
    );
});

// 2. user followers watch
const getUserFollowers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const followers = await Subscription.find({ channel: channelId })
    .populate('subscriber', 'username avatar title')
    .select('subscriber');
  return res.status(200).json(
    new ApiResponse(
      200,
      followers.map((sub) => sub.subscriber),
      'Followers fetched'
    )
  );
});

// 3. user following watch
const getUserFollowing = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  const user = await User.findById(subscriberId);
  if (!user) throw new ApiError(404, 'User not found');

  const isMe = req.user?._id.toString() === subscriberId.toString();
  if (!isMe && !user.isFollowingPublic) {
    return res
      .status(403)
      .json(new ApiResponse(403, null, 'Following list is private'));
  }

  const following = await Subscription.find({ subscriber: subscriberId })
    .populate('channel', 'username avatar title')
    .select('channel');
  return res.status(200).json(
    new ApiResponse(
      200,
      following.map((sub) => sub.channel),
      'Following fetched'
    )
  );
});

// 4. get channel profile
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, 'Username is missing');
  }

  const user = await User.findOne({
    username: new RegExp(`^${username}$`, 'i'),
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const channelId = user._id;

  const currentUserId = req.user ? req.user._id : null;

  const userStats = await User.aggregate([
    { $match: { _id: channelId } },
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
        subscribedToCount: { $size: '$subscribedTo' },
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
        coverImage: 1,
        about: 1,
        title: 1,
        subscribersCount: 1,
        subscribedToCount: 1,
        isSubscribed: 1,
        isFollowingPublic: 1,
        isVerified: 1,
      },
    },
  ]);

  let stats = { totalRecipes: 0, premiumRecipes: 0, averageRating: 0 };
  let recipesList = [];

  try {
    recipesList = await Recipe.find({ createdBy: channelId });
    stats.totalRecipes = recipesList.length;
    stats.premiumRecipes = recipesList.filter((r) => r.isPremium).length;

    const ratedRecipes = recipesList.filter((r) => r.averageRating > 0);
    if (ratedRecipes.length > 0) {
      const totalRating = ratedRecipes.reduce(
        (acc, curr) => acc + curr.averageRating,
        0
      );
      stats.averageRating = (totalRating / ratedRecipes.length).toFixed(1);
    }
  } catch (error) {
    console.error('Error calculating recipe stats:', error.message);
  }

  let totalLikes = 0;
  try {
    const recipeIds = recipesList.map((r) => r._id);
    if (recipeIds.length > 0) {
      totalLikes = await Like.countDocuments({ recipe: { $in: recipeIds } });
    }
  } catch (error) {
    console.error('Error counting likes:', error.message);
  }

  const badges = [];
  if (totalLikes > 10)
    badges.push({ label: 'Top Chef', icon: '⭐', color: 'yellow' });
  if (stats.premiumRecipes > 0)
    badges.push({ label: 'Premium Creator', icon: '💎', color: 'blue' });
  if (parseFloat(stats.averageRating) >= 4.5 && stats.totalRecipes > 5)
    badges.push({ label: '5 Star Cook', icon: '🥇', color: 'orange' });

  const profileData = {
    ...userStats[0],
    stats: {
      recipes: stats.totalRecipes,
      premiumRecipes: stats.premiumRecipes,
      totalLikes: totalLikes,
      averageRating: stats.averageRating,
    },
    badges: badges,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, profileData, 'User profile fetched successfully')
    );
});

export {
  toggleSubscription,
  getUserChannelProfile,
  getUserFollowers,
  getUserFollowing,
};
