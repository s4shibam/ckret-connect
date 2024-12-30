import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { mg } from '../../models'
import { withCache } from '../../services/redis'
import { TMessage, TSketch, TUser } from '../../types/models'
import { throwError } from '../../utils/throw-error'

type TGetUserProfileByUsernameReqParams = {
  username: string
}

type TUserProfileResponse = Pick<
  TUser,
  '_id' | 'name' | 'username' | 'avatar' | 'is_inbox_enabled'
> & {
  messages: TMessage[]
  sketches: TSketch[]
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

  const getUserProfile = async (): Promise<TUserProfileResponse> => {
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

    const [publicMessages, publicSketches] = await Promise.all([
      mg.message
        .find({
          recipient: user._id,
          show_in_profile: true
        })
        .sort({ updatedAt: -1 }),
      mg.sketch
        .find({
          recipient: user._id,
          show_in_profile: true
        })
        .sort({ updatedAt: -1 })
    ])

    return {
      ...user.toJSON(),
      messages: publicMessages,
      sketches: publicSketches
    }
  }

  const profile = await withCache({
    key: `profile:${username}`,
    fn: getUserProfile,
    options: { ttl: 60 * 5 }
  })

  res.status(200).json({
    message: 'Successfully fetched user profile',
    data: profile
  })
}
