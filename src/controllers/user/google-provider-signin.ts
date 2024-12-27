import { Request, Response } from 'express'
import { AUTH_PROVIDER } from '../../constants/index'
import { mg } from '../../models'
import { decodeGoogleToken } from '../../services/google-client'
import { createSigninResponseObj } from '../../utils/index'

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
