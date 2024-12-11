import mongoose from 'mongoose'
import { MESSAGE_TYPE } from '../constants/index.js'

const sketchSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sketch_url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: MESSAGE_TYPE.ANONYMOUS_SKETCH
    }
  },
  { timestamps: true }
)

const Sketch = mongoose.model('Sketch', sketchSchema)

export default Sketch
