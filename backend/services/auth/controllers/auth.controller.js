import { app } from "../config/firebase.js"
import { getAuth } from 'firebase-admin/auth'
import User from "../models/user.model.js"
import crypto from 'crypto'
import redis from "../../../shared/redis/redis.js"

export const login = async (req, res) => {
  try {
    const { token } = req.body
    const decoded = await getAuth(app).verifyIdToken(token)
    // decode has the data.user

    let user = await User.findOne({ firebaseUid: decoded.uid })

    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        name: decoded.name,
        email: decoded.email,
        avatar: decoded.picture
      })
    }

    // session store in cookies for 7 days
    const sessionId = crypto.randomUUID()
    await redis.set(`user-session-${user?._id}`, sessionId, 'EX', 7 * 24 * 60 * 60)

    // set the session user in redis for fast get data
    await redis.set(`session-${sessionId}`, JSON.stringify({
      userId: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar
    }), 'EX', 7 * 24 * 60 * 60)

    // set the session user in cookies
    res.cookie('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV == 'production',
      sameSite: process.env.NODE_ENV == 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.status(200).json(user)
  } catch (error) {
    return res.status(500).json({
      message: `user login error: ${error}`
    })
  }
}

export const logOut = async (req, res) => {
  try {
    const sessionId = req.cookies?.session
    await redis.del(`session-${sessionId}`)
    res.clearCookie('session')
    return res.status(200).json({ message: `user logout successfully!` })
  } catch (error) {
    return res.status(500).json({ message: `user logout error: ${error}` })
  }
}

export const userPaymentUpdate = async (req, res) => {
  try {
    const {plan, credits, userId} = req.body;
    // const userId = req.headers['x-user-id']
    const user = await User.findById(userId)
    if(!user) {
      return res.status(400).json({message: 'user not found!'})
    }
    
    user.plan = plan
    user.credits += credits
    user.totalCredits += credits
    user.planExpiresAt = new Date(Date.now() + 30*24*60*60*1000)
    await user.save()

    const sessionId = await redis.get(`user-session-${user?._id}`)
    await redis.set(`session-${sessionId}`, JSON.stringify({
      userId: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      plan: user.plan,
      credits: user.credits,
      totalCredits: user.totalCredits,
      planExpiresAt: user.planExpiresAt
    }), 'EX', 7 * 24 * 60 * 60)

    return res.status(200).json({success: true})
  } catch (error) {
    return res.status(500).json({message: `update user payment details error: ${error}`})
  }
}

export const deductCredits = async (req, res) => {
  try {
    const {userId, agent} = req.body;
    const cost = { chat: 1, search: 2, coding: 10, pdf: 10, ppt: 10, image: 5}

    const user = await User.findById(userId)
    if(!user) return res.status(400).json({message: `user not found!`})

    const required_credits = cost[agent] || 1
    if(required_credits > user?.credits) {
      return res.status(400).json({message: `Not enough credits`})
    }

    user.credits -= required_credits
    await user.save()

    const sessionId = await redis.get(`user-session-${user?._id}`)
    await redis.set(`session-${sessionId}`, JSON.stringify({
      userId: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      plan: user.plan,
      credits: user.credits,
      totalCredits: user.totalCredits,
      planExpiresAt: user.planExpiresAt
    }), 'EX', 7 * 24 * 60 * 60)

    return res.status(200).json({success: true, credits: user.credits})
  } catch (error) {
    return res.status(500).json({message: `deduct credits error: ${error}`})
  }
}