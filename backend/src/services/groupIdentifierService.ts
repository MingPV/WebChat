// {
//     _id: ObjectId('group_id_123'),
//     name: 'กลุ่มเพื่อนปี 3',
//     groupNumber: 1,
//     createdAt: ISODate('2025-04-06T00:00:00Z')
//   }

// export const messageService = {
//   create: (
//     {
//       roomId,
//       sender,
//       message,
//       sentAt
//     }: {
//       roomId: string
//       sender: ObjectId
//       message: string
//       sentAt: Date
//     },
//     session?: ClientSession
//   ) =>
//     new Room({
//       roomId,
//       sender,
//       message,
//       sentAt
//     }).save({ session }),
//   getById: (messageId: ObjectId) => Room.findById(messageId),
//   getByRoomId: (roomId: string) => Room.findOne({ roomId }),
//   getAllMessagesByUserId: (userId: ObjectId) =>
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

import { ClientSession, ObjectId } from 'mongoose'
import { GroupIdentifier } from '@/models'

// create service with the same format

export const groupIdentifierService = {
  create: (
    {
      name,
      groupNumber,
      createdAt
    }: {
      name: string
      groupNumber: number
      createdAt: Date
    },
    session?: ClientSession
  ) =>
    new GroupIdentifier({
      name,
      groupNumber,
      createdAt
    }).save({ session }),
  getById: (groupId: ObjectId) => GroupIdentifier.findById(groupId),
  getByGroupId: (groupId: string) => GroupIdentifier.findOne({ groupId }),
  getAllGroupsByGroupName: (groupName: string) =>
    GroupIdentifier.find({ name: groupName }),
  getAllGroupsByUserId: (userId: ObjectId) =>
    GroupIdentifier.find({ participants: userId }).populate('participants'),
  updateByGroupId: (
    groupId: string,
    {
      name,
      groupNumber,
      createdAt
    }: {
      name: string
      groupNumber: number
      createdAt: Date
    },
    session?: ClientSession
  ) => {
    const data = [{ groupId }, { name, groupNumber, createdAt }]
    let params = null
    if (session) {
      params = [...data, { session }]
    } else {
      params = data
    }
    return GroupIdentifier.updateOne(...params)
  },
  deleteByGroupId: (groupId: string, session?: ClientSession) =>
    GroupIdentifier.deleteOne({ groupId }, { session })
}
