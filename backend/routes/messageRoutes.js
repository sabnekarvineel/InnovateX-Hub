import express from 'express';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markMessageAsSeen,
  markConversationAsSeen,
  uploadMessageImage,
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/conversation/:userId', protect, getOrCreateConversation);
router.get('/conversation/:conversationId/messages', protect, getMessages);
router.post('/send', protect, sendMessage);
router.put('/message/:messageId/seen', protect, markMessageAsSeen);
router.put('/conversation/:conversationId/seen', protect, markConversationAsSeen);
router.post('/upload/image', protect, upload.single('image'), uploadMessageImage);

export default router;
