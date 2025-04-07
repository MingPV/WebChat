import { Router } from 'express'

import { messageController } from '@/controllers'

export const messages = (router: Router): void => {
  router.post('/messages', messageController.createMessage)
  router.get('/messages/roomId/:roomId', messageController.getMessagesByRoomId)
}
