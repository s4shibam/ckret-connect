import bcryptjs from 'bcryptjs'
import { Schema, model } from 'mongoose'
import validator from 'validator'
import { AUTH_PROVIDER, DEFAULT_CONFIG } from '../constants/index.js'

const schema = new Schema(
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
        validator: function (v) {
          if (
            this.auth_provider === AUTH_PROVIDER.anonymous &&
            v.endsWith('@anonymous.user')
          ) {
            return true
          }
          return validator.isEmail(v)
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

// Hash password before saving
schema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()

  try {
    this.password = await bcryptjs.hash(this.password, 10)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare password
schema.methods.comparePassword = async function (inputPassword) {
  return await bcryptjs.compare(inputPassword, this.password)
}

export default model('user', schema)
