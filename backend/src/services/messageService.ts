import { ClientSession, ObjectId } from 'mongoose'
import { Message } from '@/models'

// export const roomService = {
//   create: (
//     {
//       roomId,
//       name,
//       groupId,
//       isGroup,
//       participants,
//       createdBy
//     }: {
//       roomId: string
//       name: string
//       groupId?: ObjectId
//       isGroup: boolean
//       participants: ObjectId[]
//       createdBy: ObjectId
//     },
//     session?: ClientSession
//   ) =>
//     new Room({
//       roomId,
//       name,
//       groupId,
//       isGroup,
//       participants,
//       createdBy
//     }).save({ session }),
//   getById: (roomId: ObjectId) => Room.findById(roomId),
//   getByRoomId: (roomId: string) => Room.findOne({ roomId }),
//   getAllRoomsByUserId: (userId: ObjectId) =>
//     Room.find({ participants: userId }).populate('participants'),
//   updateByRoomId: (
//     roomId: string,
//     {
//       name,
//       groupId,
//       isGroup,
//       participants
//     }: {
//       name: string
//       groupId: ObjectId
//       isGroup: boolean
//       participants: ObjectId[]
//     },
//     session?: ClientSession
//   ) => {
//     const data = [{ roomId }, { name, groupId, isGroup, participants }]
//     let params = null
//     if (session) {
//       params = [...data, { session }]
//     } else {
//       params = data
//     }
//     return Room.updateOne(...params)
//   },
//   deleteByRoomId: (roomId: string, session?: ClientSession) =>
//     Room.deleteOne({ roomId }, { session })
// }

// create message service with the same format

// {
//     _id: ObjectId('...'),
//     roomId: 'กลุ่มเพื่อนปี 3-uniqueGroupId123',
//     sender: ObjectId('user1'),
//     message: 'สวัสดีครับ',
//     sentAt: ISODate('2025-04-06T00:05:00Z')
//   }

export const messageService = {
  create: (
    {
      roomId,
      sender,
      senderName,
      message,
      sentAt
    }: {
      roomId: string
      sender: ObjectId
      senderName: string
      message: string
      sentAt: Date
    },
    session?: ClientSession
  ) =>
    new Message({
      roomId,
      sender,
      senderName,
      message,
      sentAt
    }).save({ session }),
  getById: (messageId: ObjectId) => Message.findById(messageId),
  getByRoomId: (roomId: string) => Message.findOne({ roomId }),
  getAllMessagesByUserId: (userId: ObjectId) =>
    Message.find({ participants: userId }).populate('participants'),
  getAllMessagesByRoomId: (roomId: string) =>
    Message.find({ roomId }).populate('sender'),
  updateByRoomId: (
    roomId: string,
    {
      name,
      groupId,
      isGroup,
      participants
    }: {
      name: string
      groupId: ObjectId
      isGroup: boolean
      participants: ObjectId[]
    },
    session?: ClientSession
  ) => {
    const data = [{ roomId }, { name, groupId, isGroup, participants }]
    let params = null
    if (session) {
      params = [...data, { session }]
    } else {
      params = data
    }
    return Message.updateOne(...params)
  },
  deleteByRoomId: (roomId: string, session?: ClientSession) =>
    Message.deleteOne({ roomId }, { session })
}
