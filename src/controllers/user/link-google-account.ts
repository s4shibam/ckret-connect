import { Request, Response } from 'express'
import { AUTH_PROVIDER } from '../../constants/index'
import { mg } from '../../models'
import { decodeGoogleToken } from '../../services/google-client'
import { createSigninResponseObj } from '../../utils/index'
import { throwError } from '../../utils/throw-error'

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
