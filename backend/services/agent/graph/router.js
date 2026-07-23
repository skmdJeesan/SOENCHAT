import { getModel } from "../config/llmModels.js"
import { isTimeQuery } from "../utils/timeQuery.js"

export const router = async (state) => {

  if(state.file?.mimetype === 'application/pdf') {
    return {...state, agent: 'pdfRag' }
  } else if(state.file?.mimetype.startsWith('image/')) {
    return {...state, agent: 'imageAnalyzer' }
  }

  const requestedAgent = typeof state.agent === 'string' ? state.agent.trim().toLowerCase() : ''
  const normalizedAgent = requestedAgent === 'web search' || requestedAgent === 'web-search' || requestedAgent === 'websearch'
    ? 'search'
    : requestedAgent

  if(normalizedAgent && normalizedAgent !== 'auto') {
    return {...state, agent: normalizedAgent }
  }

  if (isTimeQuery(state.prompt)) {
    return { ...state, agent: 'chat' }
  }

  const llm = await getModel('router')
  const prompt = `
    You are an intelligent request router.
    Your task is to choose the SINGLE most appropriate agent for the user's request.

    Available agents:
    - chat
    - coding
    - search
    - pdf
    - ppt
    - image

    Agent descriptions:
    1. chat
      - General conversations
      - Explanations
      - Learning concepts
      - Brainstorming
      - Summarization
      - Advice
      - Writing assistance
      - Math and reasoning
      - Any request that does NOT require internet, coding, PDF, PPT, or image generation

    2. coding
      - Writing code
      - Debugging
      - Explaining code
      - Fixing errors
      - Algorithms
      - Data structures
      - Software architecture
      - APIs
      - Database design
      - Programming questions

    3. search
      - Latest news
      - Current events
      - Real-time information
      - Weather
      - Stock prices
      - Sports scores
      - Internet lookup
      - Anything requiring up-to-date information

    4. pdf
      - Generate a PDF
      - Modify a PDF
      - Read or analyze a PDF
      - Questions about uploaded PDF documents

    5. ppt
      - Generate PowerPoint presentations
      - Edit presentations
      - Questions about uploaded PPT/PPTX files
      - Create slides

    6. image
      - Generate images
      - Create illustrations
      - Logos
      - Posters
      - Diagrams
      - Image editing
      - Image analysis
      - Questions about uploaded images

    Routing rules:
    - Return EXACTLY ONE agent.
    - Never explain your decision.
    - Never output anything except the agent name.
    - If multiple agents seem possible, choose the one that best satisfies the user's primary intent.
    - If uncertain, choose "chat".

    Valid outputs:
    chat
    coding
    search
    pdf
    ppt
    image

    User Query: ${state.prompt}
  `;
  const response = await llm.invoke(prompt)
  return {...state, agent: response.content.trim().toLowerCase() }
}