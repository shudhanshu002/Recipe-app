import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    ingredients: [{ type: String, required: true }],
    instructions: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
    },
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    averageRating: { type: Number, default: 0 },
    dietaryTags: { type: [String], index: true },
    cookingTime: { type: Number, default: 30 },
    calories: { type: Number },
    isVegetarian: { type: Boolean, default: true, required: true },

    viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    views: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const Recipe = mongoose.model('Recipe', recipeSchema);
