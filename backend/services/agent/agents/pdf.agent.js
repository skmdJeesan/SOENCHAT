import { checkAgentLimits } from "../config/agentLimit.js"
import { getModel } from "../config/llmModels.js"
import { deductCredits } from "../utils/deductCredits.js"
import { generatePdf } from "../utils/generatePdf.js"
import { getFromS3 } from "../utils/getFromS3.js"
import { uploadToS3 } from "../utils/uploadToS3.js"

export const pdfAgent = async (state) => {
  try {
    await checkAgentLimits(state.userId, state.agent)

    const llm = await getModel('pdf')
    const prompt = `
      You are an expert document writer. return only valid JSON,
      do not return Markdown, do not return explanations, do not return any text outside of the JSON object.
      The JSON object should have the following structure:
      { 
        'title': '', 
        'subtitle': '',
        'sections': [{ 'heading': '', 'points': [] }]
      }
      generate 4-8 sections, each section should have 3-5 concise points.
      topic: ${state.prompt}
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
    const pdf_buffer = await generatePdf(data)

    const filename = await uploadToS3(`pdfs/${Date.now()}.pdf`, pdf_buffer, 'application/pdf')
    const download_url = await getFromS3(filename, 10 * 60) // 10 minutes

    return {
      ...state,
      aiResponse: `PDF generated successfully! [📥 Download PDF](${download_url})\n\n⏳ Link expires in 10 minutes.`,
      credits: deduction.credits
    }
  } catch (error) {
    console.error(error)
    return {
      ...state,
      aiResponse: error?.data?.message || "Sorry, I encountered an error while generating the PDF."
    }
  }
}