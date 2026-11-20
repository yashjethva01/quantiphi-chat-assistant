import { Router } from 'express';
import {
  createChat,
  deleteConversation,
  getConversation,
  listConversations,
  regenerateChat,
  searchConversations,
  updateTone
} from '../controllers/chatController.js';

const router = Router();

router.get('/conversations/search', searchConversations);
router.get('/conversations', listConversations);
router.get('/conversations/:id', getConversation);
router.delete('/conversations/:id', deleteConversation);
router.patch('/conversations/:id/tone', updateTone);
router.post('/chat', createChat);
router.post('/chat/regenerate', regenerateChat);

export default router;

