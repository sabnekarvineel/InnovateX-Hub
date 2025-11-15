import express from 'express';
import {
  createPost,
  getFeed,
  getTrendingPosts,
  getPost,
  getUserPosts,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
  sharePost,
  uploadPostMedia,
} from '../controllers/postController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/', protect, createPost);
router.get('/feed', protect, getFeed);
router.get('/trending', protect, getTrendingPosts);
router.get('/user/:userId', protect, getUserPosts);
router.get('/:id', protect, getPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);
router.post('/:id/unlike', protect, unlikePost);
router.post('/:id/comment', protect, addComment);
router.delete('/:id/comment/:commentId', protect, deleteComment);
router.post('/:id/share', protect, sharePost);
router.post('/upload/media', protect, upload.single('media'), uploadPostMedia);

export default router;
