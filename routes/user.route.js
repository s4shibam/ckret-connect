// user

import { Router } from 'express';
import {
  getUserDetailsByUsername,
  googleProviderSignIn,
  toggleInboxStatus,
  updateFeedbackMessage,
  updateName,
  updateUsername
} from '../controllers/user.controller.js';
import { isAuthenticated } from '../middleware/authenticate.js';
const router = Router();

router.post('/auth/google-signin', googleProviderSignIn);

router.put('/name', isAuthenticated, updateName);

router.put('/username', isAuthenticated, updateUsername);

router.put('/feedback-message', isAuthenticated, updateFeedbackMessage);

router.put('/inbox-status', isAuthenticated, toggleInboxStatus);

router.get('/details/:username', getUserDetailsByUsername);

export default router;
