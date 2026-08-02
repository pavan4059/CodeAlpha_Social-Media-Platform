const User = require('../models/User');
const Post = require('../models/Post');

// @desc    Get public user profile and their posts by username
// @route   GET /api/users/:username
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() })
      .populate('followers', 'username fullName avatarUrl bio')
      .populate('following', 'username fullName avatarUrl bio');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    // Fetch posts created by this user
    const posts = await Post.find({ author: user._id })
      .populate('author', 'username fullName avatarUrl')
      .sort({ createdAt: -1 });

    // Also fetch liked posts for tabbed viewing
    const likedPosts = await Post.find({ likes: user._id })
      .populate('author', 'username fullName avatarUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        coverUrl: user.coverUrl,
        followers: user.followers,
        following: user.following,
        createdAt: user.createdAt
      },
      postsCount: posts.length,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      posts,
      likedPosts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving profile' });
  }
};

// @desc    Update authenticated user profile info
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { fullName, bio, avatarUrl, coverUrl } = req.body;

    const updateFields = {};
    if (fullName !== undefined) updateFields.fullName = fullName.trim();
    if (bio !== undefined) updateFields.bio = bio.trim();
    if (avatarUrl !== undefined && avatarUrl.trim() !== '') updateFields.avatarUrl = avatarUrl.trim();
    if (coverUrl !== undefined && coverUrl.trim() !== '') updateFields.coverUrl = coverUrl.trim();

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password')
     .populate('followers', 'username fullName avatarUrl')
     .populate('following', 'username fullName avatarUrl');

    res.status(200).json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully!'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update profile' });
  }
};

// @desc    Toggle Follow/Unfollow status on another user
// @route   POST /api/users/:id/follow
// @access  Private
const toggleFollow = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId.toString() === currentUserId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User to follow not found' });
    }

    const isFollowing = targetUser.followers.some(id => id.toString() === currentUserId.toString());

    if (isFollowing) {
      // Unfollow action
      await User.findByIdAndUpdate(targetUserId, { $pull: { followers: currentUserId } });
      await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUserId } });
    } else {
      // Follow action
      await User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: currentUserId } });
      await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetUserId } });
    }

    const newTargetUser = await User.findById(targetUserId);

    res.status(200).json({
      success: true,
      isFollowing: !isFollowing,
      followersCount: newTargetUser.followers.length,
      message: !isFollowing ? `You are now following ${targetUser.username}` : `Unfollowed ${targetUser.username}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error processing follow toggle' });
  }
};

// @desc    Get suggested accounts to follow for explore & right bar widget
// @route   GET /api/users/explore/suggestions
// @access  Private
const getSuggestedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const excludeIds = [...(currentUser.following || []), req.user._id];

    // First try finding accounts not currently followed
    let suggestions = await User.find({ _id: { $nin: excludeIds } })
      .select('username fullName avatarUrl bio followers')
      .limit(6);

    // If fewer than 4 suggestions, fetch existing users excluding self to keep widget vibrant
    if (suggestions.length < 4) {
      suggestions = await User.find({ _id: { $ne: req.user._id } })
        .select('username fullName avatarUrl bio followers')
        .limit(6);
    }

    res.status(200).json({
      success: true,
      count: suggestions.length,
      users: suggestions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error loading suggestions' });
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  toggleFollow,
  getSuggestedUsers
};
