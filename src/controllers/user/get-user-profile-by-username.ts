import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { mg } from '../../models'
import { throwError } from '../../utils/throw-error'

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
