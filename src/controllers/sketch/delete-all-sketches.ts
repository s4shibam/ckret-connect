import { Request, Response } from 'express'
import { mg } from '../../models'
import { deleteFromCloudinary } from '../../services/cloudinary'
import { invalidateUserCaches } from '../../utils/cache'
import { throwError } from '../../utils/throw-error'

/*
USE: Delete all sketches
ROUTE: sketch/all
METHOD: DELETE
*/
export const deleteAllSketches = async (req: Request, res: Response) => {
  const { _id } = req.user

  const sketches = await mg.sketch.find({ recipient: _id })

  if (!sketches.length) {
    throwError('No sketches found', 404)
  }

  const sketchDeletePromises = sketches.map((sketch) =>
    deleteFromCloudinary(sketch.sketch_url)
  )

  await mg.sketch.deleteMany({ recipient: _id })
  await Promise.all(sketchDeletePromises).catch((error) => {
    console.log(`Failed to delete sketches of user ${_id}`, error)
  })

  await invalidateUserCaches(_id.toString())

  res.status(200).json({
    message: 'Successfully deleted all sketches'
  })
}
