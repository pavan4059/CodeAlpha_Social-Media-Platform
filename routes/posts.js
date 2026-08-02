const express = require('express');
const router = express.Router();
const { 
  getFeed, 
  getPostById, 
  createPost, 
  deletePost, 
  toggleLike, 
  getComments, 
  addComment 
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getFeed);
router.post('/', protect, createPost);
router.get('/:id', protect, getPostById);
router.delete('/:id', protect, deletePost);

// Like toggling
router.post('/:id/like', protect, toggleLike);

// Comment discussion thread
router.get('/:id/comments', protect, getComments);
router.post('/:id/comments', protect, addComment);

module.exports = router;
