import { Router } from 'express'

import { authGuard } from '@/guards'
import { roomController } from '@/controllers/roomController'

export const rooms = (router: Router): void => {
  router.post('/rooms', authGuard.isAuth, roomController.createRoom)
}
