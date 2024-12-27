import { Request, Response } from 'express'
import { mg } from '../../models'
import { encryptMessage } from '../../utils/crypto'
import { throwError } from '../../utils/throw-error'

type TReplyToMessageReqParams = {
  mid: string
}

type TReplyToMessageReqBody = {
  replyContent: string
}

/*
USE: Add or update reply to a message
ROUTE: message/reply/:mid
METHOD: PUT
*/
export const replyToMessage = async (req: Request, res: Response) => {
  const user = req.user
  const { mid } = req?.params as TReplyToMessageReqParams
  const { replyContent } = req?.body as TReplyToMessageReqBody

  if (!replyContent) {
    throwError('Reply content is required', 400)
  }

  const message = await mg.message.findOne({
    _id: mid,
    recipient: user._id
  })

  if (!message) {
    throwError('Message not found', 404)
  }

  const encryptedReply = encryptMessage(replyContent)
  message.encrypted_reply = encryptedReply
  message.show_in_profile = true
  await message.save()

  res.status(200).json({
    message: 'Reply added successfully'
  })
}
