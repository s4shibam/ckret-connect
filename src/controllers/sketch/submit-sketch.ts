import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { mg } from '../../models'
import { uploadToCloudinary } from '../../services/cloudinary'
import { throwError } from '../../utils/throw-error'

type TSubmitSketchReqBody = {
  recipientUsername: string
}

/*
USE: Submit anonymous sketch
ROUTE: sketch/submit
METHOD: POST
*/
export const submitSketch = async (req: Request, res: Response) => {
  const { recipientUsername } = req.body as TSubmitSketchReqBody
  const sketchFile = req.file as Express.Multer.File

  if (!recipientUsername || !sketchFile) {
    throwError('Insufficient details', 400)
  }

  const sketchData = `data:${sketchFile.mimetype};base64,${sketchFile.buffer.toString('base64')}`

  const isMongoId = mongoose.Types.ObjectId.isValid(recipientUsername)
  const query = isMongoId
    ? { _id: recipientUsername }
    : { username: recipientUsername }

  const user = await mg.user.findOne(query)

  if (!user) {
    throwError('User not found', 404)
  }

  if (!user.is_inbox_enabled) {
    throwError(`${user.name}'s inbox is disabled`, 400)
  }

  const sketchCount = await mg.sketch.countDocuments({ recipient: user._id })

  if (sketchCount >= user.sketch_max_size) {
    throwError(
      `${user.name}'s sketch inbox is full. To allow new sketches, request that some old ones be deleted.`,
      400
    )
  }

  let sketchUrl
  try {
    sketchUrl = await uploadToCloudinary(sketchData)
  } catch {
    throwError('Failed to upload sketch', 500)
  }

  await mg.sketch.create({
    recipient: user._id,
    sketch_url: sketchUrl
  })

  await mg.stat.findOneAndUpdate(
    {},
    { $inc: { total_sketches_count: 1 } },
    { upsert: true }
  )

  res.status(200).json({
    message: 'Sketch sent successfully'
  })
}
