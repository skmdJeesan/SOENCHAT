import express from 'express'
import { createConversation, deleteConversation, getConversations, getMessages, saveMessage, updateTitleOfConversation } from '../controllers/chat.controller.js'

const router = express.Router()

router.get('/create-conversation', createConversation)
router.get('/get-conversations', getConversations)
router.put('/update-conversation-title/:conversationId', updateTitleOfConversation)
router.delete('/delete-conversation/:conversationId', deleteConversation)
router.post('/save-message', saveMessage)
router.get('/get-messages/:conversationId', getMessages)

export default router