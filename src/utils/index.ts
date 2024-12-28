import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../constants/env.js'
import { CHAR_SIZE_LIMIT, DEFAULT_CONFIG } from '../constants/index.js'
import { TUser } from '../types/models.js'
import { throwError } from './throw-error.js'
export const generateToken = ({
  obj,
  expiresIn = '1d'
}: {
  obj: object
  expiresIn: string
}) => {
  return jwt.sign(obj, env.jwt_secret, {
    expiresIn
  })
}

export const verifyToken = ({ token }: { token: string }) => {
  return jwt.verify(token, env.jwt_secret)
}

export const hashPassword = async (password?: string) => {
  if (!password) {
    throwError('Password is required', 400)
  }

  return await bcryptjs.hash(password, 10)
}

export const comparePassword = async (
  password?: string,
  hashedPassword?: string
) => {
  if (!password || !hashedPassword) {
    throwError('Password is required', 400)
  }

  return await bcryptjs.compare(password, hashedPassword)
}

export const createSigninResponseObj = (
  user: Partial<TUser>
): Partial<TUser> & { token: string } => {
  const {
    _id,
    name,
    email,
    auth_provider,
    message_max_length,
    feedback_message,
    inbox_max_size,
    sketch_max_size,
    is_inbox_enabled,
    username,
    avatar
  } = user

  const responseObj = {
    _id,
    name,
    email,
    auth_provider,
    message_max_length,
    feedback_message,
    inbox_max_size,
    sketch_max_size,
    is_inbox_enabled,
    username,
    avatar,
    token: ''
  }

  const token = generateToken({
    obj: { _id, email },
    expiresIn: DEFAULT_CONFIG.signin_token_expiry
  })

  responseObj.token = token

  return responseObj
}

export const isValidUsername = (username: string) => {
  /* 
    Usernames can only have: 
    - Lowercase Letters (a-z) 
    - Uppercase Letters (A-Z) 
    - Numbers (0-9)
    - Dots (.)
    - Underscores (_)
    - Length: Minimum 5, Maximum 20 characters
  */
  const regex = /^[a-zA-Z0-9_.]+$/

  const isValidPattern = regex.test(username)

  return !isInvalidLength(username, CHAR_SIZE_LIMIT.username) && isValidPattern
}

export const isValidAvatar = (avatar: string) => {
  const emojiRegex =
    /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]$/u

  return avatar.length > 0 && avatar.length <= 2 && emojiRegex.test(avatar)
}

export const isInvalidLength = (
  text: string,
  limit: { min: number; max: number }
) => {
  const trimmedText = text.trim()
  return trimmedText.length < limit.min || trimmedText.length > limit.max
}
