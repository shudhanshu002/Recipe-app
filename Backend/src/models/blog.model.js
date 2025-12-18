import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    emoji: {
      type: String,
      required: true,
      enum: ['👍', '❤️', '😂', '😮', '😢', '😡'],
    },
  },
  { _id: false }
);

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: { type: String },
    topic: { type: String, required: true },
    topicColor: { type: String, default: '#ff642f' },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    reactions: [reactionSchema],

    viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

blogSchema.virtual('views').get(function () {
  return this.viewedBy ? this.viewedBy.length : 0;
});

export const Blog = mongoose.model('Blog', blogSchema);
