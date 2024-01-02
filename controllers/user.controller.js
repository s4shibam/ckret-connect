import mongoose from 'mongoose';
import { AUTH_PROVIDER, DEFAULT_CONFIG } from '../constants/index.js';
import { catchAsyncError as cae } from '../middleware/catch-async-error.js';
import User from '../models/user.model.js';
import CustomError from '../utils/custom-error.js';
import {
  createUserObjectForSessionToken,
  generateToken,
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
    const token = generateToken({
      obj: createUserObjectForSessionToken(userDoc),
      expiresIn: DEFAULT_CONFIG.signin_token_expiry
    });
    return res.status(201).json({
      success: true,
      message: 'Signed in successfully',
      data: { token }
    });
  }

  const newUser = await User.create({
    name,
    email,
    auth_provider: AUTH_PROVIDER.google
  });

  newUser.username = newUser._id.toString();
  await newUser.save();

  const token = generateToken({
    obj: createUserObjectForSessionToken(newUser),
    expiresIn: DEFAULT_CONFIG.signin_token_expiry
  });

  res.status(201).json({
    success: true,
    message: 'Signed in successfully',
    data: { token }
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

  user.name = name;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Successfully updated your name'
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
    message: 'Username updated successfully'
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

  if (feedbackMessage.length > DEFAULT_CONFIG.feedback_message_max_length) {
    return next(
      new CustomError(
        `Feedback message length can not be more than ${DEFAULT_CONFIG.feedback_message_max_length} characters`,
        400
      )
    );
  }

  user.feedback_message = feedbackMessage;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Successfully updated your feedback message'
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
    message: `Inbox ${updatedInboxStatus}`
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

  if (user.inbox_current_size === user.inbox_max_size) {
    return next(
      new CustomError(
        `${user.name}'s inbox is full. To allow new messages, request that some old ones be deleted.`,
        400
      )
    );
  }

  user.email = undefined;
  user.auth_provider = undefined;
  user.inbox_current_size = undefined;
  user.inbox_max_size = undefined;
  user.__v = undefined;

  res.status(200).json({
    success: true,
    message: 'Successfully fetched user details',
    data: user
  });
});
