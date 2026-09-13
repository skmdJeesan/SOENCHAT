import React from 'react'
import { useSelector } from 'react-redux'
import MessageBubble from './MessageBubble'
import AiLoadingAnimation1 from './AiLoadingAnimation1'
import AiLoadingAnimation2 from './AiLoadingAnimation2'
import { useRef } from 'react'
import { useEffect } from 'react'

const MessageList = () => {
  const { selectedConversation } = useSelector(state => state.conversation)
  const { messages } = useSelector(state => state.message)
  const { isAILoading } = useSelector((state) => state.message);
  const bottomRef = useRef(null)

  useEffect(() => {
    requestAnimationFrame(() => {
      bottomRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      })
    })
  }, [messages?.length, isAILoading])

  return (
    <div className='flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar'>
      {(messages.length === 0 || !selectedConversation)
        ? <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[30px] font-semibold text-slate-200 tracking-tight">SOENCHAT
            </h1>
            <p className="text-base text-slate-400 tracking-tight">How can I help you today?</p>
            <p className="text-sm text-slate-400 leading-relaxed max-w-75">Ask me anything - code, ideas, explanations or just a quick question.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {['Build a Netflix clone', 'Explain Redis', 'Build a Dashboard'].map((p, i) => (
              <div key={i}
                className="flex items-center justify-center px-3 py-1 rounded-lg text-slate-400 hover:text-slate-200 
                  hover:bg-white/10 bg-white/5 transition-colors duration-150 border-none cursor-pointer">
                {p}
              </div>
            )
            )}
          </div>
        </div>
        : <div className="space-y-2">
          {messages.map((msg, i) => (
            <div key={i} className="">
              <MessageBubble role={msg?.role} content={msg?.content} images={msg?.images || []} />
            </div>
          ))}

          {/* Bouncing dots type indicator */}
          {isAILoading && (
            <AiLoadingAnimation2 />
          )}
          
        </div>
      }
      <div ref={bottomRef}/>
    </div>
  )
}

export default MessageList