import { Router } from 'express'
import { deleteAllMessages } from '../controllers/message/delete-all-messages'
import { deleteSingleMessage } from '../controllers/message/delete-single-message'
import { getAllMessages } from '../controllers/message/get-all-messages'
import { replyToMessage } from '../controllers/message/reply-to-message'
import { submitMessage } from '../controllers/message/submit-message'
import { toggleMessageVisibility } from '../controllers/message/toggle-message-visibility'
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
