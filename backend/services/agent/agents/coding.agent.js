import { checkAgentLimits } from "../config/agentLimit.js"
import { getModel } from "../config/llmModels.js"
import { deductCredits } from "../utils/deductCredits.js"

export const codingAgent = async (state) => {
  try {
    await checkAgentLimits(state.userId, state.agent)
    const intent_prompt = `
      You are an intent classifier.
      Return ONLY one of these values.

      CODE_GENERATION
      CODE_REVIEW
      CODE_EXPLANATION
      DEBUGGING
      OPTIMIZATION
      CONVERSION
      DOCUMENTATION

      User Request: ${state.prompt}
    `
    const intent_llm = await getModel('intent') // groq_llm
    const llm = await getModel('coding') // openroute_llm
    const intent_res = await intent_llm.invoke(intent_prompt)
    const intent = intent_res.content
    // console.log(intent)

    if (intent === 'CODE_GENERATION') {
      const prompt = `
        You are ChaatGPT Coding Agent.
        Generate the requested project.

        Default stack:
        - HTML
        - CSS
        - JavaScript

        Use React / Next.js / Vue ONLY if explicitly requested.

        Rules:
        - Responsive
        - Modern UI
        - CSS Variables
        - Flexbox/Grid
        - Smooth Scroll
        - Hover Effects
        - Beautiful spacing
        - Single page unless user asks otherwise.

        Images:
        Always use real unsplash images. Never use placeholders

        Return ONLY valid JSON.

        Schema:

        {
          "files":[
            {
              "name":"index.html",
              "content":"..."
            },
            {
              "name":"style.css",
              "content":"..."
            },
            {
              "name":"script.js",
              "content":"..."
            }
          ]
        }

        Rules:
          - Output must start with {
          - Output must end with }
          - No markdown
          - No explanation
          - No extra text
          - No \`\`\`
          - Never mention intent

        User Request: ${state.prompt}
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
      const data = JSON.parse(res.content)
      // console.log(data)
      return {
        ...state,
        aiResponse: 'Code generated successfully!',
        artifacts: [{ id: Date.now(), type: intent, title: state.prompt, files: data.files || [] }],
        credits: deduction.credits
      }
    }

    const res = await llm.invoke(`
      The user's request intent is: ${intent}
      Return Markdown only.
      Never generate project files.
      Use headings like:
      # Overview
      ## Explanation
      ## Problems
      ## Improvements
      ## Best Practices
      ## Optimized Code (if needed)
      User Request: ${state.prompt}
    `)

    await deductCredits(state.userId, state.agent)
    const data = res.content
    return { ...state, aiResponse: data, artifacts: [] }
  } catch (error) {
    console.error(error)
    return { ...state, aiResponse: error?.data?.message || 'Error generating response. Please try again.', artifacts: [] }
  }
}