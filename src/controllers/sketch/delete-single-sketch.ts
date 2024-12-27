import { Request, Response } from 'express'
import { mg } from '../../models'
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

  const sketch = await mg.sketch.findById(sid)

  if (!sketch) {
    throwError('Sketch not found', 404)
  }

  if (sketch.recipient.toString() !== req?.user?._id.toString()) {
    throwError('Not authorized to delete this sketch', 403)
  }

  await sketch.deleteOne()

  res.status(200).json({
    message: 'Successfully deleted the sketch'
  })
}
