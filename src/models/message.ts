import { Schema, model } from 'mongoose'
import { MESSAGE_TYPE } from '../constants/index'
import { TMessage } from '../types/models'

const schema = new Schema<TMessage>(
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
      default: MESSAGE_TYPE.anonymous_message
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
    timestamps: true
  }
)

const messageModel = model<TMessage>('message', schema)

export default messageModel
