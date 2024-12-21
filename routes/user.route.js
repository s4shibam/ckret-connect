// user

import { Router } from 'express'
import {
  anonymousSignIn,
  anonymousSignUp,
  getUserDetailsByUsername,
  getUserProfileByUsername,
  googleProviderSignIn,
  linkGoogleAccount,
  toggleInboxStatus,
  updateFeedbackMessage,
  updateName,
  updateUsername
} from '../controllers/user.controller.js'
import { isAuthenticated } from '../middleware/authenticate.js'
const router = Router()

router.post('/auth/anonymous-signup', anonymousSignUp)

router.post('/auth/anonymous-signin', anonymousSignIn)

router.post('/auth/google-signin', googleProviderSignIn)

router.post('/auth/link-google', isAuthenticated, linkGoogleAccount)

router.put('/name', isAuthenticated, updateName)

router.put('/username', isAuthenticated, updateUsername)

router.put('/feedback-message', isAuthenticated, updateFeedbackMessage)

router.put('/inbox-status', isAuthenticated, toggleInboxStatus)

router.get('/details/:username', getUserDetailsByUsername)

router.get('/profile/:username', getUserProfileByUsername)

export default router
