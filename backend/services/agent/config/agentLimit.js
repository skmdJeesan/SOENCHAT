import redis from '../../../shared/redis/redis.js'

const limits = { chat: 20, search: 10, coding: 5, pdf: 5, ppt: 5, image: 5, pdfRag: 5, imageAnalyzer: 5 }
// these are the max limit you can call in 2 minutes

export const checkAgentLimits = async (userId, agent) => {
  const max = limits[agent] || limits['chat']
  const key = `${userId}-${agent}`

  let count = await redis.incr(key)
  if(count == 1) await redis.expire(key, 120)

  const ttl = await redis.ttl(key) // time to leave or expire
  if(count > max) {
    const minutes = Math.floor(ttl/60)
    const seconds = ttl % 60
    const time = (minutes > 0) ? `${minutes}m : ${seconds}s` : `${seconds}s`
    const error = new Error(`Max limit reached for agent ${agent}.`)
    error.status = 429
    error.data = {
      success: false, agent, limit: max, 
      remainingTime: ttl, retryAfter: time,
      message: `You have reached the ${agent} limit (${max} limit request /2 minites). Try again in ${time}.`
    }
    throw error
  }

  return {remaing: max - count, limit: max}
   
}

