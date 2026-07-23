import { checkAgentLimits } from '../config/agentLimit.js'
import { searchTool } from '../config/tavily.js'
import { deductCredits } from '../utils/deductCredits.js'

const normalizeImages = (images) => {
  if (!Array.isArray(images)) return []

  return images
    .map((item) => {
      if (typeof item === 'string') return item.trim()
      if (item && typeof item === 'object') {
        return item.url || item.image_url || item.src || item.link || ''
      }
      return ''
    })
    .filter(Boolean)
}

export const searchAgent = async (state) => {
  try {
    await checkAgentLimits(state.userId, state.agent)

    const deduction = await deductCredits(state.userId, state.agent)
    if (!deduction?.success) {
      return {
        ...state,
        aiResponse: 'Insufficient credits. Please upgrade your plan.',
        credits: state.credits || 0
      };
    }
    
    const results = await searchTool.invoke({ query: state.prompt })
    const images = normalizeImages(results?.images)

    return { ...state, searchResults: results, images, credits: deduction.credits }
  } catch (error) {
    return { ...state, searchResults: [], images: [], aiResponse: error?.data?.message || 'Error performing search. Please try again.' }
  }
}