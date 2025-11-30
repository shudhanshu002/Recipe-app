import { Router } from 'express';
import { createBlog, getAllBlogs, getBlogById, addComment, getComments, toggleBlogReaction, toggleCommentLike, uploadBlogImage, deleteBlog } from '../controllers/blog.controller.js';
import { verifyJWT, optionalAuth } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.route('/').get(getAllBlogs).post(verifyJWT, upload.single('coverImage'), createBlog);

router.route('/upload-image').post(verifyJWT, upload.single('image'), uploadBlogImage);

router.route('/:id').get(optionalAuth, getBlogById).delete(verifyJWT, deleteBlog);

router.route('/:id/react').post(verifyJWT, toggleBlogReaction);

router.route('/:id/comments').get(getComments).post(verifyJWT, addComment);

router.route('/comments/:commentId/like').post(verifyJWT, toggleCommentLike);

export default router;
