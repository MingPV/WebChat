import { Request, Response } from 'express'
import { roomService } from '@/services/roomService'
import { StatusCodes, ReasonPhrases } from 'http-status-codes'
import { groupIdentifierService } from '@/services/groupIdentifierService'
import { groupIdentifierController } from './groupIdentifierController'

export const roomController = {
  createRoom: async (req: Request, res: Response) => {
    const { name, isGroup, participants, createdBy } = req.body

    // Validate required fields
    if (!name || !participants || !createdBy) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Missing required fields',
        status: StatusCodes.BAD_REQUEST
      })
    }

    console.log('req.body')
    console.log(req.body)

    try {
      if (isGroup) {
        const existingGroupIdentifier =
          await groupIdentifierService.getAllGroupsByGroupName(name)
        const countGroup = existingGroupIdentifier.length
        const groupNumber = countGroup + 1

        // Create the group identifier
        const groupIdentifier = await groupIdentifierService.create(
          { name, groupNumber, createdAt: new Date() },
          undefined // No session in this case
        )
        const groupId = groupIdentifier._id.toString()
        const roomId = `${name}-${groupId}`
        // Create the room
        const room = await roomService.create(
          {
            roomId,
            name,
            groupId,
            isGroup,
            participants,
            createdBy,
            lastMessageDate: new Date()
          },
          undefined // No session in this case
        )

        return res.status(StatusCodes.CREATED).json({
          data: room,
          message: ReasonPhrases.CREATED,
          status: StatusCodes.CREATED
        })
      }

      const roomId = participants.sort().join('-')

      // Create the room
      const room = await roomService.create(
        {
          roomId,
          name,
          isGroup,
          participants,
          createdBy,
          lastMessageDate: new Date()
        },
        undefined // No session in this case
      )

      return res.status(StatusCodes.CREATED).json({
        data: room,
        message: ReasonPhrases.CREATED,
        status: StatusCodes.CREATED
      })
    } catch (error) {
      console.error('Error creating room:', error)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        status: StatusCodes.INTERNAL_SERVER_ERROR
      })
    }
  },
  getAllRoomByUserId: async (req: Request, res: Response) => {
    const { id } = req.params

    try {
      const rooms = await roomService.getAllRoomsByUserId(id)

      return res.status(StatusCodes.OK).json({
        data: rooms,
        message: ReasonPhrases.OK,
        status: StatusCodes.OK
      })
    } catch (error) {
      console.error('Error fetching rooms:', error)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        status: StatusCodes.INTERNAL_SERVER_ERROR
      })
    }
  }
}
