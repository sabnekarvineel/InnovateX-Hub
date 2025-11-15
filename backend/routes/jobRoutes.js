import express from 'express';
import {
  createJob,
  getJobs,
  getJob,
  getMyJobs,
  updateJob,
  deleteJob,
} from '../controllers/jobController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createJob);
router.get('/', protect, getJobs);
router.get('/my-jobs', protect, getMyJobs);
router.get('/:id', protect, getJob);
router.put('/:id', protect, updateJob);
router.delete('/:id', protect, deleteJob);

export default router;
