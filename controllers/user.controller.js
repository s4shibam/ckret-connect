import mongoose from 'mongoose';
import {
  AUTH_PROVIDER,
  CHAR_SIZE_LIMIT,
  MESSAGE_TYPE
} from '../constants/index.js';
import { catchAsyncError as cae } from '../middleware/catch-async-error.js';
import Stat from '../models/stat.model.js';
import User from '../models/user.model.js';
import CustomError from '../utils/custom-error.js';
import {
  createSigninResponseObj,
  isInvalidLength,
  isValidUsername
} from '../utils/index.js';

/*
USE: Create new user and return details or return existing user  
ROUTE: user/auth/google-signin
METHOD: POST
*/
export const googleProviderSignIn = cae(async (req, res, next) => {
  const { name, email } = req?.body;

  if (!email || !name) {
    return next(new CustomError('Insufficient details', 400));
  }

  const userDoc = await User.findOne({ email });

  if (userDoc) {
    return res.status(201).json({
      success: true,
      message: 'Signed in successfully',
      data: createSigninResponseObj(userDoc)
    });
  }

  const newUser = await User.create({
    name,
    email,
    auth_provider: AUTH_PROVIDER.google
  });

  newUser.username = newUser._id.toString();
  await newUser.save();

  await Stat.findOneAndUpdate(
    {},
    {
      $addToSet: { registered_users: email }
    },
    { upsert: true }
  );

  res.status(201).json({
    success: true,
    message: 'Signed in successfully',
    data: createSigninResponseObj(newUser)
  });
});

/*
USE: Update name
ROUTE: user/name
METHOD: PUT
*/
export const updateName = cae(async (req, res, next) => {
  const { user } = req;
  const { name } = req?.body;

  if (!name) {
    return next(new CustomError('Name is required', 400));
  }

  if (isInvalidLength(name, CHAR_SIZE_LIMIT.NAME)) {
    return next(
      new CustomError(
        `Name length should be between ${CHAR_SIZE_LIMIT.NAME.MIN} to ${CHAR_SIZE_LIMIT.NAME.MAX} characters`,
        400
      )
    );
  }

  user.name = name;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Successfully updated your name',
    data: { name }
  });
});

/*
USE: Update username
ROUTE: user/username
METHOD: PUT
*/
export const updateUsername = cae(async (req, res, next) => {
  const { user } = req;
  const { username } = req?.body;

  if (!username) {
    return next(new CustomError('Username is required', 400));
  }

  if (!isValidUsername(username)) {
    return next(new CustomError('Invalid username format', 400));
  }

  if (username === user.username) {
    return next(new CustomError('This is already your username', 400));
  }

  const isUserWithSameUsernameExists = await User.findOne({ username });

  if (isUserWithSameUsernameExists) {
    return next(new CustomError('Username not available', 400));
  }

  user.username = username;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Username updated successfully',
    data: { username }
  });
});

/*
USE: Update feedback message
ROUTE: user/feedback-message
METHOD: PUT
*/
export const updateFeedbackMessage = cae(async (req, res, next) => {
  const { user } = req;
  const { feedbackMessage } = req?.body;

  if (!feedbackMessage) {
    return next(new CustomError('Feedback message is required', 400));
  }

  if (isInvalidLength(feedbackMessage, CHAR_SIZE_LIMIT.FEEDBACK_MESSAGE)) {
    return next(
      new CustomError(
        `Feedback message length should be between ${CHAR_SIZE_LIMIT.FEEDBACK_MESSAGE.MIN} to ${CHAR_SIZE_LIMIT.FEEDBACK_MESSAGE.MAX} characters`,
        400
      )
    );
  }

  user.feedback_message = feedbackMessage;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Successfully updated your feedback message',
    data: { feedback_message: feedbackMessage }
  });
});

/*
USE: Toggle inbox status 
ROUTE: user/inbox-status
METHOD: PUT
*/
export const toggleInboxStatus = cae(async (req, res, next) => {
  const { user } = req;

  const initialInboxStatus = user?.is_inbox_enabled;

  user.is_inbox_enabled = !initialInboxStatus;
  await user.save();

  const updatedInboxStatus = !initialInboxStatus ? 'enabled' : 'disabled';

  res.status(200).json({
    success: true,
    message: `Inbox ${updatedInboxStatus}`,
    data: { is_inbox_enabled: !initialInboxStatus }
  });
});

/*
USE: Provide user details for message submission page using find by username
ROUTE: user/details/:username
METHOD: GET
*/
export const getUserDetailsByUsername = cae(async (req, res, next) => {
  const { username } = req?.params;

  if (!username) {
    return next(new CustomError('Username is required', 400));
  }

  const isMongoId = mongoose.Types.ObjectId.isValid(username);

  const query = isMongoId ? { _id: username } : { username };

  query.is_inbox_enabled = true;

  const user = await User.findOne(query);

  if (!user) {
    return next(new CustomError('User not found', 404));
  }

  const isInboxFull = user.inbox_current_size === user.inbox_max_size;

  user.email = undefined;
  user.auth_provider = undefined;
  user.inbox_current_size = undefined;
  user.inbox_max_size = undefined;
  user.is_inbox_enabled = undefined;
  user.__v = undefined;

  if (isInboxFull) {
    return res.status(200).json({
      success: true,
      message: `${user.name}'s inbox is full. To allow new messages, request that some old ones be deleted.`,
      data: {
        ...user.toJSON(),
        is_inbox_full: isInboxFull
      }
    });
  }

  res.status(200).json({
    success: true,
    message: 'Successfully fetched user details',
    data: {
      ...user.toJSON(),
      is_inbox_full: isInboxFull,
      message_type: MESSAGE_TYPE.ANONYMOUS_MESSAGE
    }
  });
});
