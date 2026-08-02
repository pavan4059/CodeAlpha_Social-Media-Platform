const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: [true, 'Comment must be attached to a post'],
    index: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Comment must have an author']
  },
  text: {
    type: String,
    required: [true, 'Comment text cannot be empty'],
    maxlength: [300, 'Comment cannot exceed 300 characters'],
    trim: true
  }
}, {
  timestamps: true
});

// Sort comments chronologically
commentSchema.index({ post: 1, createdAt: 1 });

module.exports = mongoose.model('Comment', commentSchema);
