// socket.ts
import { Server } from 'socket.io'
import type { Server as HttpServer } from 'http'

export const initSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000'
    }
  })

  const userMap = new Map<string, string>() // socket.id -> username

  console.log('ming')

  io.on('connection', socket => {
    console.log('Connected:', socket.id)

    const defaultName = `Guest-${socket.id.slice(0, 5)}`
    userMap.set(socket.id, defaultName)

    console.log(`${defaultName} connected`)

    // send user list to all clients
    io.emit('user-list', Array.from(userMap.values()))

    // use this when user logged in
    socket.on('set-username', (username: string) => {
      userMap.set(socket.id, username)
      console.log(`User ${socket.id} changed name to ${username}`)
      io.emit('user-list', Array.from(userMap.values()))
    })

    socket.on('get_username', callback => {
      const user = userMap.get(socket.id)
      callback?.(user ? user : 'Unknown')
    })

    socket.on('join_room', (roomId: string) => {
      socket.join(roomId)
      console.log(`Socket ${socket.id} joined room ${roomId}`)
    })

    socket.on('send_message', message => {
      console.log('send toooo')
      console.log(message.roomId)
      io.to(message.roomId).emit('receive_message', message)
    })

    socket.on('get-connected-users', () => {
      const ids = Array.from(io.sockets.sockets.keys())
      socket.emit('connected-users', ids)
    })

    socket.on('disconnect', () => {
      console.log('Disconnected:', socket.id)
      userMap.delete(socket.id)
      io.emit('user-list', Array.from(userMap.values()))
    })
  })
}
