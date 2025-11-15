import express from 'express';
import {
  searchUsers,
  searchBySkill,
  searchProjects,
  searchStartups,
  searchFreelancers,
  getAvailableSkills,
  getAvailableLocations,
} from '../controllers/searchController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/users', protect, searchUsers);
router.get('/skills', protect, searchBySkill);
router.get('/projects', protect, searchProjects);
router.get('/startups', protect, searchStartups);
router.get('/freelancers', protect, searchFreelancers);
router.get('/available-skills', protect, getAvailableSkills);
router.get('/available-locations', protect, getAvailableLocations);

export default router;
