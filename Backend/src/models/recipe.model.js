import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        ingredients: [{ type: String, required: true }],
        instructions: { type: String, required: true },
        difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
        cuisine: { type: String, required: true, index: true },
        mainIngredient: { type: String, required: true, index: true },
        images: {
            type: [String],
            validate: [(val) => val.length <= 10, '{PATH} exceeds limit of 10'],
            required: true,
        },
        videoUrl: { type: String },
        videoThumbnail: { type: String },
        isPremium: { type: Boolean, default: false },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        averageRating: { type: Number, default: 0 },
        dietaryTags: { type: [String], index: true },
        cookingTime: { type: Number, default: 30 },
        calories: { type: Number },

        // ✅ TRACKING
        // 'viewedBy' tracks logged-in users to prevent duplicate counts
        viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

        // 'views' is the total count (including guests)
        // We removed the virtual field that conflicted with this
        views: { type: Number, default: 0 },
    },
    {
        timestamps: true,
        // Removed toJSON virtuals to prevent accidental conflict if any remain
    },
);

export const Recipe = mongoose.model('Recipe', recipeSchema);
