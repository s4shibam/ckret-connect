import { Request, Response } from 'express'
import { mg } from '../../models'
import { deleteFromCloudinary } from '../../services/cloudinary'
import { throwError } from '../../utils/throw-error'

type TDeleteSingleSketchReqParams = {
  sid: string
}
/*
USE: Delete sketch by id
ROUTE: sketch/single-sketch/:sid
METHOD: DELETE
*/
export const deleteSingleSketch = async (req: Request, res: Response) => {
  const { sid } = req?.params as TDeleteSingleSketchReqParams

  const sketch = await mg.sketch.findOne({
    _id: sid,
    recipient: req.user._id
  })

  if (!sketch) {
    throwError('Sketch not found', 404)
  }

  await sketch.deleteOne()
  await deleteFromCloudinary(sketch.sketch_url)

  res.status(200).json({
    message: 'Successfully deleted the sketch'
  })
}
