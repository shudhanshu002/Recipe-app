import { Bookmark } from '../models/bookmark.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';


const toggleBookmark = asyncHandler(async (req, res) => {
    const { recipeId } = req.params;

    const existingBookmark = await Bookmark.findOne({
        user: req.user._id,
        recipe: recipeId,
    });

    if (existingBookmark) {
        await Bookmark.findByIdAndDelete(existingBookmark._id);
        return res.status(200).json(new ApiResponse(200, { bookmarked: false }, 'Removed from favorites'));
    } else {
        await Bookmark.create({
            user: req.user._id,
            recipe: recipeId,
        });
        return res.status(200).json(new ApiResponse(200, { bookmarked: true }, 'Added to favorites'));
    }
});


const getUserBookmarks = asyncHandler(async (req, res) => {
    const bookmarks = await Bookmark.find({ user: req.user._id }).populate({
        path: 'recipe',
        populate: {
            path: 'createdBy', 
            select: 'username avatar', 
        },
    });

    return res.status(200).json(new ApiResponse(200, bookmarks, 'Bookmarks fetched'));
});

export { toggleBookmark, getUserBookmarks };
