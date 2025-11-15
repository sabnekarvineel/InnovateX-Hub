import express from 'express';
import {
  expressInterest,
  getMyInterests,
  getFundingInterests,
  updateInterestStatus,
  deleteInterest,
} from '../controllers/investorInterestController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/express', protect, expressInterest);
router.get('/my-interests', protect, getMyInterests);
router.get('/funding/:fundingRequestId', protect, getFundingInterests);
router.put('/:id/status', protect, updateInterestStatus);
router.delete('/:id', protect, deleteInterest);

export default router;
