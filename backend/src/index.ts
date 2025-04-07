import express, { Express } from 'express'
import { join } from 'path'
import 'dotenv/config'

import '@/infrastructure/logger'
import { mongoose, redis } from '@/dataSources'
import {
  corsMiddleware,
  authMiddleware,
  notFoundMiddleware
} from '@/middlewares'
import { router } from '@/routes'
import { i18next, i18nextHttpMiddleware } from '@/i18n'

import http from 'http'

import cookieParser = require('cookie-parser')
import { initSocket } from './socket'

mongoose.run()
redis.run()

const app: Express = express()
const server = http.createServer(app) // 👈 สำคัญมากสำหรับ socket.io

app.use(
  join('/', process.env.STORAGE_PATH),
  express.static(join(__dirname, process.env.STORAGE_PATH))
)

app.use(cookieParser())

app.use(
  express.json({ limit: '10mb' }),
  express.urlencoded({ limit: '10mb', extended: true }),
  corsMiddleware,
  i18nextHttpMiddleware.handle(i18next),
  authMiddleware,
  router,
  notFoundMiddleware
)

initSocket(server)

server.listen(process.env.APP_PORT)
