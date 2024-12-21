import mongoose from 'mongoose'
import { catchAsyncError as cae } from '../middleware/catch-async-error.js'
import Message from '../models/message.model.js'
import Stat from '../models/stat.model.js'
import User from '../models/user.model.js'
import CustomError from '../utils/custom-error.js'
import { encryptMessage } from '../utils/encryption.js'

/*
USE: Submit anonymous message
ROUTE: message/submit
METHOD: POST
*/
export const submitMessage = cae(async (req, res, next) => {
  const { recipientUsername, messageContent } = req?.body || {}

  if (!recipientUsername || !messageContent) {
    return next(new CustomError('Insufficient details', 400))
  }

  const isMongoId = mongoose.Types.ObjectId.isValid(recipientUsername)

  const query = isMongoId
    ? { _id: recipientUsername }
    : { username: recipientUsername }

  const user = await User.findOne(query)

  if (!user) {
    return next(new CustomError('User not found', 404))
  }

  if (!user.is_inbox_enabled) {
    return next(new CustomError(`${user.name}'s inbox is disabled`, 400))
  }

  if (messageContent.length > user.message_max_length) {
    return next(
      new CustomError(
        `Message length should be between 1 to ${user.message_max_length} characters`,
        400
      )
    )
  }

  // Count current messages for the user
  const currentMessageCount = await Message.countDocuments({
    recipient: user._id
  })

  if (currentMessageCount >= user.inbox_max_size) {
    return next(
      new CustomError(
        `${user.name}'s inbox is full. To allow new messages, request that some old ones be deleted.`,
        400
      )
    )
  }

  // Encrypt the message content before storing
  const encryptedContent = encryptMessage(messageContent)

  await Message.create({
    recipient: user._id,
    encrypted_content: encryptedContent
  })

  await user.save()

  // Store message count stats
  await Stat.findOneAndUpdate(
    {},
    { $inc: { total_messages_count: 1 } },
    { upsert: true }
  )

  res.status(200).json({
    success: true,
    message: 'Message sent successfully'
  })
})

/*
USE: Get all messages
ROUTE: message/all
METHOD: GET
*/
export const getAllMessages = cae(async (req, res) => {
  const messages = await Message.find({ recipient: req?.user || {}?._id }).sort(
    {
      createdAt: -1
    }
  )

  res.status(200).json({
    success: true,
    message: 'Successfully fetched your messages',
    data: messages
  })
})

/*
USE: Delete message by id
ROUTE: message/single-message/:mid
METHOD: DELETE
*/
export const deleteSingleMessage = cae(async (req, res, next) => {
  const { user } = req
  const { mid } = req?.params || {}

  const message = await Message.findByIdAndDelete(mid)

  if (!message) {
    return next(new CustomError('Message not found', 404))
  }

  await user.save()

  res.status(200).json({
    success: true,
    message: 'Successfully deleted the message'
  })
})

/*
USE: Delete all the messages
ROUTE: message/all
METHOD: DELETE
*/
export const deleteAllMessages = cae(async (req, res, next) => {
  const { user } = req
  const { _id, name } = req?.user || {}

  const result = await Message.deleteMany({ recipient: _id })

  if (result.deletedCount === 0) {
    return next(new CustomError(`No messages found for ${name}`, 404))
  }

  await user.save()

  res.status(200).json({
    success: true,
    message: 'Successfully deleted all the messages'
  })
})

/*
USE: Add or update reply to a message
ROUTE: message/reply/:mid
METHOD: PUT
*/
export const replyToMessage = cae(async (req, res, next) => {
  const { mid } = req?.params || {}
  const { replyContent } = req?.body || {}

  if (!replyContent) {
    return next(new CustomError('Reply content is required', 400))
  }

  const message = await Message.findById(mid)

  if (!message) {
    return next(new CustomError('Message not found', 404))
  }

  // Check if user owns the message
  if (message.recipient.toString() !== req.user._id.toString()) {
    return next(new CustomError('Not authorized to reply to this message', 403))
  }

  // Encrypt the reply content
  const encryptedReply = encryptMessage(replyContent)
  message.encrypted_reply = encryptedReply
  message.show_in_profile = true
  await message.save()

  res.status(200).json({
    success: true,
    message: 'Reply added successfully'
  })
})

/*
USE: Toggle message visibility in profile
ROUTE: message/visibility/:mid
METHOD: PUT
*/
export const toggleMessageVisibility = cae(async (req, res, next) => {
  const { mid } = req?.params || {}

  const message = await Message.findById(mid)

  if (!message) {
    return next(new CustomError('Message not found', 404))
  }

  // Check if user owns the message
  if (message.recipient.toString() !== req.user._id.toString()) {
    return next(new CustomError('Not authorized to modify this message', 403))
  }

  // If trying to make visible in profile but no reply exists
  if (!message.show_in_profile && !message.encrypted_reply) {
    return next(
      new CustomError('Cannot show message in profile without a reply', 400)
    )
  }

  message.show_in_profile = !message.show_in_profile
  await message.save()

  res.status(200).json({
    success: true,
    message: `Message ${message.show_in_profile ? 'will' : 'will not'} be shown in public profile`
  })
})
