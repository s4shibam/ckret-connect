import { Schema, model } from 'mongoose'
import { TStat } from '../types/models'

const schema = new Schema<TStat>(
  {
    registered_users: {
      type: [String]
    },
    anonymous_users_count: {
      type: Number,
      default: 0
    },
    total_messages_count: {
      type: Number,
      default: 0
    },
    total_sketches_count: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
)

const statModel = model<TStat>('stat', schema)

export default statModel
