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
  const userMap2 = new Map<string, string>() // socket.id <- username

  //   const onePeopleRoomMap = new Map<string, string>() // socket.id -> roomId
  //   const roomMapToCreater = new Map<string, string>() // roomId -> socket.id

  console.log('ming')

  io.on('connection', socket => {
    console.log('Connected:', socket.id)

    const defaultName = `Guest-${socket.id.slice(0, 5)}`
    userMap.set(socket.id, defaultName)
    userMap2.set(defaultName, socket.id)

    console.log(`${defaultName} connected`)

    // send user list to all clients
    io.emit('user-list', Array.from(userMap.values()))

    const rooms1 = io.sockets.adapter.rooms
    const sids1 = io.sockets.adapter.sids

    let roomList1 = []
    for (const [roomId, sockets] of rooms1) {
      if (!sids1.has(roomId)) {
        const members = Array.from(sockets).map(socketId => ({
          socketId,
          username: userMap.get(socketId) || 'unknown'
        }))
        roomList1.push({ roomId, members })
      }
    }
    io.emit('all_rooms', roomList1)

    // use this when user logged in
    socket.on('set-username', (username: string) => {
      userMap.set(socket.id, username)
      userMap2.set(username, socket.id)
      console.log(`User ${socket.id} changed name to ${username}`)
      io.emit('user-list', Array.from(userMap.values()))
    })

    socket.on('get_username', callback => {
      const user = userMap.get(socket.id)
      callback?.(user ? user : 'Unknown')
    })

    socket.on('join_room', (roomId: string) => {
      socket.join(roomId)
      const rooms = io.sockets.adapter.rooms
      const sids = io.sockets.adapter.sids
      let roomList = []

      for (const [roomId, sockets] of rooms) {
        const members = Array.from(sockets).map(socketId => ({
          socketId,
          username: userMap.get(socketId) || 'unknown'
        }))
        if (sids.has(roomId)) {
          continue
          // this is not room
        }

        roomList.push({ roomId, members })
      }

      io.emit('all_rooms', roomList)
      console.log(`Socket ${socket.id} joined room ${roomId}`)
    })

    socket.on('get_my_room_members', (roomId: string) => {
      const room = io.sockets.adapter.rooms.get(roomId)
      const members = []

      if (room) {
        for (const socketId of room) {
          const username = userMap.get(socketId) || 'unknown'
          members.push({ socketId, username })
        }
      }

      io.to(roomId).emit('room_members', { roomId, members })
    })

    socket.on(
      'private_message',
      ({ toSocketUsername, message, sender, createdAt }) => {
        let sendTo = userMap2.get(toSocketUsername)
        if (sendTo) {
          io.to(sendTo).emit('receive_private_message', {
            from: socket.id,
            message,
            sender,
            createdAt
          })
        }
      }
    )

    // send all rooms when new room is createdAt
    socket.on('create_room', (roomId: string) => {
      console.log(`Socket ${socket.id} created room ${roomId}`)
      const rooms = io.sockets.adapter.rooms
      const sids = io.sockets.adapter.sids

      let roomList = []

      for (const [roomId, sockets] of rooms) {
        const members = Array.from(sockets).map(socketId => ({
          socketId,
          username: userMap.get(socketId) || 'unknown'
        }))
        if (sids.has(roomId)) {
          continue
          // this is not room
        }
        roomList.push({ roomId, members })
      }

      io.emit('all_rooms', roomList)
    })

    socket.on('leave_public_room', (roomId: string) => {
      socket.leave(roomId)
      socket.join('PublicRoom')
      const room = io.sockets.adapter.rooms.get(roomId)
      console.log(`${userMap.get(socket.id)} leaveeeee`, roomId)
      const rooms = io.sockets.adapter.rooms
      const sids = io.sockets.adapter.sids
      if (!room || room.size === 0) {
        console.log(`Room ${roomId} is now empty`)
        // 👉 ตรงนี้แหละจะรู้ว่าคนสุดท้ายออกแล้ว
      } else {
        const members = []

        if (room) {
          for (const socketId of room) {
            const username = userMap.get(socketId) || 'unknown'
            members.push({ socketId, username })
          }
        }

        io.to(roomId).emit('room_members', { roomId, members })
      }
      let roomList = []

      for (const [roomId, sockets] of rooms) {
        const members = Array.from(sockets).map(socketId => ({
          socketId,
          username: userMap.get(socketId) || 'unknown'
        }))
        if (sids.has(roomId)) {
          continue
          // this is not room
        }

        roomList.push({ roomId, members })
      }

      io.emit('all_rooms', roomList)
    })

    socket.on('send_message', message => {
      console.log('send toooo')
      console.log(message.roomId)
      console.log(message)
      io.to(message.roomId).emit('receive_message', message)
    })

    socket.on('get-connected-users', () => {
      const ids = Array.from(io.sockets.sockets.keys())
      socket.emit('connected-users', ids)
    })

    socket.on('disconnect', () => {
      console.log('Disconnected:', socket.id)
      userMap2.delete(userMap.get(socket.id) ?? '')
      userMap.delete(socket.id)
      io.emit('user-list', Array.from(userMap.values()))
    })
  })
}
