import api from "../utils/axios.js"

const getMessages = async (conversationId) => {
  try {
    const {data} = await api.get(`/api/chat/get-messages/${conversationId}`)
    return data
  } catch (error) {
    console.log(error)
    return []
  }
}

export default getMessages