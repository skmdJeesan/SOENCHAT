import { getModel } from "../config/llmModels.js"
import { generatePpt } from "../utils/generatePpt.js"
import { uploadToS3 } from "../utils/uploadToS3.js"
import { getFromS3 } from "../utils/getFromS3.js"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimits } from "../config/agentLimit.js"

export const pptAgent = async (state) => {
  try {
    await checkAgentLimits(state.userId, state.agent)

    const llm = await getModel('ppt')
    const prompt = `
      You are an expert presentation writer. return only valid JSON,
      Format:
      {
        "title": "",
        "subtitle": "",
        "slides": [
          "title": "",
          "points": ["", "", "",..],
        ]
      }
      Rules:
      - The title should be concise and engaging
      - The subtitle should provide context for the presentation
      - Each slide should have a clear title and a list of key points
      - The points should be bulletized and easy to read
      - Return only valid JSON, do not return Markdown, no code blocks, do not return explanations, do not return any text outside of the JSON object.
      Generate 5-10 slides, each slide should have 3-5 concise points.
      Topic: ${state.prompt}
    `
    const deduction = await deductCredits(state.userId, state.agent)
    if (!deduction?.success) {
      return {
        ...state,
        aiResponse: 'Insufficient credits. Please upgrade your plan.',
        credits: state.credits || 0
      };
    }
    
    const res = await llm.invoke(prompt)
    const data = JSON.parse(res.content.trim())
    const ppt = await generatePpt(data)
    const buffer = await ppt.write({outputType: 'nodebuffer'})
    const filename = await uploadToS3(`ppt-${Date.now()}.pptx`, buffer, 'application/vnd.openxmlformats-officedocument.presentationml.presentation')
    const download_url = await getFromS3(filename, 10 * 60) // 10 minutes

    return {
      ...state,
      aiResponse: `presentation generated successfully! [📥 Download Presentation](${download_url})\n\n⏳ Link expires in 10 minutes.`,
      credits: deduction.credits
    }
  } catch (error) {
    console.log(error)
    return {
      ...state,
      aiResponse: error?.data?.message || "Sorry, I encountered an error while generating the presentation."
    }
  }
}