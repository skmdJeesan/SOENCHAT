import api from "../utils/axios.js"

export const deleteConversation = async (conversationId) => {
  try {
    const {data} = await api.delete(`/api/chat/delete-conversation/${conversationId}`)
    return data
  } catch (error) {
    console.log(error)
    return null
  }
}