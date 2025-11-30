import { Blog } from '../models/blog.model.js';
import { Comment } from '../models/comment.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';


const createBlog = asyncHandler(async (req, res) => {
    const { title, content, topic, topicColor } = req.body;
    const coverLocalPath = req.file?.path;
    let coverImage = '';
    if (coverLocalPath) {
        const uploaded = await uploadOnCloudinary(coverLocalPath);
        if (uploaded) coverImage = uploaded.url;
    }
    if (!title || !content || !topic) throw new ApiError(400, 'Required fields missing');

    const blog = await Blog.create({
        title,
        content,
        topic,
        topicColor,
        coverImage,
        author: req.user._id,
        views: 0,
    });
    return res.status(201).json(new ApiResponse(201, blog, 'Blog published'));
});

const getAllBlogs = asyncHandler(async (req, res) => {
    const blogs = await Blog.find().populate('author', 'username avatar').sort({ createdAt: -1 });
    const blogsWithCounts = await Promise.all(
        blogs.map(async (blog) => {
            const commentCount = await Comment.countDocuments({ blog: blog._id });
            return { ...blog.toObject({ virtuals: true }), commentCount };
        }),
    );
    return res.status(200).json(new ApiResponse(200, blogsWithCounts, 'Blogs fetched'));
});

const getBlogById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user ? req.user._id : null;
    const updateQuery = userId ? { $addToSet: { viewedBy: userId } } : {};
    const blog = await Blog.findByIdAndUpdate(id, updateQuery, { new: true }).populate('author', 'username avatar about');
    if (!blog) throw new ApiError(404, 'Blog not found');
    return res.status(200).json(new ApiResponse(200, blog, 'Blog fetched'));
});

const toggleBlogReaction = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;
    const blog = await Blog.findById(id);
    if (!blog) throw new ApiError(404, 'Blog not found');

    const existingIndex = blog.reactions.findIndex((r) => r.user.toString() === userId.toString());
    if (existingIndex > -1) {
        if (blog.reactions[existingIndex].emoji === emoji) blog.reactions.splice(existingIndex, 1);
        else blog.reactions[existingIndex].emoji = emoji;
    } else {
        blog.reactions.push({ user: userId, emoji });
    }
    await blog.save();
    return res.status(200).json(new ApiResponse(200, blog.reactions, 'Reaction updated'));
});

const addComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { content, parentId } = req.body;
    const blog = await Blog.findById(id);
    if (!blog) throw new ApiError(404, 'Blog not found');

    const comment = await Comment.create({
        content,
        blog: id,
        author: req.user._id,
        parentId: parentId || null,
    });
    return res.status(201).json(new ApiResponse(201, comment, 'Comment added'));
});

const getComments = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const comments = await Comment.find({ blog: id }).populate('author', 'username avatar').sort({ createdAt: 1 }); // Sorted oldest to newest for tree building
    return res.status(200).json(new ApiResponse(200, comments, 'Comments fetched'));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) throw new ApiError(404, 'Comment not found');

    const isLiked = comment.likes.includes(userId);
    if (isLiked) {
        comment.likes.pull(userId);
    } else {
        comment.likes.push(userId);
    }

    await comment.save();
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                isLiked: !isLiked,
                likesCount: comment.likes.length,
            },
            'Comment like toggled',
        ),
    );
});

const uploadBlogImage = asyncHandler(async (req, res) => {
    const imageLocalPath = req.file?.path;

    if (!imageLocalPath) {
        throw new ApiError(400, 'Image file is required');
    }

    const image = await uploadOnCloudinary(imageLocalPath);

    if (!image?.url) {
        throw new ApiError(500, 'Image upload failed');
    }

    return res.status(200).json(new ApiResponse(200, { url: image.url }, 'Image uploaded successfully'));
});

export { createBlog, getAllBlogs, getBlogById, addComment, getComments, toggleBlogReaction, toggleCommentLike, uploadBlogImage };
