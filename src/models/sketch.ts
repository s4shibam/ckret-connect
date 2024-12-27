import mongoose, { model, Schema } from 'mongoose'
import { MESSAGE_TYPE } from '../constants/index.js'
import { TSketch } from '../types/models'
import { decryptMessage } from '../utils/crypto.js'

const sketchSchema = new Schema<TSketch>(
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
      default: MESSAGE_TYPE.anonymous_sketch
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

const sketchModel = model<TSketch>('sketch', sketchSchema)

export default sketchModel
