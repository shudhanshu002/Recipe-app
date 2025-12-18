import { Router } from 'express';
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/notification.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(verifyJWT);

router.route('/').get(getUserNotifications);
router.route('/read/all').patch(markAllNotificationsRead);
router.route('/read/:notificationId').patch(markNotificationRead);

export default router;
