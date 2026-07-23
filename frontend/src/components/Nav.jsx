import { MessageCircle } from 'lucide-react'
import React from 'react'
import { useSelector } from 'react-redux'

const Nav = () => {
  const { selectedConversation } = useSelector(state => state.conversation)
  const { messages } = useSelector(state => state.message)
  return (
    <>
      {selectedConversation && <div className='h-14 flex items-center justify-start gap-2.5 px-5 border-b border-white/8 ml-8 sm:ml-0'>
        <div className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-200 
            hover:bg-white/10 bg-white/5 transition-colors duration-150 border-none cursor-pointer">
          <MessageCircle size={18}/>
        </div>
        <div className="text-sm font-semibold text-slate-100 tracking-tight">
          {selectedConversation?.title || 'New Conversation'}
        </div>
        <div className="text-xs font-medium text-slate-500 bg-white/8 border border-white/10 px-2 py-0.5 rounded-full">
          {messages?.length} Messages
        </div>
      </div>}
    </>
  )
}

export default Nav