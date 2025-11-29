import { ApiError } from '../utils/ApiError.js';
import mongoose from 'mongoose';
import multer from 'multer';

const errorHandler = (err, req, res, next) => {
    let error = err;

    if(err instanceof multer.MulterError) {
        if(err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: 'File is too large! Maximum allowed size is 5GB.',
            });
        }

        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }

    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || (error instanceof mongoose.Error ? 400 : 500);
        const message = error.message || 'Something went wrong';
        error = new ApiError(statusCode, message, error?.errors || [], err.stack);
    }

    const response = {
        success: false,
        message: error.message,
        errors: error.errors,
        ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
    };


    return res.status(error.statusCode).json(response);
};

export { errorHandler };
