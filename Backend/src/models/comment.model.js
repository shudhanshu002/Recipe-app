import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, default: null }, // For nested replies
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

export const Comment = mongoose.model('Comment', commentSchema);
