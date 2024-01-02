import { Schema, model } from 'mongoose';
import validator from 'validator';
import { DEFAULT_CONFIG } from '../constants/index.js';

const schema = new Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: validator.isEmail
  },
  auth_provider: {
    type: String,
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
  inbox_current_size: {
    type: Number,
    default: 0
  },
  inbox_max_size: {
    type: Number,
    default: DEFAULT_CONFIG.inbox_max_size
  },
  is_inbox_enabled: {
    type: Boolean,
    default: DEFAULT_CONFIG.is_inbox_enabled
  }
});

export default model('user', schema);
