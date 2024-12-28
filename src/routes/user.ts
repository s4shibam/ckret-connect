import { Router } from 'express'
import { anonymousSignIn } from '../controllers/user/anonymous-signin'
import { anonymousSignUp } from '../controllers/user/anonymous-signup'
import { getUserDetailsByUsername } from '../controllers/user/get-user-details-by-username'
import { getUserProfileByUsername } from '../controllers/user/get-user-profile-by-username'
import { googleProviderSignIn } from '../controllers/user/google-provider-signin'
import { linkGoogleAccount } from '../controllers/user/link-google-account'
import { toggleInboxStatus } from '../controllers/user/toggle-inbox-status'
import { updateAvatar } from '../controllers/user/update-avatar'
import { updateFeedbackMessage } from '../controllers/user/update-feedback-message'
import { updateName } from '../controllers/user/update-name'
import { updateUsername } from '../controllers/user/update-username'
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
