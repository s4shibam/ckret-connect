import { Request, Response } from 'express'
import { AUTH_PROVIDER, CHAR_SIZE_LIMIT } from '../../constants/index'
import { mg } from '../../models'
import {
  createSigninResponseObj,
  hashPassword,
  isInvalidLength,
  isValidUsername
} from '../../utils/index'
import { throwError } from '../../utils/throw-error'

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

  const hashedPassword = await hashPassword(password)

  const newUser = await mg.user.create({
    name: username,
    username,
    password: hashedPassword,
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
