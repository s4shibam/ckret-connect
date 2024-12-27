import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { mg } from '../../models'
import { throwError } from '../../utils/throw-error'

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
