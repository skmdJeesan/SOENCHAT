import { ChatGroq } from "@langchain/groq"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { ChatOpenRouter } from "@langchain/openrouter";

const groq_llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  temperature: 0.7,
  maxRetries: 2,
})

const gemini_llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-3.5-flash",
  temperature: 0.7,
  maxRetries: 2,
})

const openrouter_llm = new ChatOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  model: "deepseek/deepseek-chat",
  temperature: 0,
  maxTokens: 2500
});

export const getModel = async (agentType) => {
  switch (agentType) {
    case 'chat': return groq_llm
    case 'search': return groq_llm
    case 'coding': return openrouter_llm
    case 'pdf': return groq_llm
    case 'ppt': return groq_llm
    case 'image': return groq_llm
    case 'imageAnalyzer': return gemini_llm
    default: return groq_llm // default to groq_llm if no agent type is specified
  }
}