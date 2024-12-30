import { Request, Response } from 'express'
import { mg } from '../../models'
import { withCache } from '../../services/redis'

/*
USE: Get all sketches
ROUTE: sketch/all
METHOD: GET
*/
export const getAllSketches = async (req: Request, res: Response) => {
  const userId = req.user._id.toString()

  const _getSketches = async () => {
    return mg.sketch
      .find({ recipient: req.user._id })
      .sort({
        createdAt: -1
      })
      .lean()
  }

  const sketches = await withCache({
    key: `sketches:${userId}`,
    fn: _getSketches,
    options: { ttl: 60 * 10 }
  })

  res.status(200).json({
    message: 'Successfully fetched your sketches',
    data: sketches
  })
}
