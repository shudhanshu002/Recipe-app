import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        ingredients: [
            {
                type: String,
                required: true,
            },
        ],
        instructions: {
            type: String,
            required: true,
        },
        difficulty: {
            type: String,
            enum: ['Easy', 'Medium', 'Hard'],
            required: true,
        },
        cuisine: {
            type: String,
            required: true,
            index: true,
        },
        images: {
            type: [String],
            validate: [(val) => val.length <= 10, '{PATH} exceeds the limit of 10 images'],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        averageRating: {
            type: Number,
            default: 0,
        },
        videoUrl: {
            type: String,
        },
        mainIngredient: {
            type: String,
            required: true,
            index: true,
        },
        isPremium: {
            type: Boolean,
            default: false,
        },
        dietaryTags: {
            type: [String], // ["Vegan", "Gluten-Free", "Keto"]
            index: true,
        },
        cookingTime: {
            type: Number, // In minutes
            default: 30,
        },
        calories: {
            type: Number,
        },
    },
    { timestamps: true },
);

export const Recipe = mongoose.model('Recipe', recipeSchema);
