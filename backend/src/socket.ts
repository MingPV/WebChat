// socket.ts
import { Server } from 'socket.io'
import type { Server as HttpServer } from 'http'

export const initSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000'
    }
  })

  console.log('ming')

  io.on('connection', socket => {
    console.log('Connected:', socket.id)

    socket.on('join_room', (roomId: string) => {
      socket.join(roomId)
      console.log(`Socket ${socket.id} joined room ${roomId}`)
    })

    socket.on('send_message', ({ roomId, message, sender, createdAt }) => {
      console.log('send toooo')
      console.log(roomId)
      io.to(roomId).emit('receive_message', { message, sender, createdAt })
    })

    socket.on('disconnect', () => {
      console.log('Disconnected:', socket.id)
    })
  })
}
