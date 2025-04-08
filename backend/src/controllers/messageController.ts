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

import { Request, Response } from 'express'
import { messageService } from '@/services/messageService'
import { StatusCodes, ReasonPhrases } from 'http-status-codes'

// do it with the same format as roomController

export const messageController = {
  createMessage: async (req: Request, res: Response) => {
    const { roomId, senderId, content, senderName } = req.body

    // Validate required fields
    if (!roomId || !content) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Missing required fields',
        status: StatusCodes.BAD_REQUEST
      })
    }

    try {
      // Create the message
      const message = await messageService.create(
        {
          roomId,
          sender: senderId,
          senderName: senderName,
          message: content,
          sentAt: new Date()
        },
        undefined // No session in this case
      )

      return res.status(StatusCodes.CREATED).json({
        data: message,
        message: ReasonPhrases.CREATED,
        status: StatusCodes.CREATED
      })
    } catch (error) {
      console.error('Error creating message:', error)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        status: StatusCodes.INTERNAL_SERVER_ERROR
      })
    }
  },
  getMessagesByRoomId: async (req: Request, res: Response) => {
    const { roomId } = req.params
    if (!roomId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Missing roomId',
        status: StatusCodes.BAD_REQUEST
      })
    }
    try {
      const messages = await messageService.getAllMessagesByRoomId(roomId)
      return res.status(StatusCodes.OK).json({
        data: messages,
        message: ReasonPhrases.OK,
        status: StatusCodes.OK
      })
    } catch (error) {
      console.error('Error getting messages:', error)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        status: StatusCodes.INTERNAL_SERVER_ERROR
      })
    }
  }
}
