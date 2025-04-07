import { Router } from 'express'

import { authGuard } from '@/guards'
import { roomController } from '@/controllers/roomController'

export const rooms = (router: Router): void => {
  router.post('/rooms', authGuard.isAuth, roomController.createRoom)
  router.get('/rooms/userId/:id', roomController.getAllRoomByUserId)
}
