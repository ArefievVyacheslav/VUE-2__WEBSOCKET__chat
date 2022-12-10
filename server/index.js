const express = require('express')
const socketIO = require('socket.io')
const http = require('http')
const path = require('path')
const users = require('./users')()


const port = process.env.PORT || 3000
const publicPath = path.resolve(__dirname, '../public')

const app = express()
const server = http.createServer(app)
const io = socketIO(server)
const message = (name, message, id) => ({ name, message, id })


app.use(express.static(publicPath))


io.on('connection', socket => {
  console.log('SERVER CONNECTION!!!')
  socket.on('join', (user, callback) => {
    if (!user.name || !user.room) return callback('Error join')
    callback({ userId: socket.id })
    socket.join(user.room)
    users.remove(socket.id)
    users.add(socket.id, user.name, user.room)
    io.to(user.room).emit('users:update', users.getByRoom(user.room))
    socket.emit('message:new', message('Admin', `Welcome ${user.name}`))
    socket.broadcast.to(user.room).emit('message:new', message('Admin', `Welcome ${user.name}`))
  })
  socket.on('message:create', (data, callback) => {
    if (!data) {
      callback(`Message can't be empty`)
    }
    else {
      const user = users.get(socket.id)
      if (user) io.to(user.room).emit('message:new', message(data.name, data.text, data.id))
      callback()
    }
  })
  socket.on('disconnect', () => {
    const user = users.remove(socket.id)
    if (user) {
      io.to(user.room).emit('users:update', users.getByRoom(user.room))
      io.to(user.room).emit('message:new', message('Admin', `${ user.name } disconnect :(`))
    }
  })
})


server.listen(port, () => {
  console.log(`Server on ${ port }`)
})
