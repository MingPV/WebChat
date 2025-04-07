import { Server } from 'socket.io'

export const setupSocket = (io: Server) => {
  io.on('connection', socket => {
    console.log('A user connected')

    // Handle joining a room
    socket.on('joinRoom', room => {
      socket.join(room)
      console.log(`User joined room: ${room}`)
    })

    // Handle sending messages to a room
    socket.on('message', ({ room, message }) => {
      console.log(`Message to room ${room}: ${message}`)
      io.to(room).emit('message', message) // Broadcast to the room
    })

    socket.on('disconnect', () => {
      console.log('A user disconnected')
    })
  })
}
