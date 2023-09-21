const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage,generateLocationMessage,generateAdminMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')


const app = express()
const server =http.createServer(app)
const port = process.env.PORT || 3000
const io = socketio(server)

const publicDirectory = path.join(__dirname, '../public')

app.use(express.static(publicDirectory))


io.on('connection',(socket)=>{
    console.log('New WebSocket connection')

    

    socket.on('join',({username,room},callback)=>{
        const {error, user} = addUser({id: socket.id,username,room})
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('adminMessage',generateAdminMessage('Admin',`Welcome to ${user.room} Room!!!!!`))
        socket.broadcast.to(user.room).emit('adminMessage', generateAdminMessage('Admin',`${user.username} has joined!`))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })
    
    socket.on('sendMessage',(message,callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!!')
        }else{
            io.to(user.room).emit('message',generateMessage(user.username,user.id,message))
            callback()
        }
        
    })
    socket.on('sendLocation',({lattitude,longitude},callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,user.id,`https://google.com/maps?q=${lattitude},${longitude}`))
        callback()
    })
    //Disconnetion
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('adminMessage',generateAdminMessage('Admin',`${user.username} has left!`)) 
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

        
    })

})

server.listen(port,()=>{
    console.log(`Server is up on port ${port}`)
})

