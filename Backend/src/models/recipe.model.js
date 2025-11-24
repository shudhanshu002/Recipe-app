import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
        },
        ingredients: [
            {
                type: String,
                required: true,
            }
        ],
        difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            required: true,
        },
        cuisine: {
            type: String,
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        averageRating: {
            type: Number,
            default: 0,
        }
    },
    {timestamps: true}
);

export const Recipe = mongoose.model("Recipe", recipeSchema);