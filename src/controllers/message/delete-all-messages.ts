import { Request, Response } from 'express'
import { mg } from '../../models'
import { throwError } from '../../utils/throw-error'

/*
USE: Delete all the messages
ROUTE: message/all
METHOD: DELETE
*/
export const deleteAllMessages = async (req: Request, res: Response) => {
  const user = req.user

  const result = await mg.message.deleteMany({ recipient: user._id })

  if (result.deletedCount === 0) {
    throwError(`No messages found for ${user.name}`, 404)
  }

  res.status(200).json({
    message: 'Successfully deleted all the messages'
  })
}
