const express = require('express');
const router = express.Router();
const { 
  getUserProfile, 
  updateProfile, 
  toggleFollow, 
  getSuggestedUsers 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/explore/suggestions', protect, getSuggestedUsers);
router.put('/profile', protect, updateProfile);
router.get('/:username', protect, getUserProfile);
router.post('/:id/follow', protect, toggleFollow);

module.exports = router;
