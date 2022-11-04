require('dotenv').config()
const express = require('express')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const authRouter = require('./routes/authRoutes')
const userRouter = require('./routes/userRoutes')

const app = express()
const port = process.env.PORT

app.use(cookieParser())
app.use(
    cors({
        credentials: true,
        origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
    })
)
app.use(fileUpload({}))
app.use(express.json())


app.use('/api', userRouter)
app.use('/api/auth', authRouter)


app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})
