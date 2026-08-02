const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Post must have an author']
  },
  content: {
    type: String,
    required: [true, 'Post content cannot be empty'],
    maxlength: [500, 'Post content cannot exceed 500 characters'],
    trim: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  commentsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index by createdAt descending for high performance timeline feed retrieval
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
