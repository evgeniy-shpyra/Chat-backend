require('dotenv').config()
const express = require('express')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const cookieParser = require("cookie-parser");
const authRouter = require('./routes/authRoutes')
const userRouter = require('./routes/userRoutes')

const app = express()
const port = process.env.PORT

app.use(cors())
app.use(fileUpload({}))
app.use(express.json())
app.use(cookieParser());

app.use('/api/auth', authRouter)
app.use('/api', userRouter)

app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})
