import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { mg } from '../../models'
import { encryptMessage } from '../../utils/crypto'
import { throwError } from '../../utils/throw-error'

type TSubmitMessageReqBody = {
  recipientUsername: string
  messageContent: string
}

/*
USE: Submit anonymous message
ROUTE: message/submit
METHOD: POST
*/
export const submitMessage = async (req: Request, res: Response) => {
  const { recipientUsername, messageContent } =
    req?.body as TSubmitMessageReqBody

  if (!recipientUsername || !messageContent) {
    throwError('Insufficient details', 400)
  }

  const isMongoId = mongoose.Types.ObjectId.isValid(recipientUsername)

  const query = isMongoId
    ? { _id: recipientUsername }
    : { username: recipientUsername }

  const user = await mg.user.findOne(query)

  if (!user) {
    throwError('User not found', 404)
  }

  if (!user.is_inbox_enabled) {
    throwError(`${user.name}'s inbox is disabled`, 400)
  }

  if (messageContent.length > user.message_max_length) {
    throwError(
      `Message length should be between 1 to ${user.message_max_length} characters`,
      400
    )
  }

  const currentMessageCount = await mg.message.countDocuments({
    recipient: user._id
  })

  if (currentMessageCount >= user.inbox_max_size) {
    throwError(
      `${user.name}'s inbox is full. To allow new messages, request that some old ones be deleted.`,
      400
    )
  }

  const encryptedContent = encryptMessage(messageContent)

  await mg.message.create({
    recipient: user._id,
    encrypted_content: encryptedContent
  })

  await mg.stat.findOneAndUpdate(
    {},
    { $inc: { total_messages_count: 1 } },
    { upsert: true }
  )

  res.status(200).json({
    message: 'Message sent successfully'
  })
}
