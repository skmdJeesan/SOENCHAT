import api from "../utils/axios.js"

export const updateTitleOfConversation = async ({conversationId, title}) => {
  try {
    const {data} = await api.put(`/api/chat/update-conversation-title/${conversationId}`, {title})
    return data
  } catch (error) {
    console.log(error)
    return null
  }
}