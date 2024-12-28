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

  const user = await mg.user
    .findOne(query)
    .select({
      _id: 1,
      name: 1,
      username: 1,
      feedback_message: 1,
      inbox_max_size: 1,
      sketch_max_size: 1,
      message_max_length: 1
    })
    .lean()

  if (!user) {
    throwError('User not found', 404)
  }

  const currentMessageCount = await mg.message.countDocuments({
    recipient: user._id
  })

  const currentSketchCount = await mg.sketch.countDocuments({
    recipient: user._id
  })

  const isMessageInboxFull = currentMessageCount >= user.inbox_max_size
  const isSketchInboxFull = currentSketchCount >= user.sketch_max_size

  const userResponse = {
    ...user,
    inbox_max_size: undefined,
    sketch_max_size: undefined,
    is_message_inbox_full: isMessageInboxFull || undefined,
    is_sketch_inbox_full: isSketchInboxFull || undefined
  }

  if (isMessageInboxFull || isSketchInboxFull) {
    res.status(200).json({
      message: `Oops! ${user.name}'s inbox is packed right now. Ask to delete some old messages so you can send new ones!`,
      data: userResponse
    })
    return
  }

  res.status(200).json({
    message: 'Successfully fetched user details',
    data: userResponse
  })
}
