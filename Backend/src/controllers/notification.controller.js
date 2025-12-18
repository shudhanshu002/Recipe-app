import { Notification } from '../models/notification.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// 1. fetching user notification
const getUserNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ recipient: req.user._id })
    .populate('sender', 'username avatar')
    .populate('recipe', 'title')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { notifications, unreadCount },
        'Notifications fetched succesfully'
      )
    );
});

// 2. read -- marking
const markNotificationRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  await Notification.findByIdAndUpdate(notificationId, { isRead: true });

  return res.status(200).json(new ApiResponse(200, {}, 'Marked as read'));
});

// 3. bulk -- read
const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  return res.status(200).json(new ApiResponse(200, {}, 'All marked as read'));
});

export { getUserNotifications, markNotificationRead, markAllNotificationsRead };
