import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

export const verifyAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized');
  }

  const ADMIN_EMAILS = ['admin@pinchofyumclone.com', 'owner@recipe.com'];

  if (!ADMIN_EMAILS.includes(req.user.email)) {
    throw new ApiError(403, 'Access Denied: Admins only');
  }

  next();
});
