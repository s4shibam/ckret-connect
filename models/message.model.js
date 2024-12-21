import { Schema, model } from 'mongoose'
import { MESSAGE_TYPE } from '../constants/index.js'
import { decryptMessage } from '../utils/encryption.js'

const schema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    encrypted_content: {
      type: String,
      required: true
    },
    message_type: {
      type: String,
      default: MESSAGE_TYPE.ANONYMOUS_MESSAGE
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
      transform: function(_, ret) {
        try {
          ret.content = decryptMessage(ret.encrypted_content)
          delete ret.encrypted_content

          if (ret.encrypted_reply) {
            ret.reply = decryptMessage(ret.encrypted_reply)
            delete ret.encrypted_reply
          }
        } catch (error) {
          console.error('Error decrypting message:', error)
          ret.content = 'Error: Could not decrypt message'
          if (ret.encrypted_reply) {
            ret.reply = 'Error: Could not decrypt reply'
          }
        }
        return ret
      }
    }
  }
)

export default model('message', schema)
