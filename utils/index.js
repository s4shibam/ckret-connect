import jwt from 'jsonwebtoken'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { CHAR_SIZE_LIMIT, DEFAULT_CONFIG, ENV } from '../constants/index.js'

export const __dirname = dirname(fileURLToPath(import.meta.url))

export const getDatabaseUrl = () => {
  const queries = 'retryWrites=true&w=majority'
  return `${ENV.db_connection_string}/${ENV.db_name}?${queries}`
}

export const generateToken = ({ obj, expiresIn = '1d' }) => {
  return jwt.sign(obj, process.env.JWT_SECRET, {
    expiresIn
  })
}

export const verifyToken = ({ token }) => {
  return jwt.verify(token, process.env.JWT_SECRET)
}

export const createSigninResponseObj = (user) => {
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
    avatar
  }

  const token = generateToken({
    obj: { _id, email },
    expiresIn: DEFAULT_CONFIG.signin_token_expiry
  })

  responseObj.token = token

  return responseObj
}

export const isValidUsername = (username) => {
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

  return !isInvalidLength(username, CHAR_SIZE_LIMIT.USERNAME) && isValidPattern
}

export const isValidAvatar = (avatar) => {
  const emojiRegex =
    /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]$/u
  return avatar.length === 1 && emojiRegex.test(avatar)
}

export const isInvalidLength = (text, LIMIT) => {
  const trimmedText = text.trim()
  return trimmedText.length < LIMIT.MIN || trimmedText.length > LIMIT.MAX
}
