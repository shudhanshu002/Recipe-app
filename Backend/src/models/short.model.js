import mongoose from 'mongoose';

const shortSchema = new mongoose.Schema(
  {
    videoUrl: { type: String, required: true },
    caption: { type: String },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const Short = mongoose.model('Short', shortSchema);
