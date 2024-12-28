import { Request, Response } from 'express'
import { mg } from '../../models'

/*
USE: Get all messages
ROUTE: message/all
METHOD: GET
*/
export const getAllMessages = async (req: Request, res: Response) => {
  const messages = await mg.message.find({ recipient: req.user._id }).sort({
    createdAt: -1
  })

  res.status(200).json({
    message: 'Successfully fetched your messages',
    data: messages
  })
}
