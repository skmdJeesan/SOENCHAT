import { QdrantVectorStore } from "@langchain/qdrant";
import { embeddings } from "./embeddings.js";
import dotenv from 'dotenv'
dotenv.config()

export const vectorDb = async (docs, collectionName) => {
  try {
    const vectorStore = await QdrantVectorStore.fromDocuments(docs, embeddings, {
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY, // add if needed
      collectionName
    });
    return vectorStore;
  } catch (error) {
    console.error('Qdrant error:', error);   // this will now show the full error
    throw error;   // ← let it bubble up so you can see it in the agent's response
  }
};