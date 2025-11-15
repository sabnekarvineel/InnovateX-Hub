import express from 'express';
import {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  deleteApplication,
} from '../controllers/applicationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/apply', protect, applyForJob);
router.get('/my-applications', protect, getMyApplications);
router.get('/job/:jobId', protect, getJobApplications);
router.put('/:id/status', protect, updateApplicationStatus);
router.delete('/:id', protect, deleteApplication);

export default router;
