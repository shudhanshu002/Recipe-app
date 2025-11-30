import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        emoji: { type: String, required: true, enum: ['👍', '❤️', '😂', '😮', '😢', '😡'] },
    },
    { _id: false },
);

// Define Reply Schema separately
const replySchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    media: {
        type: String, // Optional URL
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Explicit string
        required: true,
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Explicit string
        },
    ],
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },
    reactions: [
        reactionSchema
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Define Review Schema
const reviewSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        media: {
            type: String,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Explicit string
            required: true,
        },
        recipe: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Recipe', // Explicit string
            required: true,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User', // Explicit string
            },
        ],
        reactions: [reactionSchema],
        replies: [replySchema], // Embed the reply schema
    },
    { timestamps: true },
);

export const Review = mongoose.model('Review', reviewSchema);
