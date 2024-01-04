import { Schema, model } from 'mongoose';
import { MESSAGE_TYPE } from '../constants/index.js';

const schema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    message_type: {
      type: String,
      default: MESSAGE_TYPE.ANONYMOUS_MESSAGE
    }
  },
  { timestamps: true }
);

export default model('message', schema);
