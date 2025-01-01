import { NextFunction, Request, Response } from 'express'
import User from '../models/user'
import { verifyToken } from '../utils/index'
import { throwError } from '../utils/throw-error'

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorizationHeader = req?.headers?.authorization
  const token = authorizationHeader?.split('Bearer ')[1]

  if (!token) {
    throwError('Unauthorized request', 401)
  }

  const verifiedUser = verifyToken({ token }) as { _id: string }

  const user = await User.findById(verifiedUser?._id)

  if (!user) {
    throwError('User not found', 404)
  }

  req.user = user

  next()
}
