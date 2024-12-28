import { Request, Response } from 'express'
import { AUTH_PROVIDER } from '../../constants/index'
import { mg } from '../../models'
import { comparePassword, createSigninResponseObj } from '../../utils/index'
import { throwError } from '../../utils/throw-error'

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

  const isPasswordValid = await comparePassword(password, user.password)
  if (!isPasswordValid) {
    throwError('Invalid credentials', 401)
  }

  res.status(200).json({
    message: 'Signed in successfully',
    data: createSigninResponseObj(user)
  })
}
