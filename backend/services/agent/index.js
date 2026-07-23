import express from 'express'
import 'dotenv/config'
import connectDb from './config/db.js'
import router from './routes/agent.route.js'

const port = process.env.PORT || 8003
const app = express()

app.use(express.json())

app.use('/', router)
app.use((err, req, res, next) => {
  console.log(err)
  if(err.status) {
    return res.status(err.status).json(err.data)
  }
  return res.status(500).json({ message: `agent error: ${error.message || error}` })
})

app.get('/', (req, res) => {
  res.json('Hello from Agent server!')
})

app.listen(port, async () => {
  console.log(`Agent server started at ${port}`)
  await connectDb()
})