const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocMessage } = require('./utils/messages')
const { addUser, getUser, getUsersInRoom, removeUser } = require('./utils/users') 
const logger = require('./loggers/index')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const pathToPublic = path.join(__dirname, '../public')

app.use(express.static(pathToPublic))


io.on('connection', (socket) => {
    console.log("New WebSocket Connecion")

    socket.on('join', ({ username, room }, callback) => {
    logger.info(`${username} has joined room${room}`)

        const { error, user } = addUser({id: socket.id, username, room })

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome'))
        socket.broadcast.to(user.room).emit('message', generateMessage(user.username,`${user.username} has joined`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        
        callback()

    })

    socket.on('sendMessage', (message, callback) => {

        const filter = new Filter()
        const user = getUser(socket.id)

        if (filter.isProfane(message)) {

            logger.warn(`${user.username} has abused in chat ${user.room}`)
            return callback('Message contains Profanity')
            
        }

        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', (loc, callback) => {
        const user = getUser(socket.id) 
        io.to(user.room).emit('locationMessage', generateLocMessage(user.username ,`https://www.google.com/maps?q=${loc.lat},${loc.long}`))
        logger.info(`${user.username} has shared location`)
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage(`${user.username} has left the chat!`))
            logger.info(`${user.username} has left the room ${user.room}`)
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log("server is running on ", port)
})