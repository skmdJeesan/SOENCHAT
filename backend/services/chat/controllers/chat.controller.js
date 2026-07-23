import Conversation from "../models/conversation.model.js"
import Message from "../models/message.model.js"

export const createConversation = async (req, res) => {
  try {
    const userId = req.headers['x-user-id']
    const conversation = await Conversation.create({ userId })
    return res.status(201).json(conversation)
  } catch (error) {
    return res.status(500).json({ message: `Error creating conversation: ${error}` })
  }
}

export const getConversations = async (req, res) => {
  try {
    const userId = req.headers['x-user-id']
    const conversations = await Conversation.find({ userId }).sort({ updatedAt: -1 })
    // conversation is the array of conversations for the user, sorted by updatedAt in descending order
    return res.status(200).json(conversations)
  } catch (error) {
    return res.status(500).json({ message: `Error fetching conversations: ${error}` })
  }
}

export const updateTitleOfConversation = async (req, res) => {
  try {
    const { title } = req.body
    const { conversationId } = req.params
    if (!conversationId || !title) {
      return res.status(400).json({ message: 'conversationId and title are required' })
    }
    const conversation = await Conversation.findByIdAndUpdate(conversationId, { title }, { new: true })
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' })
    }
    return res.status(200).json(conversation)
  } catch (error) {
    return res.status(500).json({ message: `Error updating conversation title: ${error}` })
  }
}

export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params
    if (!conversationId) {
      return res.status(400).json({ message: 'conversationId is required' })
    }
    const conversation = await Conversation.findByIdAndDelete(conversationId)
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' })
    }
    return res.status(200).json({message: `conversation deleted`})
  } catch (error) {
    return res.status(500).json({ message: `Error deleting conversation: ${error}` })
  }
}

export const saveMessage = async (req, res) => {
  try {
    const { conversationId, role, content, images, artifacts } = req.body
    if (!conversationId || !role || !content) {
      return res.status(400).json({ message: 'conversationId, role, and content are required' })
    }
    const message = await Message.create({ conversationId, role, content, images, artifacts})
    return res.status(201).json(message)
  } catch (error) {
    return res.status(500).json({ message: `Error saving message: ${error}` })
  }
}

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params
    if (!conversationId) {
      return res.status(400).json({ message: 'conversationId is required' })
    }
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 })
    return res.status(200).json(messages)
  } catch (error) {
    return res.status(500).json({ message: `Error fetching messages: ${error}` })
  }
}