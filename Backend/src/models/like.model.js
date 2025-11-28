import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
    {
        recipe: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Recipe"
        },
        review: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        },
        likedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {timestamps: true}
);


export const Like = mongoose.model("Like", likeSchema);