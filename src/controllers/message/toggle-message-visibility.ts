import { Request, Response } from 'express'
import { mg } from '../../models'
import { throwError } from '../../utils/throw-error'

type TToggleMessageVisibilityReqParams = {
  mid: string
}

/*
USE: Toggle message visibility in profile
ROUTE: message/visibility/:mid
METHOD: PUT
*/
export const toggleMessageVisibility = async (req: Request, res: Response) => {
  const user = req.user
  const { mid } = req?.params as TToggleMessageVisibilityReqParams

  const message = await mg.message.findOne({ _id: mid, recipient: user._id })

  if (!message) {
    throwError('Message not found', 404)
  }

  if (!message.show_in_profile && !message.encrypted_reply) {
    throwError('Cannot show message in profile without a reply', 400)
  }

  message.show_in_profile = !message.show_in_profile
  await message.save()

  res.status(200).json({
    message: `Message ${message.show_in_profile ? 'will' : 'will not'} be shown in public profile`
  })
}
