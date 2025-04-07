import { Schema, model } from 'mongoose'

const schema = new Schema(
  {
    user_id: {
      type: String,
      required: true
    },
    friend_id: {
      type: String,
      required: true
    },
    since: {
      type: String,
      required: false
    },
    is_accepted: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      required: true
    },
    friend_name: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)
export const Friend = model('Friend', schema)
