import { ClientSession, ObjectId } from 'mongoose'
import { Room } from '@/models'

export const roomService = {
  create: (
    {
      roomId,
      name,
      groupId,
      isGroup,
      participants,
      createdBy,
      lastMessage,
      lastMessageDate
    }: {
      roomId: string
      name?: string
      groupId?: string
      isGroup: boolean
      participants: ObjectId[]
      createdBy: ObjectId
      lastMessage?: string
      lastMessageDate: Date
    },
    session?: ClientSession
  ) =>
    new Room({
      roomId,
      name,
      groupId,
      isGroup,
      participants,
      createdBy,
      lastMessage,
      lastMessageDate
    }).save({ session }),
  getById: (roomId: ObjectId) => Room.findById(roomId),
  getByRoomId: (roomId: string) => Room.findOne({ roomId }),
  getAllRoomsByUserId: (userId: string) =>
    Room.find({ participants: userId }).populate('participants'),
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
    return Room.updateOne(...params)
  },
  deleteByRoomId: (roomId: string, session?: ClientSession) =>
    Room.deleteOne({ roomId }, { session })
}
