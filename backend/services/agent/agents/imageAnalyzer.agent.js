import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { getModel } from "../config/llmModels.js"
import fs from 'fs/promises'
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimits } from "../config/agentLimit.js"

export const imageAnalyzerAgent = async (state) => {
  try {
    await checkAgentLimits(state.userId, state.agent)

    const llm = await getModel('imageAnalyzer')
    const image_buffer = await fs.readFile(state.file.path)
    const image_base64 = image_buffer.toString('base64')

    const system_prompt = `
      You are SOENCHAT's image analyzer agent
      Rules:
        - Analyze only the uploaded image.
        - Answer the user's question accurately.
        - If text exists in the image, extract it.
        - If charts or table exists, explain them.
        - If something is unclear, say so.
        - Use markdown when helpfull.
        - Do not hallucinate
    `
    const messages = [
      new SystemMessage(system_prompt),
      new HumanMessage({
        content: [
          {type: 'text', text: state.prompt || 'analyze the image'},
          { type: 'image_url', 
            image_url: {
            url: `data:${state.file.mimetype};base64,${image_base64}`
          }}
        ]
      })
    ]

    const deduction = await deductCredits(state.userId, 'image')
    if (!deduction?.success) {
      return {
        ...state,
        aiResponse: 'Insufficient credits. Please upgrade your plan.',
        credits: state.credits || 0
      };
    }

    const response = await llm.invoke(messages)
    return {...state, aiResponse: response.content, credits: deduction.credits}
  } catch (error) {
    console.log(error)
    return {...state, aiResponse: error?.data?.message || 'Sorry! I am unable to analyze the file!'}
  } finally { await fs.unlink(state.file.path) }
}