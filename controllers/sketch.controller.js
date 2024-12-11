import mongoose from 'mongoose'
import { catchAsyncError as cae } from '../middleware/catch-async-error.js'
import Sketch from '../models/sketch.model.js'
import Stat from '../models/stat.model.js'
import User from '../models/user.model.js'
import { uploadToCloudinary } from '../utils/cloudinary.js'
import CustomError from '../utils/custom-error.js'

/*
USE: Submit anonymous sketch
ROUTE: sketch/submit
METHOD: POST
*/
export const submitSketch = cae(async (req, res, next) => {
  const { recipientUsername } = req.body
  const sketchFile = req.file

  if (!recipientUsername || !sketchFile) {
    return next(new CustomError('Insufficient details', 400))
  }

  // Convert buffer to base64
  const sketchData = `data:${sketchFile.mimetype};base64,${sketchFile.buffer.toString('base64')}`

  const isMongoId = mongoose.Types.ObjectId.isValid(recipientUsername)
  const query = isMongoId
    ? { _id: recipientUsername }
    : { username: recipientUsername }

  const user = await User.findOne(query)

  if (!user) {
    return next(new CustomError('User not found', 404))
  }

  if (!user.is_inbox_enabled) {
    return next(new CustomError(`${user.name}'s inbox is disabled`, 400))
  }

  const sketchCount = await Sketch.countDocuments({ recipient: user._id })
  if (sketchCount >= user.sketch_max_size) {
    return next(
      new CustomError(
        `${user.name}'s sketch inbox is full. To allow new sketches, request that some old ones be deleted.`,
        400
      )
    )
  }

  // Upload sketch to cloudinary
  let sketchUrl
  try {
    sketchUrl = await uploadToCloudinary(sketchData)
  } catch (error) {
    return next(new CustomError('Failed to upload sketch', 500))
  }

  // Create sketch record
  await Sketch.create({
    recipient: user._id,
    sketch_url: sketchUrl
  })

  // Store sketch count stats
  await Stat.findOneAndUpdate(
    {},
    { $inc: { total_sketches_count: 1 } },
    { upsert: true }
  )

  res.status(200).json({
    success: true,
    message: 'Sketch sent successfully'
  })
})

/*
USE: Get all sketches
ROUTE: sketch/all
METHOD: GET
*/
export const getAllSketches = cae(async (req, res) => {
  const sketches = await Sketch.find({ recipient: req?.user?._id }).sort({
    createdAt: -1
  })

  res.status(200).json({
    success: true,
    message: 'Successfully fetched your sketches',
    data: sketches
  })
})

/*
USE: Delete sketch by id
ROUTE: sketch/single-sketch/:sid
METHOD: DELETE
*/
export const deleteSingleSketch = cae(async (req, res, next) => {
  const { sid } = req?.params || {}

  const sketch = await Sketch.findByIdAndDelete(sid)

  if (!sketch) {
    return next(new CustomError('Sketch not found', 404))
  }

  res.status(200).json({
    success: true,
    message: 'Successfully deleted the sketch'
  })
})

/*
USE: Delete all sketches
ROUTE: sketch/all
METHOD: DELETE
*/
export const deleteAllSketches = cae(async (req, res, next) => {
  const { _id, name } = req?.user || {}

  const result = await Sketch.deleteMany({ recipient: _id })

  if (result.deletedCount === 0) {
    return next(new CustomError(`No sketches found for ${name}`, 404))
  }

  res.status(200).json({
    success: true,
    message: 'Successfully deleted all sketches'
  })
})
