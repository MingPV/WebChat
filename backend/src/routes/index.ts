import { Router } from 'express'

import { auth } from './auth'
import { users } from './users'
import { media } from './media'
import { rooms } from './rooms'
import { messages } from './messages'
import { groupIdentifiers } from './groupIdentifiers'
import { friends } from './friends'

const router: Router = Router()

const routes: {
  [key: string]: (router: Router) => void
} = { auth, users, media, rooms, messages, groupIdentifiers, friends }

for (const route in routes) {
  routes[route](router)
}

export { router }
