import redis from "../../shared/redis/redis.js"
//import User from '../../services/auth/models/user.model.js'

export const protect = async (req, res, next) => {
  try {
    const sessionId = req.cookies?.session
    if (!sessionId) return res.status(400).json({ message: 'unauthorized!' })

    const session = await redis.get(`session-${sessionId}`)
    if (!session) return res.status(400).json({ message: 'session expires!' })

    // const sessionData = JSON.parse(session)
    // const freshUser = await User.findById(sessionData._id)
    // if (!freshUser) 
    //   return res.status(401).json({ message: 'user no longer exists!' })

    req.user = JSON.parse(session)
    next()
  } catch (error) {
    return res.status(500).json({ message: `auth middleware error: ${error}` })
  }
}