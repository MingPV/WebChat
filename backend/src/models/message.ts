import { Schema, model } from 'mongoose'

const schema = new Schema(
  {
    roomId: {
      type: String,
      required: true
    },
    sender: {
      type: String,
      required: true
    },
    senderName: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
)
export const Message = model('Message', schema)
