import { Router } from 'express'

import { friendController } from '@/controllers/friendController'

export const friends = (router: Router): void => {
  router.post('/friends', friendController.createFriend)
  router.get('/friends/userId/:user_id', friendController.getFriendsByUserId)
  router.put('/friends/:id', friendController.updateFriendById)
  router.post('/friends/:id', friendController.deleteFriendById) // need to change
}
