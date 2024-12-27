import { Request, Response } from 'express'
import { mg } from '../../models'
import { throwError } from '../../utils/throw-error'

/*
USE: Delete all sketches
ROUTE: sketch/all
METHOD: DELETE
*/
export const deleteAllSketches = async (req: Request, res: Response) => {
  const { _id, name } = req?.user

  const result = await mg.sketch.deleteMany({ recipient: _id })

  if (result.deletedCount === 0) {
    throwError(`No sketches found for ${name}`, 404)
  }

  res.status(200).json({
    message: 'Successfully deleted all sketches'
  })
}
