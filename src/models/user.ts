import { Schema, model } from 'mongoose'
import validator from 'validator'
import { AUTH_PROVIDER, DEFAULT_CONFIG } from '../constants/index'
import { TUser } from '../types/models'

const schema = new Schema<TUser>(
  {
    name: {
      type: String,
      required: true
    },
    username: {
      type: String,
      unique: true
    },
    avatar: {
      type: String
    },
    email: {
      type: String,
      required: function () {
        return this.auth_provider === AUTH_PROVIDER.google
      },
      unique: true,
      validate: {
        validator: function (value: string) {
          if (
            this.auth_provider === AUTH_PROVIDER.anonymous &&
            value.endsWith('@anonymous.user')
          ) {
            return true
          }
          return validator.isEmail(value)
        }
      }
    },
    auth_provider: {
      type: String,
      enum: Object.values(AUTH_PROVIDER),
      required: true
    },
    message_max_length: {
      type: Number,
      default: DEFAULT_CONFIG.message_max_length
    },
    feedback_message: {
      type: String,
      default: DEFAULT_CONFIG.feedback_message
    },
    inbox_max_size: {
      type: Number,
      default: DEFAULT_CONFIG.inbox_max_size
    },
    sketch_max_size: {
      type: Number,
      default: DEFAULT_CONFIG.sketch_max_size
    },
    is_inbox_enabled: {
      type: Boolean,
      default: DEFAULT_CONFIG.is_inbox_enabled
    },
    password: {
      type: String,
      select: false
    }
  },
  { timestamps: true }
)

const userModel = model<TUser>('user', schema)

export default userModel
