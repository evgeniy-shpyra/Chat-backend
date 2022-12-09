require('dotenv').config()
const express = require('express')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const socket = require('socket.io')
const authRouter = require('./routes/authRoutes')
const userRouter = require('./routes/userRoutes')
const dialogueRouter = require('./routes/dialogueRoutes')
const conversationRoute = require('./routes/conversationRoutes')
const dialogueSocketController = require('./socketControllers/dialogueSocketController')

const app = express()
const port = process.env.PORT

app.use(cookieParser())
app.use(
    cors({
        credentials: true,
        origin: [process.env.CLIENT_URL],
    })
)
app.use(fileUpload({}))
app.use(express.json())

app.use('/api', userRouter, dialogueRouter, conversationRoute)
app.use('/api/auth', authRouter)

const server = app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})

const io = socket(server, {
    cors: {
        origin: [process.env.CLIENT_URL],
        // origin: 'https://chat-frontend-snowy.vercel.app',
        // credentials: true,
        methods: ['GET', 'POST'],
    },
    // allowEIO3: true
})

global.onlineUsers = new Map()

io.engine.on('connection_error', (err) => {
    console.log('err.req', err.req) // the request object
    console.log('err.code', err.code) // the error code, for example 1
    console.log('err.message', err.message) // the error message, for example "Session ID unknown"
    console.log('err.context', err.context) // some additional error context
})

io.on('connection', (socket) => {
    global.chatSocket = socket

    socket.on('online:add', (userId) => {
        onlineUsers.set(userId, socket.id)
    })

    socket.on('dialogue:add', async (data) => {
        const sendUserSocket = onlineUsers.get(data.toUserId)
        if (sendUserSocket) {
            const user = await dialogueSocketController.getDialogueForNotOwner(
                data.dialogueId
            )
            user && socket.to(sendUserSocket).emit('dialogue:get', user)
        }
    })

    socket.on('dialogue:delete', async (data) => {
        const sendUserSocket = onlineUsers.get(data.toUserId)
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit('dialogue:delete', {
                dialogueId: data.dialogueId,
                userId: data.userId,
            })
        }
    })

    socket.on('conversation-clear-history:add', async (data) => {
        const sendUserSocket = onlineUsers.get(data.toUserId)
        if (sendUserSocket)
            socket.to(sendUserSocket).emit('conversation-clear-history:get', {
                dialogueId: data.dialogueId,
            })
    })

    socket.on('message:add', (data) => {
        const sendUserSocket = onlineUsers.get(data.toUserId)

        if (sendUserSocket) {
            socket.to(sendUserSocket).emit('message:get', {
                message: data.message,
                dialogueId: data.dialogueId,
            })
        }
    })

    socket.on('logout', (data) => {
        onlineUsers.delete(data.userId)
    })

    socket.on('disconnecting', () => {
        const keys = onlineUsers.keys()

        for (let i = 0; i < onlineUsers.size; i++) {
            const key = keys.next().value
            onlineUsers.get(key) === socket.id && onlineUsers.delete(key)
        }
    })
})
