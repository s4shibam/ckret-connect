import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { AUTH_PROVIDER, CHAR_SIZE_LIMIT } from '../constants/index'
import { mg } from '../models'
import { decodeGoogleToken } from '../services/google-client'
import {
  createSigninResponseObj,
  isInvalidLength,
  isValidAvatar,
  isValidUsername
} from '../utils/index'
import { throwError } from '../utils/throw-error'

type TAnonymousSignUpReqBody = {
  username: string
  password: string
}

/*
USE: Create new user with username and password
ROUTE: user/auth/anonymous-signup
METHOD: POST
*/
export const anonymousSignUp = async (req: Request, res: Response) => {
  const { username, password } = req?.body as TAnonymousSignUpReqBody

  if (!username || !password) {
    throwError('Username and password are required', 400)
  }

  if (!isValidUsername(username)) {
    throwError('Invalid username format', 400)
  }

  if (isInvalidLength(password, CHAR_SIZE_LIMIT.password)) {
    throwError(
      `Password length should be between ${CHAR_SIZE_LIMIT.password.min} to ${CHAR_SIZE_LIMIT.password.max} characters`,
      400
    )
  }

  const existingUser = await mg.user.findOne({ username })
  if (existingUser) {
    throwError('Username already taken', 400)
  }

  const newUser = await mg.user.create({
    name: username,
    username,
    password,
    email: `${username}@anonymous.user`,
    auth_provider: AUTH_PROVIDER.anonymous
  })

  await mg.stat.findOneAndUpdate(
    {},
    { $inc: { anonymous_users_count: 1 } },
    { upsert: true }
  )

  res.status(201).json({
    message: 'Account created successfully',
    data: createSigninResponseObj(newUser)
  })
}

type TAnonymousSignInReqBody = {
  username: string
  password: string
}

/*
USE: Sign in existing anonymous user
ROUTE: user/auth/anonymous-signin
METHOD: POST
*/
export const anonymousSignIn = async (req: Request, res: Response) => {
  const { username, password } = req?.body as TAnonymousSignInReqBody

  if (!username || !password) {
    throwError('Username and password are required', 400)
  }

  const user = await mg.user
    .findOne({
      username,
      auth_provider: AUTH_PROVIDER.anonymous
    })
    .select('+password')

  if (!user) {
    throwError('Invalid credentials', 401)
  }

  const isPasswordValid = await user.comparePassword(password)
  if (!isPasswordValid) {
    throwError('Invalid credentials', 401)
  }

  res.status(200).json({
    message: 'Signed in successfully',
    data: createSigninResponseObj(user)
  })
}

type TGoogleProviderSignInReqBody = {
  token?: string
}

/*
USE: Create new user and return details or return existing user  
ROUTE: user/auth/google-signin
METHOD: POST
*/
export const googleProviderSignIn = async (req: Request, res: Response) => {
  const { token } = req?.body as TGoogleProviderSignInReqBody

  const { email, name } = await decodeGoogleToken(token)
  const userDoc = await mg.user.findOne({ email })

  if (userDoc) {
    res.status(201).json({
      message: 'Signed in successfully',
      data: createSigninResponseObj(userDoc)
    })
    return
  }

  const newUser = await mg.user.create({
    name,
    email,
    auth_provider: AUTH_PROVIDER.google
  })

  newUser.username = newUser._id.toString()
  await newUser.save()

  await mg.stat.findOneAndUpdate(
    {},
    {
      $addToSet: { registered_users: email }
    },
    { upsert: true }
  )

  res.status(201).json({
    message: 'Signed in successfully',
    data: createSigninResponseObj(newUser)
  })
}

type TLinkGoogleAccountReqBody = {
  token: string
}

/*
USE: Link anonymous account with Google account
ROUTE: user/auth/link-google
METHOD: POST
*/
export const linkGoogleAccount = async (req: Request, res: Response) => {
  const { token } = req?.body as TLinkGoogleAccountReqBody
  const user = req.user

  if (user.auth_provider !== AUTH_PROVIDER.anonymous) {
    throwError('Only anonymous accounts can be linked to Google', 400)
  }

  const { email, name } = await decodeGoogleToken(token)

  const existingGoogleUser = await mg.user.findOne({ email })
  if (existingGoogleUser) {
    throwError('This Google account is already linked to another user', 400)
  }

  user.email = email
  user.name = name
  user.auth_provider = AUTH_PROVIDER.google
  user.password = undefined
  await user.save()

  await mg.stat.findOneAndUpdate(
    {},
    {
      $addToSet: { registered_users: email }
    },
    { upsert: true }
  )

  await mg.stat.findOneAndUpdate(
    {},
    { $inc: { anonymous_users_count: -1 } },
    { upsert: true }
  )

  res.status(200).json({
    message: 'Successfully linked Google account',
    data: createSigninResponseObj(user)
  })
}

type TUpdateNameReqBody = {
  name: string
}

/*
USE: Update name
ROUTE: user/name
METHOD: PUT
*/
export const updateName = async (req: Request, res: Response) => {
  const user = req.user
  const { name } = req?.body as TUpdateNameReqBody

  if (!name) {
    throwError('Name is required', 400)
  }

  if (isInvalidLength(name, CHAR_SIZE_LIMIT.name)) {
    throwError(
      `Name length should be between ${CHAR_SIZE_LIMIT.name.min} to ${CHAR_SIZE_LIMIT.name.max} characters`,
      400
    )
  }

  user.name = name
  await user.save()

  res.status(200).json({
    message: 'Successfully updated your name',
    data: { name }
  })
}

type TUpdateUsernameReqBody = {
  username: string
}

/*
USE: Update username
ROUTE: user/username
METHOD: PUT
*/
export const updateUsername = async (req: Request, res: Response) => {
  const user = req.user
  const { username } = req?.body as TUpdateUsernameReqBody

  if (!username) {
    throwError('Username is required', 400)
  }

  if (!isValidUsername(username)) {
    throwError('Invalid username format', 400)
  }

  if (username === user.username) {
    throwError('This is already your username', 400)
  }

  const isUserWithSameUsernameExists = await mg.user.findOne({ username })

  if (isUserWithSameUsernameExists) {
    throwError('Username not available', 400)
  }

  user.username = username
  await user.save()

  res.status(200).json({
    message: 'Username updated successfully',
    data: { username }
  })
}

type TUpdateAvatarReqBody = {
  avatar: string
}

/*
USE: Update avatar emoji
ROUTE: user/avatar
METHOD: PUT
*/
export const updateAvatar = async (req: Request, res: Response) => {
  const { avatar } = req?.body as TUpdateAvatarReqBody
  const user = req.user

  if (!avatar) {
    throwError('Avatar emoji is required', 400)
  }

  if (!isValidAvatar(avatar)) {
    throwError('Avatar must be a single emoji', 400)
  }

  user.avatar = avatar
  await user.save()

  res.status(200).json({
    message: 'Successfully updated your avatar',
    data: { avatar }
  })
}

type TUpdateFeedbackMessageReqBody = {
  feedbackMessage: string
}

/*
USE: Update feedback message
ROUTE: user/feedback-message
METHOD: PUT
*/
export const updateFeedbackMessage = async (req: Request, res: Response) => {
  const user = req.user
  const { feedbackMessage } = req?.body as TUpdateFeedbackMessageReqBody

  if (!feedbackMessage) {
    throwError('Feedback message is required', 400)
  }

  if (isInvalidLength(feedbackMessage, CHAR_SIZE_LIMIT.feedback_message)) {
    throwError(
      `Feedback message length should be between ${CHAR_SIZE_LIMIT.feedback_message.min} to ${CHAR_SIZE_LIMIT.feedback_message.max} characters`,
      400
    )
  }

  user.feedback_message = feedbackMessage
  await user.save()

  res.status(200).json({
    message: 'Successfully updated your feedback message',
    data: { feedback_message: feedbackMessage }
  })
}

/*
USE: Toggle inbox status 
ROUTE: user/inbox-status
METHOD: PUT
*/
export const toggleInboxStatus = async (req: Request, res: Response) => {
  const user = req.user

  const initialInboxStatus = user?.is_inbox_enabled

  user.is_inbox_enabled = !initialInboxStatus
  await user.save()

  const updatedInboxStatus = !initialInboxStatus ? 'enabled' : 'disabled'

  res.status(200).json({
    message: `Inbox ${updatedInboxStatus}`,
    data: { is_inbox_enabled: !initialInboxStatus }
  })
}

type TGetUserDetailsByUsernameReqParams = {
  username: string
}

/*
USE: Provide user details for message submission page using find by username
ROUTE: user/details/:username
METHOD: GET
*/
export const getUserDetailsByUsername = async (req: Request, res: Response) => {
  const { username } = req?.params as TGetUserDetailsByUsernameReqParams

  if (!username) {
    throwError('Username is required', 400)
  }

  const isMongoId = mongoose.Types.ObjectId.isValid(username)

  const query: Record<string, any> = isMongoId
    ? { _id: username }
    : { username }

  query.is_inbox_enabled = true

  const user = await mg.user.findOne(query).select({
    _id: 1,
    name: 1,
    username: 1,
    avatar: 1,
    feedback_message: 1,
    inbox_max_size: 1
  })

  if (!user) {
    throwError('User not found', 404)
  }

  const currentMessageCount = await mg.message.countDocuments({
    recipient: user._id
  })

  const isInboxFull = currentMessageCount >= user.inbox_max_size

  if (isInboxFull) {
    res.status(200).json({
      message: `${user.name}'s inbox is full. To allow new messages, request that some old ones be deleted.`,
      data: {
        ...user.toJSON(),
        is_inbox_full: isInboxFull
      }
    })
    return
  }

  res.status(200).json({
    message: 'Successfully fetched user details',
    data: {
      ...user.toJSON(),
      is_inbox_full: isInboxFull
    }
  })
}

type TGetUserProfileByUsernameReqParams = {
  username: string
}

/*
USE: Get user's public profile including public messages and sketches
ROUTE: user/profile/:username
METHOD: GET
*/
export const getUserProfileByUsername = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username } = req?.params as TGetUserProfileByUsernameReqParams

  if (!username) {
    throwError('Username is required', 400)
  }

  const isMongoId = mongoose.Types.ObjectId.isValid(username)
  const query = isMongoId ? { _id: username } : { username }

  const user = await mg.user.findOne(query).select({
    _id: 1,
    name: 1,
    username: 1,
    avatar: 1,
    is_inbox_enabled: 1
  })

  if (!user || !user.is_inbox_enabled) {
    throwError('User not found', 404)
  }

  // Get public messages and sketches
  const publicMessages = await mg.message
    .find({
      recipient: user._id,
      show_in_profile: true
    })
    .sort({ updatedAt: -1 })

  const publicSketches = await mg.sketch
    .find({
      recipient: user._id,
      show_in_profile: true
    })
    .sort({ updatedAt: -1 })

  res.status(200).json({
    message: 'Successfully fetched user profile',
    data: {
      ...user.toJSON(),
      messages: publicMessages,
      sketches: publicSketches
    }
  })
}
