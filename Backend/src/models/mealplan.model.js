import mongoose from 'mongoose';

const mealPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
      default: 'Dinner',
    },
    isCooked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

mealPlanSchema.index({ user: 1, date: 1 });

export const MealPlan = mongoose.model('MealPlan', mealPlanSchema);
