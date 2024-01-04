import { Schema, model } from 'mongoose';

const schema = new Schema({
  registered_users: {
    type: [String]
  },
  total_messages_count: {
    type: Number,
    default: 0
  }
});

export default model('stat', schema);
