const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { getLiveStream } = require('../services/liveStreamService');

// @desc    Get social stream feed (For You or Following)
// @route   GET /api/posts?type=all|following
// @access  Private
const getFeed = async (req, res) => {
  try {
    const { type } = req.query;
    let query = {};
    let includeExternal = false;

    if (type === 'following') {
      const currentUser = await User.findById(req.user._id);
      // Include posts from accounts the user is following, plus their own posts
      const authors = [...(currentUser.following || []), currentUser._id];
      query = { author: { $in: authors } };
    } else {
      // For You feed merges real-time external technology discussions
      includeExternal = true;
    }

    const localPosts = await Post.find(query)
      .populate('author', 'username fullName avatarUrl')
      .sort({ createdAt: -1 })
      .limit(40)
      .lean();

    let combinedPosts = [...localPosts];

    if (includeExternal) {
      const externalStream = await getLiveStream();
      combinedPosts = [...combinedPosts, ...externalStream];
    }

    // Sort the blended stream chronologically (newest first)
    combinedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      count: combinedPosts.length,
      posts: combinedPosts
    });
  } catch (error) {
    console.error('Error in getFeed:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch post feed' });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Private
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username fullName avatarUrl');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.status(200).json({
      success: true,
      post
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching post details' });
  }
};

// @desc    Create a new timeline post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { content, imageUrl } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Post content cannot be empty' });
    }

    const post = await Post.create({
      author: req.user._id,
      content: content.trim(),
      imageUrl: imageUrl || null
    });

    const populatedPost = await Post.findById(post._id).populate('author', 'username fullName avatarUrl');

    res.status(201).json({
      success: true,
      post: populatedPost
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error creating post' });
  }
};

// @desc    Delete authored post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Ensure the user is the post creator
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    // Also remove associated comments
    await Comment.deleteMany({ post: post._id });

    res.status(200).json({ success: true, message: 'Post and discussion threads deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting post' });
  }
};

// @desc    Toggle Like on a post
// @route   POST /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const isLiked = post.likes.some(likeId => likeId.toString() === req.user._id.toString());
    let updateQuery;

    if (isLiked) {
      updateQuery = { $pull: { likes: req.user._id } };
    } else {
      updateQuery = { $addToSet: { likes: req.user._id } };
    }

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, updateQuery, { new: true });

    res.status(200).json({
      success: true,
      isLiked: !isLiked,
      likesCount: updatedPost.likes.length,
      likes: updatedPost.likes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling like status' });
  }
};

// @desc    Get comments for a specific post
// @route   GET /api/posts/:id/comments
// @access  Private
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('author', 'username fullName avatarUrl')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      comments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load comments' });
  }
};

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text cannot be empty' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = await Comment.create({
      post: req.params.id,
      author: req.user._id,
      text: text.trim()
    });

    // Increment post comment counter
    post.commentsCount += 1;
    await post.save();

    const populatedComment = await Comment.findById(comment._id).populate('author', 'username fullName avatarUrl');

    res.status(201).json({
      success: true,
      comment: populatedComment,
      commentsCount: post.commentsCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error publishing comment' });
  }
};

module.exports = {
  getFeed,
  getPostById,
  createPost,
  deletePost,
  toggleLike,
  getComments,
  addComment
};
