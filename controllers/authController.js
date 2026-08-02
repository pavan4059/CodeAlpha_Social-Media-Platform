const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'pulse_ultra_secret_jwt_key_2026_x_gen', {
    expiresIn: '7d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { username, email, password, fullName, bio, avatarUrl } = req.body;

    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields (username, email, password, fullName)' });
    }

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: userExists.username.toLowerCase() === username.toLowerCase() 
          ? 'Username is already taken' 
          : 'Email is already registered' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName,
      bio: bio || '',
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(username)}`,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        coverUrl: user.coverUrl,
        followers: user.followers,
        following: user.following,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server Error during registration' });
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both username/email and password' });
    }

    // Find by email or username, explicitly selecting password for comparison
    const user = await User.findOne({ 
      $or: [{ email: loginId.toLowerCase() }, { username: loginId.toLowerCase() }] 
    }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid authentication credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid authentication credentials' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        coverUrl: user.coverUrl,
        followers: user.followers,
        following: user.following,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server Error during login' });
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('followers', 'username fullName avatarUrl')
      .populate('following', 'username fullName avatarUrl');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving user session profile' });
  }
};

module.exports = {
  register,
  login,
  getMe
};
