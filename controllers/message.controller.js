import mongoose from 'mongoose';
import { catchAsyncError as cae } from '../middleware/catch-async-error.js';
import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import CustomError from '../utils/custom-error.js';

/*
USE: Submit anonymous message
ROUTE: message/submit
METHOD: POST
*/
export const submitMessage = cae(async (req, res, next) => {
  const { recipientUsername, messageContent } = req?.body;

  if (!recipientUsername || !messageContent) {
    return next(new CustomError('Insufficient details', 400));
  }

  const isMongoId = mongoose.Types.ObjectId.isValid(recipientUsername);

  const query = isMongoId
    ? { _id: recipientUsername }
    : { username: recipientUsername };

  const user = await User.findOne(query);

  if (!user) {
    return next(new CustomError('User not found', 404));
  }

  if (!user.is_inbox_enabled) {
    return next(new CustomError(`${user.name}'s inbox is disabled`, 400));
  }

  if (messageContent.length > user.message_max_length) {
    return next(
      new CustomError(
        `Message length can not be more than ${user.message_max_length} characters`,
        400
      )
    );
  }

  if (user.inbox_current_size === user.inbox_max_size) {
    return next(
      new CustomError(
        `${user.name}'s inbox is full. To allow new messages, request that some old ones be deleted.`,
        400
      )
    );
  }

  await Message.create({
    recipient: user._id,
    content: messageContent
  });

  user.inbox_current_size += 1;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Message sent successfully'
  });
});

/*
USE: Get all messages
ROUTE: message/all
METHOD: GET
*/
export const getAllMessages = cae(async (req, res, next) => {
  const messages = await Message.find({ recipient: req?.user?._id });

  res.status(200).json({
    success: true,
    message: 'Successfully fetched your messages',
    data: messages
  });
});

/*
USE: Delete message by id
ROUTE: message/single-message/:mid
METHOD: DELETE
*/
export const deleteSingleMessage = cae(async (req, res, next) => {
  const { user } = req;
  const { mid } = req?.params;

  const message = await Message.findByIdAndDelete(mid);

  if (!message) {
    return next(new CustomError('Message not found', 404));
  }

  user.inbox_current_size -= 1;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Successfully deleted the message'
  });
});

/*
USE: Delete all the messages
ROUTE: message/all
METHOD: DELETE
*/
export const deleteAllMessages = cae(async (req, res, next) => {
  const { user } = req;
  const { _id, name } = req?.user;

  const result = await Message.deleteMany({ recipient: _id });

  if (result.deletedCount === 0) {
    return next(new CustomError(`No messages found for ${name}`, 404));
  }

  user.inbox_current_size = 0;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Successfully deleted all the messages'
  });
});
