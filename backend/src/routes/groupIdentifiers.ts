import { Router } from 'express'

import { groupIdentifierController } from '@/controllers'

export const groupIdentifiers = (router: Router): void => {
  router.post(
    '/groupIdentifiers',
    groupIdentifierController.createGroupIdentifier
  )
}
