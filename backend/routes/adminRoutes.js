import express from 'express';
import {
  getAnalytics,
  getAllUsers,
  verifyUser,
  unverifyUser,
  banUser,
  unbanUser,
  deleteUser,
  getAllPosts,
  deletePost,
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/analytics', getAnalytics);
router.get('/users', getAllUsers);
router.put('/users/:userId/verify', verifyUser);
router.put('/users/:userId/unverify', unverifyUser);
router.put('/users/:userId/ban', banUser);
router.put('/users/:userId/unban', unbanUser);
router.delete('/users/:userId', deleteUser);
router.get('/posts', getAllPosts);
router.delete('/posts/:postId', deletePost);

export default router;
