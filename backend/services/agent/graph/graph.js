import { StateGraph } from "@langchain/langgraph";
import { agentState } from "./state.js";
import { router as routeNode } from "./router.js";
import { chatAgent } from "../agents/chat.agent.js";
import { searchAgent } from "../agents/search.agent.js";
import { pdfAgent } from "../agents/pdf.agent.js";
import { pptAgent } from "../agents/ppt.agent.js";
import { imageAgent } from "../agents/image.agent.js";
import { codingAgent } from "../agents/coding.agent.js";
import { pdfRagAgent } from "../agents/pdfRag.agent.js";
import { imageAnalyzerAgent } from "../agents/imageAnalyzer.agent.js";

const workflow = new StateGraph(agentState)

// Define the nodes in the workflow
workflow.addNode('router', routeNode)
workflow.addNode('chat', chatAgent)
workflow.addNode('search', searchAgent)
workflow.addNode('coding', codingAgent)
workflow.addNode('pdf', pdfAgent)
workflow.addNode('ppt', pptAgent)
workflow.addNode('image', imageAgent)
workflow.addNode('pdfRag', pdfRagAgent)
workflow.addNode('imageAnalyzer', imageAnalyzerAgent)

// Define the edges between nodes
workflow.addEdge('__start__', 'router')
workflow.addConditionalEdges('router', (state) => {
  switch (state.agent) {
    case 'chat': return 'chat'
    case 'search': return 'search'
    case 'coding': return 'coding'
    case 'pdf': return 'pdf'
    case 'ppt': return 'ppt'
    case 'image': return 'image'
    case 'pdfRag': return 'pdfRag'
    case 'imageAnalyzer': return 'imageAnalyzer'
    default: return 'chat' // default to chat if no agent is specified
  }
}, {chat: 'chat', search: 'search', coding: 'coding', pdf: 'pdf', ppt: 'ppt', image: 'image', pdfRag: 'pdfRag', imageAnalyzer: 'imageAnalyzer'}) // path mapping for conditional edges
workflow.addEdge('search', 'chat') // after search, go to chat
workflow.addEdge('chat', '__end__')
workflow.addEdge('coding', '__end__')
workflow.addEdge('pdf', '__end__')
workflow.addEdge('ppt', '__end__')
workflow.addEdge('image', '__end__')
workflow.addEdge('pdfRag', '__end__')
workflow.addEdge('imageAnalyzer', '__end__')

export const graph = workflow.compile()