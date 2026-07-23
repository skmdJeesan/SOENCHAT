import { getModel } from "../config/llmModels.js"
import axios from "axios"
import { uploadToS3 } from "../utils/uploadToS3.js"
import { getFromS3 } from "../utils/getFromS3.js"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimits } from "../config/agentLimit.js"

export const imageAgent = async (state) => {
  try {
    await checkAgentLimits(state.userId, state.agent)
    const llm = await getModel('image')
    const res = await llm.invoke(`
      You are an elite AI image prompt engineer. 
      You will be given a user prompt and you will generate a prompt for an AI image generation model. 
      The prompt should be detailed, descriptive, and specific. 
      It should include information about the subject, style, cenamatic lighting, color palette, 
      professional composition, ultra realistic, 8k, and any other relevant details.
      and any other relevant details. 
      The prompt should be written in English and should be formatted as a single paragraph.
      user prompt: ${state.prompt}
    `)
     
    const deduction = await deductCredits(state.userId, state.agent)
    if (!deduction?.success) {
      return {
        ...state,
        aiResponse: 'Insufficient credits. Please upgrade your plan.',
        credits: state.credits || 0
      };
    }

    const prompt = res.content.trim()
    const image_url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`
    const image_response = await axios.get(image_url, { responseType: 'arraybuffer' })

    const buffer = Buffer.from(image_response.data)
    const filename = `images/${Date.now()}.png`
    const contentType = 'image/png'

    await uploadToS3(filename, buffer, contentType)
    const download_url = await getFromS3(filename, 10 * 60) // 10 minutes
    
    return {
      ...state,
      aiResponse: `![Generated Image](${download_url})\n\n[📥 Download Image](${download_url})\n\n⏳ Link expires in 10 minutes.`,
      credits: deduction.credits
    }
  } catch (error) {
    // console.error('Image generation error:', error.message)
    // console.error('Full error:', error)
    return {
      ...state,
      aiResponse: error?.data?.message || `Error generating image, please try again. If the issue persists, contact support.`,
    }
  }
}