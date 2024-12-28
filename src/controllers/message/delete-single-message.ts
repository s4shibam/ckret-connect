import { Request, Response } from 'express'
import { mg } from '../../models'
import { throwError } from '../../utils/throw-error'

type TDeleteSingleMessageReqParams = {
  mid: string
}

/*
USE: Delete message by id
ROUTE: message/single-message/:mid
METHOD: DELETE
*/
export const deleteSingleMessage = async (req: Request, res: Response) => {
  const user = req.user
  const { mid } = req?.params as TDeleteSingleMessageReqParams

  const message = await mg.message.findOne({
    _id: mid,
    recipient: user._id
  })

  if (!message) {
    throwError('Message not found', 404)
  }

  await message.deleteOne()

  res.status(200).json({
    message: 'Successfully deleted the message'
  })
}
