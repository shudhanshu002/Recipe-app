import { Short } from '../models/short.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const addShort = asyncHandler(async (req, res) => {
    const { recipeId } = req.params;
    const { caption } = req.body;
    const videoLocalPath = req.file?.path;

    if (!videoLocalPath) {
        throw new ApiError(400, 'Video file is required');
    }

    console.log('Starting Short Upload...');

    const video = await uploadOnCloudinary(videoLocalPath);

    if (!video?.url) {
        throw new ApiError(500, 'Video upload failed - Check server logs');
    }

    const short = await Short.create({
        videoUrl: video.url,
        caption,
        recipe: recipeId,
        author: req.user._id,
    });

    return res.status(201).json(new ApiResponse(201, short, 'Short uploaded successfully'));
});

const getRecipeShorts = asyncHandler(async (req, res) => {
    const { recipeId } = req.params;

    const shorts = await Short.find({ recipe: recipeId }).populate('author', 'username avatar').sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, shorts, 'Shorts fetched successfully'));
});

export { addShort, getRecipeShorts };
