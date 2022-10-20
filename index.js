require('dotenv').config()
const express = require('express')
const cors = require('cors')
const db = require('./db')
const userRouter = require('./routes/userRoutes')

const app = express()
const port = process.env.PORT

app.use(cors())
app.use(express.json())


app.use('/api/auth', userRouter)




app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})
