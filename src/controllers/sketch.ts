import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { mg } from '../models'
import { uploadToCloudinary } from '../services/cloudinary'
import { encryptMessage } from '../utils/crypto'
import { throwError } from '../utils/throw-error'

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
  } catch (error) {
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

/*
USE: Get all sketches
ROUTE: sketch/all
METHOD: GET
*/
export const getAllSketches = async (req: Request, res: Response) => {
  const sketches = await mg.sketch.find({ recipient: req?.user?._id }).sort({
    createdAt: -1
  })

  res.status(200).json({
    message: 'Successfully fetched your sketches',
    data: sketches
  })
}

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

type TReplyToSketchReqParams = {
  sid: string
}

type TReplyToSketchReqBody = {
  replyContent: string
}

/*
USE: Add or update reply to a sketch
ROUTE: sketch/reply/:sid
METHOD: PUT
*/
export const replyToSketch = async (req: Request, res: Response) => {
  const { sid } = req?.params as TReplyToSketchReqParams
  const { replyContent } = req?.body as TReplyToSketchReqBody

  if (!replyContent) {
    throwError('Reply content is required', 400)
  }

  const sketch = await mg.sketch.findById(sid)

  if (!sketch) {
    throwError('Sketch not found', 404)
  }

  if (sketch.recipient.toString() !== req.user._id.toString()) {
    throwError('Not authorized to reply to this sketch', 403)
  }

  const encryptedReply = encryptMessage(replyContent)
  sketch.encrypted_reply = encryptedReply
  sketch.show_in_profile = true
  await sketch.save()

  res.status(200).json({
    message: 'Reply added successfully'
  })
}

type TToggleSketchVisibilityReqParams = {
  sid: string
}

/*
USE: Toggle sketch visibility in profile
ROUTE: sketch/visibility/:sid
METHOD: PUT
*/
export const toggleSketchVisibility = async (req: Request, res: Response) => {
  const { sid } = req?.params as TToggleSketchVisibilityReqParams

  const sketch = await mg.sketch.findById(sid)

  if (!sketch) {
    throwError('Sketch not found', 404)
  }

  if (sketch.recipient.toString() !== req.user._id.toString()) {
    throwError('Not authorized to modify this sketch', 403)
  }

  if (!sketch.show_in_profile && !sketch.encrypted_reply) {
    throwError('Cannot show sketch in profile without a reply', 400)
  }

  sketch.show_in_profile = !sketch.show_in_profile
  await sketch.save()

  res.status(200).json({
    message: `Sketch ${sketch.show_in_profile ? 'will' : 'will not'} be shown in public profile`
  })
}
