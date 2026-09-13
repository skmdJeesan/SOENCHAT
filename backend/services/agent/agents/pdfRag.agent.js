import fs from 'fs'
import { PDFParse } from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { vectorDb } from '../config/vectorDb.js';
import { getModel } from '../config/llmModels.js';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { deductCredits } from '../utils/deductCredits.js';
import { checkAgentLimits } from '../config/agentLimit.js';

export const pdfRagAgent = async (state) => {
  try {
    await checkAgentLimits(state.userId, state.agent)

    const buffer = fs.readFileSync(state.file.path)
    const pdf = new PDFParse({ data: buffer })

    const result = await pdf.getText()
    const text = result.text

    // create chunks and insert them in docs & then store the docs in vector db(qdrant)
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 }) // chunks
    const docs = await splitter.createDocuments([text])
    const collectionName = `pdf-${Date.now()}`
    const store = await vectorDb(docs, collectionName)

    // similarity search
    const relevant_docs = await store.similaritySearch(state.prompt, 5)
    const context = relevant_docs.map(doc => doc.pageContent).join('\n\n')

    const system_prompt = `
      You are SOENCHAT's pdf assistant
      Rules:
        - Answer only from uploaded pdf.
        - Never make up information.
        - If the answer is not present in the pdf, reply: "T could not fin the answer in uploaded pdf!".
        - Use markdown formatting.
    `
    const human_prompt = `context: ${context}\nQuestion: ${state.prompt}`
    const messages = [
      new SystemMessage(system_prompt),
      new HumanMessage(human_prompt)
    ]

    const deduction = await deductCredits(state.userId, 'pdf')
    if (!deduction?.success) {
      return {
        ...state,
        aiResponse: 'Insufficient credits. Please upgrade your plan.',
        credits: state.credits || 0
      };
    }

    const llm = await getModel('pdf-rag')
    const response = await llm.invoke(messages)
    return { ...state, aiResponse: response.content, credits: deduction.credits }
  } catch (error) {
    console.log(error)
    return { ...state, aiResponse: error?.data?.message || 'Sorry, I am Failed to analyze the pdf!' }
  } finally { fs.unlinkSync(state.file.path) }
}