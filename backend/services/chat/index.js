import express from 'express'
import dotenv from 'dotenv'
import connectDb from './config/db.js'
import router from './routes/chat.route.js'
dotenv.config()

const port = process.env.PORT || 8002
const app = express()

app.use(express.json())
app.use('/', router)

app.get('/', (req, res) => {
  res.json('Hello from Chat server!')
})

app.listen(port, async () => {
  console.log(`Chat server started at ${port}`)
  await connectDb()
})