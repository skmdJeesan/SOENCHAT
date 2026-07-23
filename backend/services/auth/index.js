import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import connectDb from './config/db.js'
import router from './routes/auth.route.js'

const port = process.env.PORT || 8001
const app = express()

app.use(express.json())
app.use('/', router)

app.get('/', (req, res) => {
  res.json('Hello from Auth server!')
})

app.listen(port, async () => {
  console.log(`Auth server started at ${port}`)
  await connectDb()
})