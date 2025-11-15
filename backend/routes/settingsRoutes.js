import express from 'express';
import {
  changePassword,
  toggleNotifications,
  deactivateAccount,
  reactivateAccount,
  getSettings,
} from '../controllers/settingsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getSettings);
router.put('/change-password', protect, changePassword);
router.put('/toggle-notifications', protect, toggleNotifications);
router.put('/deactivate', protect, deactivateAccount);
router.put('/reactivate', protect, reactivateAccount);

export default router;
