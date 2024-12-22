import mongoose from 'mongoose'

import {
  AUTH_PROVIDER,
  CHAR_SIZE_LIMIT,
  ENV,
  MESSAGE_TYPE
} from '../constants/index.js'
import { catchAsyncError as cae } from '../middleware/catch-async-error.js'
import Message from '../models/message.model.js'
import Sketch from '../models/sketch.model.js'
import Stat from '../models/stat.model.js'
import User from '../models/user.model.js'
import CustomError from '../utils/custom-error.js'
import { googleClient } from '../utils/google-client.js'
import {
  createSigninResponseObj,
  isInvalidLength,
  isValidAvatar,
  isValidUsername
} from '../utils/index.js'

/*
USE: Create new user with username and password
ROUTE: user/auth/anonymous-signup
METHOD: POST
*/
export const anonymousSignUp = cae(async (req, res, next) => {
  const { username, password } = req?.body || {}

  if (!username || !password) {
    return next(new CustomError('Username and password are required', 400))
  }

  if (!isValidUsername(username)) {
    return next(new CustomError('Invalid username format', 400))
  }

  if (isInvalidLength(password, CHAR_SIZE_LIMIT.PASSWORD)) {
    return next(
      new CustomError(
        `Password length should be between ${CHAR_SIZE_LIMIT.PASSWORD.MIN} to ${CHAR_SIZE_LIMIT.PASSWORD.MAX} characters`,
        400
      )
    )
  }

  const existingUser = await User.findOne({ username })
  if (existingUser) {
    return next(new CustomError('Username already taken', 400))
  }

  const newUser = await User.create({
    name: username,
    username,
    password,
    email: `${username}@anonymous.user`,
    auth_provider: AUTH_PROVIDER.anonymous
  })

  await Stat.findOneAndUpdate(
    {},
    { $inc: { anonymous_users_count: 1 } },
    { upsert: true }
  )

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: createSigninResponseObj(newUser)
  })
})

/*
USE: Sign in existing anonymous user
ROUTE: user/auth/anonymous-signin
METHOD: POST
*/
export const anonymousSignIn = cae(async (req, res, next) => {
  const { username, password } = req?.body || {}

  if (!username || !password) {
    return next(new CustomError('Username and password are required', 400))
  }

  const user = await User.findOne({
    username,
    auth_provider: AUTH_PROVIDER.anonymous
  }).select('+password')

  if (!user) {
    return next(new CustomError('Invalid credentials', 401))
  }

  const isPasswordValid = await user.comparePassword(password)
  if (!isPasswordValid) {
    return next(new CustomError('Invalid credentials', 401))
  }

  res.status(200).json({
    success: true,
    message: 'Signed in successfully',
    data: createSigninResponseObj(user)
  })
})

/*
USE: Create new user and return details or return existing user  
ROUTE: user/auth/google-signin
METHOD: POST
*/
export const googleProviderSignIn = cae(async (req, res, next) => {
  const { token } = req?.body || {}

  if (!token) {
    return next(new CustomError('Authentication token is required', 400))
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: ENV.google_client_id
  })

  const { email, name } = ticket.getPayload()

  if (!email || !name) {
    return next(new CustomError('Invalid token payload', 400))
  }

  const userDoc = await User.findOne({ email })

  if (userDoc) {
    return res.status(201).json({
      success: true,
      message: 'Signed in successfully',
      data: createSigninResponseObj(userDoc)
    })
  }

  const newUser = await User.create({
    name,
    email,
    auth_provider: AUTH_PROVIDER.google
  })

  newUser.username = newUser._id.toString()
  await newUser.save()

  await Stat.findOneAndUpdate(
    {},
    {
      $addToSet: { registered_users: email }
    },
    { upsert: true }
  )

  res.status(201).json({
    success: true,
    message: 'Signed in successfully',
    data: createSigninResponseObj(newUser)
  })
})

/*
USE: Link anonymous account with Google account
ROUTE: user/auth/link-google
METHOD: POST
*/
export const linkGoogleAccount = cae(async (req, res, next) => {
  const { token } = req?.body || {}
  const { user } = req

  if (!token) {
    return next(new CustomError('Google authentication token is required', 400))
  }

  if (user.auth_provider !== AUTH_PROVIDER.anonymous) {
    return next(
      new CustomError('Only anonymous accounts can be linked to Google', 400)
    )
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: ENV.google_client_id
  })

  const { email, name } = ticket.getPayload()

  if (!email || !name) {
    return next(new CustomError('Invalid token payload', 400))
  }

  const existingGoogleUser = await User.findOne({ email })
  if (existingGoogleUser) {
    return next(
      new CustomError(
        'This Google account is already linked to another user',
        400
      )
    )
  }

  user.email = email
  user.name = name
  user.auth_provider = AUTH_PROVIDER.google

  user.password = undefined

  await user.save()

  await Stat.findOneAndUpdate(
    {},
    {
      $addToSet: { registered_users: email }
    },
    { upsert: true }
  )

  await Stat.findOneAndUpdate(
    {},
    { $inc: { anonymous_users_count: -1 } },
    { upsert: true }
  )

  res.status(200).json({
    success: true,
    message: 'Successfully linked Google account',
    data: createSigninResponseObj(user)
  })
})

/*
USE: Update name
ROUTE: user/name
METHOD: PUT
*/
export const updateName = cae(async (req, res, next) => {
  const { user } = req
  const { name } = req?.body || {}

  if (!name) {
    return next(new CustomError('Name is required', 400))
  }

  if (isInvalidLength(name, CHAR_SIZE_LIMIT.NAME)) {
    return next(
      new CustomError(
        `Name length should be between ${CHAR_SIZE_LIMIT.NAME.MIN} to ${CHAR_SIZE_LIMIT.NAME.MAX} characters`,
        400
      )
    )
  }

  user.name = name
  await user.save()

  res.status(200).json({
    success: true,
    message: 'Successfully updated your name',
    data: { name }
  })
})

/*
USE: Update username
ROUTE: user/username
METHOD: PUT
*/
export const updateUsername = cae(async (req, res, next) => {
  const { user } = req
  const { username } = req?.body || {}

  if (!username) {
    return next(new CustomError('Username is required', 400))
  }

  if (!isValidUsername(username)) {
    return next(new CustomError('Invalid username format', 400))
  }

  if (username === user.username) {
    return next(new CustomError('This is already your username', 400))
  }

  const isUserWithSameUsernameExists = await User.findOne({ username })

  if (isUserWithSameUsernameExists) {
    return next(new CustomError('Username not available', 400))
  }

  user.username = username
  await user.save()

  res.status(200).json({
    success: true,
    message: 'Username updated successfully',
    data: { username }
  })
})

/*
USE: Update avatar emoji
ROUTE: user/avatar
METHOD: PUT
*/
export const updateAvatar = cae(async (req, res, next) => {
  const { user } = req
  const { avatar } = req?.body || {}

  if (!avatar) {
    return next(new CustomError('Avatar emoji is required', 400))
  }

  if (!isValidAvatar(avatar)) {
    return next(new CustomError('Avatar must be a single emoji', 400))
  }

  user.avatar = avatar
  await user.save()

  res.status(200).json({
    success: true,
    message: 'Successfully updated your avatar',
    data: { avatar }
  })
})

/*
USE: Update feedback message
ROUTE: user/feedback-message
METHOD: PUT
*/
export const updateFeedbackMessage = cae(async (req, res, next) => {
  const { user } = req
  const { feedbackMessage } = req?.body || {}

  if (!feedbackMessage) {
    return next(new CustomError('Feedback message is required', 400))
  }

  if (isInvalidLength(feedbackMessage, CHAR_SIZE_LIMIT.FEEDBACK_MESSAGE)) {
    return next(
      new CustomError(
        `Feedback message length should be between ${CHAR_SIZE_LIMIT.FEEDBACK_MESSAGE.MIN} to ${CHAR_SIZE_LIMIT.FEEDBACK_MESSAGE.MAX} characters`,
        400
      )
    )
  }

  user.feedback_message = feedbackMessage
  await user.save()

  res.status(200).json({
    success: true,
    message: 'Successfully updated your feedback message',
    data: { feedback_message: feedbackMessage }
  })
})

/*
USE: Toggle inbox status 
ROUTE: user/inbox-status
METHOD: PUT
*/
export const toggleInboxStatus = cae(async (req, res) => {
  const { user } = req

  const initialInboxStatus = user?.is_inbox_enabled

  user.is_inbox_enabled = !initialInboxStatus
  await user.save()

  const updatedInboxStatus = !initialInboxStatus ? 'enabled' : 'disabled'

  res.status(200).json({
    success: true,
    message: `Inbox ${updatedInboxStatus}`,
    data: { is_inbox_enabled: !initialInboxStatus }
  })
})

/*
USE: Provide user details for message submission page using find by username
ROUTE: user/details/:username
METHOD: GET
*/
export const getUserDetailsByUsername = cae(async (req, res, next) => {
  const { username } = req?.params || {}

  if (!username) {
    return next(new CustomError('Username is required', 400))
  }

  const isMongoId = mongoose.Types.ObjectId.isValid(username)

  const query = isMongoId ? { _id: username } : { username }

  query.is_inbox_enabled = true

  const user = await User.findOne(query)

  if (!user) {
    return next(new CustomError('User not found', 404))
  }

  // Count current messages for the user
  const currentMessageCount = await Message.countDocuments({
    recipient: user._id
  })
  const isInboxFull = currentMessageCount >= user.inbox_max_size

  user.email = undefined
  user.auth_provider = undefined
  user.inbox_max_size = undefined
  user.is_inbox_enabled = undefined
  user.__v = undefined

  if (isInboxFull) {
    return res.status(200).json({
      success: true,
      message: `${user.name}'s inbox is full. To allow new messages, request that some old ones be deleted.`,
      data: {
        ...user.toJSON(),
        is_inbox_full: isInboxFull
      }
    })
  }

  res.status(200).json({
    success: true,
    message: 'Successfully fetched user details',
    data: {
      ...user.toJSON(),
      is_inbox_full: isInboxFull,
      message_type: MESSAGE_TYPE.ANONYMOUS_MESSAGE
    }
  })
})

/*
USE: Get user's public profile including public messages and sketches
ROUTE: user/profile/:username
METHOD: GET
*/
export const getUserProfileByUsername = cae(async (req, res, next) => {
  const { username } = req?.params || {}

  if (!username) {
    return next(new CustomError('Username is required', 400))
  }

  const isMongoId = mongoose.Types.ObjectId.isValid(username)
  const query = isMongoId ? { _id: username } : { username }

  const user = await User.findOne(query).select(
    '_id name username avatar is_inbox_enabled'
  )

  if (!user || !user.is_inbox_enabled) {
    return next(new CustomError('User not found', 404))
  }

  // Get public messages and sketches
  const publicMessages = await Message.find({
    recipient: user._id,
    show_in_profile: true
  }).sort({ updatedAt: -1 })

  const publicSketches = await Sketch.find({
    recipient: user._id,
    show_in_profile: true
  }).sort({ updatedAt: -1 })

  res.status(200).json({
    success: true,
    message: 'Successfully fetched user profile',
    data: {
      ...user.toJSON(),
      messages: publicMessages,
      sketches: publicSketches
    }
  })
})
