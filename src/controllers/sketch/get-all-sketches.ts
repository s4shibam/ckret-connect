import { Request, Response } from 'express'
import { mg } from '../../models'

/*
USE: Get all sketches
ROUTE: sketch/all
METHOD: GET
*/
export const getAllSketches = async (req: Request, res: Response) => {
  const sketches = await mg.sketch.find({ recipient: req.user._id }).sort({
    createdAt: -1
  })

  res.status(200).json({
    message: 'Successfully fetched your sketches',
    data: sketches
  })
}
