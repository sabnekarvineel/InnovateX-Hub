import express from 'express';
import {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  uploadCoverBanner,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from '../controllers/profileController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/:id', getProfile);
router.put('/update', protect, updateProfile);
router.post('/upload/photo', protect, upload.single('profilePhoto'), uploadProfilePhoto);
router.post('/upload/banner', protect, upload.single('coverBanner'), uploadCoverBanner);
router.post('/follow/:id', protect, followUser);
router.post('/unfollow/:id', protect, unfollowUser);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

export default router;
