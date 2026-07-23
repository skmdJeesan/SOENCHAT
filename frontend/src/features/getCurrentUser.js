import api from "../utils/axios.js"

export const getCurrentUser = async () => {
  try {
    const res = await api.get('/api/me')
    // console.log(res.data)
    return res.data
  } catch (error) {
    console.log(error)
    return null
  }
}