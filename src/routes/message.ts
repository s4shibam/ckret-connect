import { Router } from 'express'
import {
  deleteAllMessages,
  deleteSingleMessage,
  getAllMessages,
  replyToMessage,
  submitMessage,
  toggleMessageVisibility
} from '../controllers/message'
import { isAuthenticated } from '../middlewares/is-authenticated'

const router = Router()

router.post('/submit', submitMessage)

// Authenticated message routes

router.use(isAuthenticated)

router.get('/all', getAllMessages)

router.delete('/single-message/:mid', deleteSingleMessage)

router.delete('/all', deleteAllMessages)

router.put('/reply/:mid', replyToMessage)

router.put('/visibility/:mid', toggleMessageVisibility)

export { router as messageRouter }
