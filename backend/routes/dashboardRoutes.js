import express from 'express';
import {
  getDashboardOverview,
  getStudentDashboard,
  getFreelancerDashboard,
  getStartupDashboard,
  getInvestorDashboard,
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/overview', protect, getDashboardOverview);
router.get('/student', protect, getStudentDashboard);
router.get('/freelancer', protect, getFreelancerDashboard);
router.get('/startup', protect, getStartupDashboard);
router.get('/investor', protect, getInvestorDashboard);

export default router;
