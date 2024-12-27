import { Router } from 'express'
import {
  anonymousSignIn,
  anonymousSignUp,
  getUserDetailsByUsername,
  getUserProfileByUsername,
  googleProviderSignIn,
  linkGoogleAccount,
  toggleInboxStatus,
  updateAvatar,
  updateFeedbackMessage,
  updateName,
  updateUsername
} from '../controllers/user'
import { isAuthenticated } from '../middlewares/is-authenticated'

const router = Router()

router.post('/auth/anonymous-signup', anonymousSignUp)

router.post('/auth/anonymous-signin', anonymousSignIn)

router.post('/auth/google-signin', googleProviderSignIn)

router.get('/details/:username', getUserDetailsByUsername)

// Authenticated user routes

router.use(isAuthenticated)

router.post('/auth/link-google', linkGoogleAccount)

router.put('/name', updateName)

router.put('/username', updateUsername)

router.put('/avatar', updateAvatar)

router.put('/feedback-message', updateFeedbackMessage)

router.put('/inbox-status', toggleInboxStatus)

router.get('/profile/:username', getUserProfileByUsername)

export { router as userRouter }
