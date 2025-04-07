import { ClientSession, ObjectId } from 'mongoose'
import { Friend } from '@/models/friend'

export const friendService = {
  create: (
    {
      user_id,
      friend_id,
      since,
      is_accepted,
      status,
      friend_name
    }: {
      user_id: string
      friend_id: string
      since: string
      is_accepted: boolean
      status: string
      friend_name: string
    },
    session?: ClientSession
  ) =>
    new Friend({
      user_id,
      friend_id,
      since,
      is_accepted,
      status,
      friend_name
    }).save({ session }),
  getById: (user_id: ObjectId) => Friend.findById(user_id),
  getByFriendId: (friend_id: string) => Friend.findOne({ friend_id }),
  getByUserIdAndFriendId: (user_id: string, friend_id: string) =>
    Friend.findOne({ user_id, friend_id }),
  getAllFriendsByUserId: (user_id: string) =>
    Friend.find({ user_id }).populate('friend_id'),
  updateById: (
    id: string,
    {
      since,
      is_accepted,
      status
    }: {
      since: string
      is_accepted: boolean
      status: string
    },
    session?: ClientSession
  ) => {
    const data = [{ _id: id }, { since, is_accepted, status }]
    let params = null
    if (session) {
      params = [...data, { session }]
    } else {
      params = data
    }
    return Friend.updateOne(...params)
  },
  deleteById: (id: string, session?: ClientSession) => {
    const data = [{ _id: id }]
    let params = null
    if (session) {
      params = [...data, { session }]
    } else {
      params = data
    }
    return Friend.deleteOne(...params)
  }
}
