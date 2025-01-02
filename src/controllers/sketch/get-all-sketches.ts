import { Request, Response } from 'express'
import { mg } from '../../models'
import { withCache } from '../../services/redis'
import { decryptMessage } from '../../utils/crypto'

/*
USE: Get all sketches
ROUTE: sketch/all
METHOD: GET
*/
export const getAllSketches = async (req: Request, res: Response) => {
  const userId = req.user._id.toString()

  const _getSketches = async () => {
    const encryptedSketches = await mg.sketch
      .find({ recipient: req.user._id })
      .sort({
        createdAt: -1
      })
      .lean()

    const decryptedSketches = encryptedSketches.map((sketch) => {
      if (sketch.encrypted_reply) {
        sketch.reply = decryptMessage(sketch.encrypted_reply)
        sketch.encrypted_reply = ''
      }

      return sketch
    })

    return decryptedSketches
  }

  const sketches = await withCache({
    key: `sketches:${userId}`,
    fn: _getSketches,
    options: { ttl: 60 }
  })

  res.status(200).json({
    message: 'Successfully fetched your sketches',
    data: sketches
  })
}
