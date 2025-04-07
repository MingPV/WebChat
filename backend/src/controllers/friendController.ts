import { Request, Response } from 'express'
import { friendService } from '@/services/friendService'
import { StatusCodes, ReasonPhrases } from 'http-status-codes'
import { roomService } from '@/services'

export const friendController = {
  createFriend: async (req: Request, res: Response) => {
    const { user_id, friend_id, user_name, friend_name } = req.body

    // Validate required fields
    if (!user_id || !friend_id || !friend_name) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Missing required fields',
        status: StatusCodes.BAD_REQUEST
      })
    }

    try {
      // Check if this user_id already has this friend_id in the database
      const existingFriend = await friendService.getByUserIdAndFriendId(
        user_id,
        friend_id
      )
      if (existingFriend) {
        console.log('existingFriend')
        console.log(existingFriend)
        return res.status(StatusCodes.CONFLICT).json({
          message: 'Friend relationship already exists',
          status: StatusCodes.CONFLICT
        })
      }

      // Create the friend
      const friend = await friendService.create(
        {
          user_id,
          friend_id,
          since: '',
          is_accepted: false,
          status: 'pending',
          friend_name: friend_name
        },
        undefined // No session in this case
      )
      const friend2 = await friendService.create(
        {
          user_id: friend_id,
          friend_id: user_id,
          since: '',
          is_accepted: false,
          status: 'waiting for accept',
          friend_name: user_name
        },
        undefined // No session in this case
      )

      return res.status(StatusCodes.CREATED).json({
        data: friend,
        message: ReasonPhrases.CREATED,
        status: StatusCodes.CREATED
      })
    } catch (error) {
      console.error('Error creating friend:', error)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        status: StatusCodes.INTERNAL_SERVER_ERROR
      })
    }
  },
  getFriendsByUserId: async (req: Request, res: Response) => {
    const { user_id } = req.params
    if (!user_id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Missing required fields',
        status: StatusCodes.BAD_REQUEST
      })
    }

    try {
      // Get friends by user ID
      const friends = await friendService.getAllFriendsByUserId(user_id)

      return res.status(StatusCodes.OK).json({
        data: friends,
        message: ReasonPhrases.OK,
        status: StatusCodes.OK
      })
    } catch (error) {
      console.error('Error getting friends:', error)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        status: StatusCodes.INTERNAL_SERVER_ERROR
      })
    }
  },
  getFriendById: async (req: Request, res: Response) => {
    const { friend_id } = req.params
    if (!friend_id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Missing required fields',
        status: StatusCodes.BAD_REQUEST
      })
    }

    try {
      // Get friend by ID
      const friend = await friendService.getByFriendId(friend_id)

      return res.status(StatusCodes.OK).json({
        data: friend,
        message: ReasonPhrases.OK,
        status: StatusCodes.OK
      })
    } catch (error) {
      console.error('Error getting friend:', error)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        status: StatusCodes.INTERNAL_SERVER_ERROR
      })
    }
  },
  updateFriendById: async (req: Request, res: Response) => {
    console.log('mingza')
    console.log(req.body)

    const { id } = req.params
    const { user_id, friend_id, since, is_accepted, status } = req.body
    if (!user_id || !friend_id || !since || !is_accepted || !status) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Missing required fields',
        status: StatusCodes.BAD_REQUEST
      })
    }

    console.log('mingId', id)

    const anotherRequest = await friendService.getByUserIdAndFriendId(
      friend_id,
      user_id
    )

    if (!anotherRequest) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Frind relationship not found',
        status: StatusCodes.BAD_REQUEST
      })
    }

    try {
      // Update friend by ID
      const updatedFriend = await friendService.updateById(
        id,
        { since, is_accepted, status },
        undefined // No session in this case
      )
      const updatedFriend2 = await friendService.updateById(
        anotherRequest._id.toString(),
        { since, is_accepted, status },
        undefined // No session in this case
      )

      const roomId = [user_id, friend_id].sort().join('-')

      // Create the room
      const room = await roomService.create(
        {
          roomId,
          name: `Chat room between ${user_id} and ${friend_id}`,
          isGroup: false,
          participants: [user_id, friend_id],
          createdBy: user_id,
          lastMessageDate: new Date()
        },
        undefined // No session in this case
      )

      console.log(room)

      return res.status(StatusCodes.OK).json({
        data: { updatedFriend, room },
        message: ReasonPhrases.OK,
        status: StatusCodes.OK
      })
    } catch (error) {
      console.error('Error updating friend:', error)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        status: StatusCodes.INTERNAL_SERVER_ERROR
      })
    }
  },
  deleteFriendById: async (req: Request, res: Response) => {
    console.log('mingza')
    console.log(req.body)

    const { id } = req.params
    const { user_id, friend_id } = req.body

    if (!id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Missing required fields',
        status: StatusCodes.BAD_REQUEST
      })
    }

    if (!user_id || !friend_id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Missing required fields',
        status: StatusCodes.BAD_REQUEST
      })
    }

    console.log('mingId', id)

    const anotherRequest = await friendService.getByUserIdAndFriendId(
      friend_id,
      user_id
    )

    if (!anotherRequest) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Frind relationship not found',
        status: StatusCodes.BAD_REQUEST
      })
    }

    try {
      // Delete friend by ID
      await friendService.deleteById(id)
      await friendService.deleteById(anotherRequest._id.toString())

      return res.status(StatusCodes.OK).json({
        message: ReasonPhrases.OK,
        status: StatusCodes.OK
      })
    } catch (error) {
      console.error('Error deleting friend:', error)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        status: StatusCodes.INTERNAL_SERVER_ERROR
      })
    }
  }

  // Update friend by ID
}
