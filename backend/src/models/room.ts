import { Schema, model } from 'mongoose'

const schema = new Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: false
    },
    isGroup: {
      type: Boolean,
      default: false
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
)

export const Room = model('Room', schema)
