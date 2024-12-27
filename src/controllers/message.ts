import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { mg } from '../models/index'
import { encryptMessage } from '../utils/crypto'
import { throwError } from '../utils/throw-error'

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

/*
USE: Get all messages
ROUTE: message/all
METHOD: GET
*/
export const getAllMessages = async (req: Request, res: Response) => {
  const messages = await mg.message.find({ recipient: req?.user?._id }).sort({
    createdAt: -1
  })

  res.status(200).json({
    message: 'Successfully fetched your messages',
    data: messages
  })
}

type TDeleteSingleMessageReqParams = {
  mid: string
}

/*
USE: Delete message by id
ROUTE: message/single-message/:mid
METHOD: DELETE
*/
export const deleteSingleMessage = async (req: Request, res: Response) => {
  const user = req.user
  const { mid } = req?.params as TDeleteSingleMessageReqParams

  const message = await mg.message.findById(mid)

  if (!message) {
    throwError('Message not found', 404)
  }

  if (message.recipient.toString() !== user._id.toString()) {
    throwError('Not authorized to delete this message', 403)
  }

  await message.deleteOne()

  res.status(200).json({
    message: 'Successfully deleted the message'
  })
}

/*
USE: Delete all the messages
ROUTE: message/all
METHOD: DELETE
*/
export const deleteAllMessages = async (req: Request, res: Response) => {
  const user = req.user

  const result = await mg.message.deleteMany({ recipient: user._id })

  if (result.deletedCount === 0) {
    throwError(`No messages found for ${user.name}`, 404)
  }

  res.status(200).json({
    message: 'Successfully deleted all the messages'
  })
}

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

type TToggleMessageVisibilityReqParams = {
  mid: string
}

/*
USE: Toggle message visibility in profile
ROUTE: message/visibility/:mid
METHOD: PUT
*/
export const toggleMessageVisibility = async (req: Request, res: Response) => {
  const user = req.user
  const { mid } = req?.params as TToggleMessageVisibilityReqParams

  const message = await mg.message.findOne({ _id: mid, recipient: user._id })

  if (!message) {
    throwError('Message not found', 404)
  }

  if (!message.show_in_profile && !message.encrypted_reply) {
    throwError('Cannot show message in profile without a reply', 400)
  }

  message.show_in_profile = !message.show_in_profile
  await message.save()

  res.status(200).json({
    message: `Message ${message.show_in_profile ? 'will' : 'will not'} be shown in public profile`
  })
}
