import { Schema, model } from 'mongoose';
import validator from 'validator';

const schema = new Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: false
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
  }
});

export default model('user', schema);
