// import { Request, Response } from 'express'
// import { roomService } from '@/services/roomService'
// import { StatusCodes, ReasonPhrases } from 'http-status-codes'

// export const roomController = {
//   createRoom: async (req: Request, res: Response) => {
//     const { roomId, name, groupId, isGroup, participants, createdBy } = req.body

//     // Validate required fields
//     if (!roomId || !name || !participants || !createdBy) {
//       return res.status(StatusCodes.BAD_REQUEST).json({
//         message: 'Missing required fields',
//         status: StatusCodes.BAD_REQUEST
//       })
//     }

//     try {
//       // Create the room
//       const room = await roomService.create(
//         { roomId, name, groupId, isGroup, participants, createdBy },
//         undefined // No session in this case
//       )

//       return res.status(StatusCodes.CREATED).json({
//         data: room,
//         message: ReasonPhrases.CREATED,
//         status: StatusCodes.CREATED
//       })
//     } catch (error) {
//       console.error('Error creating room:', error)
//       return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//         message: ReasonPhrases.INTERNAL_SERVER_ERROR,
//         status: StatusCodes.INTERNAL_SERVER_ERROR
//       })
//     }
//   }
// }

// {
//     _id: ObjectId('group_id_123'),
//     name: 'กลุ่มเพื่อนปี 3',
//     groupNumber: 1,
//     createdAt: ISODate('2025-04-06T00:00:00Z')
//   }

//create controller with the same format

import { Request, Response } from 'express'
import { groupIdentifierService } from '@/services/groupIdentifierService'
import { StatusCodes, ReasonPhrases } from 'http-status-codes'

export const groupIdentifierController = {
  createGroupIdentifier: async (req: Request, res: Response) => {
    const { name } = req.body

    // Validate required fields
    if (!name) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Missing required fields',
        status: StatusCodes.BAD_REQUEST
      })
    }

    try {
      // Check number of groupname already exist
      const existingGroupIdentifier =
        await groupIdentifierService.getAllGroupsByGroupName(name)
      const countGroup = existingGroupIdentifier.length
      const groupNumber = countGroup + 1

      // Create the group identifier
      const groupIdentifier = await groupIdentifierService.create(
        { name, groupNumber, createdAt: new Date() },
        undefined // No session in this case
      )

      return res.status(StatusCodes.CREATED).json({
        data: groupIdentifier,
        message: ReasonPhrases.CREATED,
        status: StatusCodes.CREATED
      })
    } catch (error) {
      console.error('Error creating group identifier:', error)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        status: StatusCodes.INTERNAL_SERVER_ERROR
      })
    }
  }
}
