import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import morgan from 'morgan'
import proxy from 'express-http-proxy'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { protect } from './middleware/auth.middleware.js'
import proxyWithHeader from './utils/proxyWithHeader.js'

const port = process.env.PORT || 8000
const app = express()

app.use(morgan('dev'))
app.use(cookieParser())
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
  next()
})

app.use('/api/auth', proxy(process.env.AUTH_SERVICE || 'http://localhost:8001'))
app.use('/api/chat', protect, proxyWithHeader(process.env.CHAT_SERVICE || 'http://localhost:8002'))
app.use('/api/agent', protect, proxyWithHeader(process.env.AGENT_SERVICE || 'http://localhost:8003'))
app.use('/api/billing', protect, proxyWithHeader(process.env.BILLING_SERVICE || 'http://localhost:8004'))

app.get('/api/me', protect, async (req, res) => {
  try {
    // get current user data from req.user and send it as response
    return res.status(200).json(req.user)
  } catch (error) {
    return res.status(500).json({message: `get user data error: ${error}`})
  }
})

app.get('/', (req, res) => {
  res.json('Hello from Gateway!')
})

app.listen(port, () => {
  console.log(`Gateway server started at ${port}`)
})