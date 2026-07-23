import { Globe, LucideSendHorizonal, Mic, Paperclip, Send } from 'lucide-react'
import React, { useState } from 'react'
import sendMessage from '../features/sendMessage.js'
import getMessages from '../features/getMessages.js'
import { useDispatch, useSelector } from 'react-redux'
import { addMessage, setArtifacts, setIsAILoading, setMessages } from '../redux/messageSlice.js'
import { createConversation } from '../features/createConversation.js'
import { addConversation, setConvTitle, setSelectedConversation } from '../redux/conversationSlice.js'
import { updateTitleOfConversation } from '../features/updateTitleOfConversation.js'
import { Zap, MessageCircle, Code2, Search, FileText, Presentation, Image } from "lucide-react";
import { updateCredits } from '../redux/userSlice.js'
import { useRef } from 'react'
import FilePreview from './FilePreview.jsx'
import { useEffect } from 'react'

const agents = [
  { id: "auto", icon: Zap, label: "Auto" },
  { id: "chat", icon: MessageCircle, label: "Chat" },
  { id: "coding", icon: Code2, label: "Coding" },
  { id: "search", icon: Globe, label: "Web Search" },
  { id: "pdf", icon: FileText, label: "PDF" },
  { id: "ppt", icon: Presentation, label: "PPT" },
  { id: "image", icon: Image, label: "Image" },
];

const Chatinput = () => {
  const [value, setValue] = useState('')
  const [selectedAgent, setSelectedAgent] = useState('auto')
  const { selectedConversation } = useSelector(state => state.conversation)
  const dispatch = useDispatch()
  const { isAILoading } = useSelector((state) => state.message);
  const [selectedFile, setSelectedFile] = useState(null)
  const fileRef = useRef(null)
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);  // to hold the SpeechRecognition instance
  const finalTranscriptRef = useRef('');
  const textareaRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript + ' ';
        } else {
          interim += transcript;
        }
      }
      setValue((finalTranscriptRef.current + interim).trim());
    };

    recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setTimeout(() => textareaRef.current?.focus(), 0);
    };

    recognitionRef.current = recognition;

    return () => { recognition.stop(); };
  }, []);

  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      setTimeout(() => textareaRef.current?.focus(), 0);
    } else {
      finalTranscriptRef.current = '';
      recognition.start();
      setIsListening(true);
    }
  };

  const handleSendMsg = async () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    if (value.trim().length === 0) return;
    const prompt = value.trim();
    let conversation = selectedConversation;

    if (!conversation) {
      // Create conversation
      const conv = await createConversation();
      dispatch(setSelectedConversation(conv));
      dispatch(addConversation(conv));
      conversation = conv;
    }

    if (conversation.title === 'New Conversation') {
      // Update title of conversation
      await updateTitleOfConversation({
        conversationId: conversation._id,
        title: prompt.slice(0, 30)
      });
      dispatch(setConvTitle({
        title: prompt.slice(0, 30),
        conversationId: conversation._id
      }));
    }

    // 1. Add user message to UI immediately
    dispatch(addMessage({ role: 'user', content: prompt }));
    setValue('');
    if (textareaRef.current) textareaRef.current.focus();

    // 2. Turn on Loading
    dispatch(setIsAILoading(true));

    try {
      // const payload = { prompt, conversationId: conversation._id, agent: selectedAgent };
      const formdata = new FormData()
      formdata.append('prompt', prompt)
      formdata.append('conversationId', conversation._id)
      formdata.append('agent', selectedAgent)
      if (selectedFile) formdata.append('file', selectedFile)

      // 3. Make the API call
      const data = await sendMessage(formdata);
      setSelectedFile(null)
      // console.log(data)
      if (!data) return;

      // 4a. Update credits
      if (data.credits !== undefined) dispatch(updateCredits(data.credits));
      // 4b. Add the AI's response to the UI
      dispatch(addMessage({ role: 'assistant', content: data?.response, images: data?.images }));
      // 4c. Set artifacts 
      dispatch(setArtifacts(data?.artifacts || []))

      const messages = await getMessages(conversation._id);
      dispatch(setMessages(messages));

    } catch (error) {
      // Optional: Handle any errors (e.g., show a toast notification to the user)
      console.error("Failed to fetch AI response:", error);

    } finally {
      // 5. Turn off loading (Runs whether the try block succeeds or fails)
      dispatch(setIsAILoading(false));
    }
  };

  return (
    <div className='w-full overflow-hidden px-3 md:px-5 py-4 border-t border-white/8'>
      <div className='flex flex-col gap-2 bg-white/6 border border-white/8 rounded-2xl px-4 pt-3.5 pb-3'>
        <div className="w-[90%] md:w-[80%] flex flex-wrap gap-2 mb-0.5">
          {agents.map((agent, i) => {
            const isActive = (selectedAgent === agent.id)
            const Icon = agent.icon
            return (
              <div key={i} onClick={() => setSelectedAgent(agent.id)}
                className={`shrink-0 inline-flex items-cener gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-all cursor-pointer ${isActive ? 'bg-white/90 text-black' : 'bg-white/8'}`}>
                <Icon size={14} />
                <p className="">{agent.label}</p>
              </div>
            )
          })}
        </div>
        <FilePreview selectedFile={selectedFile} onRemove={() => setSelectedFile(null)} />
        <textarea ref={textareaRef}
          value={value} onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            // Send on Enter (without Shift)
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();        // stop new line
              handleSendMsg();
            }
          }}
          placeholder='Ask Anything....'
          className="w-full bg-zinc-800 outline-none resize-none text-[14px] text-slate-200 placeholder:text-slate-600 
          leading-relaxed [scrollbar-width: none] [&::-webkit-scrollbar]:hidden disabled:opacity-50"
          rows={3}
        />
        <div className='flex items-center justify-between'>
          <div className="flex items-center gap-1.5">
            <input
              type='file' accept='.pdf/image/*'
              hidden ref={fileRef}
              onChange={(e) => setSelectedFile(e.target.files[0] || null)}
            />
            <button onClick={() => fileRef.current.click()}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-200 
              hover:bg-white/10 bg-white/5 transition-colors duration-150 border-none cursor-pointer">
              <Paperclip size={18} />
            </button>
            <button onClick={toggleListening}
              className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors duration-150 border-none cursor-pointer
              ${isListening ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse' : 'text-slate-400 hover:text-slate-200 hover:bg-white/10 bg-white/5'}`}
            >
              <Mic size={18} />
            </button>
          </div>
          <button onClick={handleSendMsg}
            disabled={value.trim().length == 0 && isAILoading}
            className={`flex items-center justify-center w-7 h-7 rounded-lg text-slate-200 hover:text-slate-50 transition-colors duration-150 border-none 
            ${value.trim().length == 0 ? 'cursor-not-allowed hover:bg-white/10 bg-white/5' : 'cursor-pointer hover:bg-blue-500/90 bg-blue-500'}`}>
            <LucideSendHorizonal size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Chatinput