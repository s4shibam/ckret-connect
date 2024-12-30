import { Request, Response } from 'express'
import { mg } from '../../models'
import { withCache } from '../../services/redis'

/*
USE: Get all messages
ROUTE: message/all
METHOD: GET
*/
export const getAllMessages = async (req: Request, res: Response) => {
  const userId = req.user._id.toString()

  const _getMessages = async () => {
    return mg.message
      .find({ recipient: req.user._id })
      .sort({
        createdAt: -1
      })
      .lean()
  }

  const messages = await withCache({
    key: `messages:${userId}`,
    fn: _getMessages,
    options: { ttl: 60 * 10 }
  })

  res.status(200).json({
    message: 'Successfully fetched your messages',
    data: messages
  })
}
