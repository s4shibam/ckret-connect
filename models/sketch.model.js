import mongoose from 'mongoose'
import { MESSAGE_TYPE } from '../constants/index.js'
import { decryptMessage } from '../utils/encryption.js'

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
    },
    encrypted_reply: {
      type: String,
      default: null
    },
    show_in_profile: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_, ret) {
        try {
          if (ret.encrypted_reply) {
            ret.reply = decryptMessage(ret.encrypted_reply)
            delete ret.encrypted_reply
          }
        } catch (error) {
          console.error('Error decrypting sketch reply:', error)
          if (ret.encrypted_reply) {
            ret.reply = 'Error: Could not decrypt reply'
          }
        }
        return ret
      }
    }
  }
)

const Sketch = mongoose.model('Sketch', sketchSchema)

export default Sketch
