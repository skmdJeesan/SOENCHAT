import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  conversations: [],
  selectedConversation: null
}

export const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload || []
    },
    addConversation: (state, action) => {
      if (state.conversations && Array.isArray(state.conversations)) {
        state.conversations.unshift(action.payload)
      }
    },
    removeConversation: (state, action) => {
      const conv_id = action.payload
      // we have to delete that conversation from state.conversation
      state.conversations = state.conversations.filter((conv) => conv._id !== conv_id)
    },
    setSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload
    },
    setConvTitle: (state, action) => {
      const {title, conversationId} = action.payload
      state.conversations = state.conversations.map((conv) => (
        conv._id == conversationId ? {...conv, title} : conv
      ))

      if(state.selectedConversation?._id == conversationId) 
        state.selectedConversation = {...state.selectedConversation, title}
    }
  },
})

// Action creators are generated for each case reducer function
export const { setConversations, addConversation, setSelectedConversation, setConvTitle, removeConversation} = conversationSlice.actions
export default conversationSlice.reducer