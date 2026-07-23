import axios from 'axios'
import { graph } from '../graph/graph.js'
import { addMessages } from '../config/memory.js'
import redis from '../../../shared/redis/redis.js'

export const agent = async (req, res, next) => {
  try {
    const { prompt, conversationId, agent } = req.body ?? {}
    const userId = req.headers['x-user-id']
    const file = req?.file

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ message: 'prompt is required' })
    }

    if (!conversationId) {
      return res.status(400).json({ message: 'conversationId is required' })
    }

    // await redis.del(`messages-${conversationId}`)
    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, { // user's message storing on MongoDB
      conversationId,
      role: 'user',
      content: prompt.trim(),
    })

    const result = await graph.invoke({ 
      prompt: prompt.trim(), conversationId,
      agent, userId, file
    })

    const response = typeof result?.aiResponse === 'string' ? result.aiResponse : ''
    const images = Array.isArray(result?.images) ? result.images : []
    const artifacts = Array.isArray(result?.artifacts) ? result.artifacts : []

    await addMessages(conversationId, 'user', prompt) // user's message storing on redis
    await addMessages(conversationId, 'assistant', response) // aiResponse message storing on redis

    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, { // aiRespnse message storing on MongoDB
      conversationId,
      role: 'assistant',
      content: response,
      images, artifacts
    })

    return res.status(200).json({ response, images, artifacts, credits: result?.credits })
  } catch (error) {
    // console.error('agent error:', error)
    // return res.status(500).json({ message: `agent error: ${error.message || error}` })
    next(error)
  }
}