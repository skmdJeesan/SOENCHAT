import React, { useEffect } from 'react'
import Nav from './Nav'
import MessageList from './MessageList'
import Chatinput from './Chatinput'
import { useDispatch, useSelector } from 'react-redux'
import getMessages from '../features/getMessages.js'
import { setArtifacts, setMessages } from '../redux/messageSlice.js'

const ChatArea = () => {
  const { selectedConversation } = useSelector(state => state.conversation)
  const dispatch = useDispatch()
  useEffect(() => {
    const handleGetMsgs = async () => {
      if(selectedConversation) {
        if(selectedConversation.title == 'New Conversation') dispatch(setMessages([]))
        const data = await getMessages(selectedConversation._id)
        dispatch(setMessages(data))
        const latestArtifactMessage = [...data].reverse().find(msg => msg.artifacts && msg.artifacts.length > 0)
        dispatch(setArtifacts(latestArtifactMessage?.artifacts || []))
      }
    }
    handleGetMsgs()
  }, [selectedConversation?._id])
  return (
    <div className='flex-1 h-screen overflow-hidden flex flex-col'>
      <Nav />
      <MessageList />
      <Chatinput />
    </div>
  )
}

export default ChatArea