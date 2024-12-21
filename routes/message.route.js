// message

import { Router } from 'express'
import {
  deleteAllMessages,
  deleteSingleMessage,
  getAllMessages,
  submitMessage,
  replyToMessage,
  toggleMessageVisibility
} from '../controllers/message.controller.js'
import { isAuthenticated } from '../middleware/authenticate.js'
const router = Router()

router.post('/submit', submitMessage)

router.get('/all', isAuthenticated, getAllMessages)

router.delete('/single-message/:mid', isAuthenticated, deleteSingleMessage)

router.delete('/all', isAuthenticated, deleteAllMessages)

router.put('/reply/:mid', isAuthenticated, replyToMessage)

router.put('/visibility/:mid', isAuthenticated, toggleMessageVisibility)

export default router
