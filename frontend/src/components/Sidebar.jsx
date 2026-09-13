import React, { useEffect, useState } from 'react'
import { Coins, EllipsisVertical, LogOut, Menu, MessageCircle, PanelLeftIcon, PanelRight, PenBoxIcon, Pencil, PenSquare, Plus, Trash, User, UserPen, X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { getConversations } from '../features/getConversations.js'
import { setConversations, addConversation, setSelectedConversation, setConvTitle, removeConversation } from '../redux/conversationSlice.js'
import { createConversation } from '../features/createConversation.js'
import { setUserData } from '../redux/userSlice.js'
import { logOut } from '../features/logOut.js'
import BillingDrawer from './BillingDrawer.jsx'
import { useRef } from 'react'
import { updateTitleOfConversation } from '../features/updateTitleOfConversation.js'
import { deleteConversation } from '../features/deleteConversation.js'

const Sidebar = () => {
  const [collapse, setCollapse] = useState(false) // sidebar colapsed state
  const [imageError, setImageError] = useState(false)
  const dispatch = useDispatch()
  const { conversations, selectedConversation } = useSelector(state => state.conversation)
  const { userData } = useSelector(state => state.user)
  const [showBilling, setShowBilling] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingId, setEditingId] = useState(null); // convo._id being edited
  const [editTitle, setEditTitle] = useState(''); // draft title text
  const inputRef = useRef(null) // to focus the input

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveTitle = async (id) => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== conversations.find(c => c._id === id)?.title) {
      try {
        await updateTitleOfConversation({ conversationId: id, title: trimmed });
        dispatch(setConvTitle({ conversationId: id, title: trimmed }));
      } catch (err) {
        console.error(err);
      }
    }
    setEditingId(null);
    setEditTitle('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleRename = async (conv) => {
    setOpenMenuId(null);
    setEditingId(conv._id);
    setEditTitle(conv.title || 'New Conversation');
  };

  const handleDelete = async (id) => {
    // if (!window.confirm('Delete this conversation?')) return;
    try {
      await deleteConversation(id);
      dispatch(removeConversation(id))
    } catch (err) {
      console.error(err);
    }
    setOpenMenuId(null);
  };

  useEffect(() => {
    const handleGetConv = async () => {
      const data = await getConversations()
      dispatch(setConversations(data))
    }
    handleGetConv()
  }, [userData?._id])

  const handleLogOut = async () => {
    await logOut()
    dispatch(setUserData(null))
  }

  if (collapse) {
    return (
      <div className="hidden lg:flex flex-col items-center w-14 h-screen bg-zinc-900 border-r border-white/8 py-4 gap-2 shrink-0">
        <button onClick={() => setCollapse(false)}
          className='flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-200 
            hover:bg-white/10 bg-white/5 transition-colors duration-150 border-none cursor-e-resize'>
          <PanelRight size={18} />
        </button>
        <button onClick={() => dispatch(setSelectedConversation(null))}
          className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-200 
            hover:bg-white/10 bg-white/5 transition-colors duration-150 border-none cursor-pointer">
          <Plus size={18} />
        </button>
        <div className="pt-5 flex-1 overflow-y-auto px-3 pb-2 [scrollbar-width: none] [&::webkit-scrollbar]:hidden">
          {conversations.map((conv, i) => {
            const isSelected = selectedConversation?._id === conv?._id
            return (
              <div onClick={() => dispatch(setSelectedConversation(conv))} key={i}
                className={`flex items-center gap-2 cursor-pointer mb-0.5 px-3 py-2 rounded-lg transition-colors duration-150 hover:bg-white/10 
                ${isSelected ? 'bg-white/8 backdrop-blur-sm' : 'bg-transparent text-slate-500'}`}>
                <MessageCircle size={18} />
              </div>
            )
          })}
        </div>
        <div className="h-px mx-2 bg-white/8"></div>
        <div className="relative shrink-0">
          {(userData?.avatar && !imageError)
            ? <img onError={() => setImageError(true)}
              className="w-9 h-9 rounded-xl object-cover border-2 border-white/8"
              src={userData.avatar} alt="image"
            />
            : <div className="w-9 h-9 rounded-xl border-2 border-white/8 flex items-center justify-center">
              <User size={16} className='text-slate-500' />
            </div>
          }
        </div>
      </div>
    )
  }

  return (
    <>
      <button onClick={() => setSidebarOpen(true)}
        className='lg:hidden fixed top-3.5 left-4 z-50 flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-200 
        hover:bg-white/10 bg-white/5 transition-colors duration-150 border-none cursor-pointer'>
        <Menu size={14} />
      </button>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className='lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm' />}

      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-70 h-screen shrink-0 bg-zinc-900 border-r border-white/8 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">

          {/* 1. */}
          <div className="flex items-center justify-center gap-2.5 px-2 border-b border-white/8 h-14">
            <span className="ml-2 text-[20px] font-semibold text-slate-100 tracking-tight flex-1">
              SOENCHAT
              {/* <span className="text-[10px] ml-2 font-medium tracking-wide border border-white/40 px-2 py-0.5 rounded-full">free</span> */}
            </span>

            <button onClick={() => dispatch(setSelectedConversation(null))}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-200 
              hover:bg-white/10 bg-white/5 transition-colors duration-150 border-none cursor-pointer">
              <Plus size={18} />
            </button>
            <div onClick={() => setCollapse(true)}
              className='hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-200 
              hover:bg-white/10 bg-white/5 transition-colors duration-150 border-none cursor-e-resize'>
              <PanelLeftIcon size={18} />
            </div>
            <div onClick={() => setSidebarOpen(false)}
              className='flex lg:hidden items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-200 
              hover:bg-white/10 bg-white/5 transition-colors duration-150 border-none cursor-e-resize'>
              <X size={18} />
            </div>
          </div>

          {/* 2. */}
          <div className="px-4 pt-4 pb-1">
            <button onClick={() => dispatch(setSelectedConversation(null))}
              className="w-full flex items-center justify-center gap-2 text-sm font-medium text-black bg-slate-100 
              rounded-xl py-2 border-none cursor-pointer hover:opacity-90 transition-opacity duration-150">
              <Plus size={18} /> New Chat
            </button>
          </div>

          {/* 3. */}
          {conversations.length == 0
            ? <div className="px-5 pt-4 pb-1.5 text-[12px] font-semibold tracking-wider text-slate-500">No Recent Conversations</div>
            : <div className="px-5 pt-4 pb-1.5 text-[12px] font-semibold tracking-wider text-slate-500">Recents</div>
          }
          <div className="flex-1 overflow-y-auto px-3 pb-2 no-scrollbar">
            {conversations.map((conv, i) => {
              const isSelected = selectedConversation?._id === conv?._id
              return (
                <div
                  onClick={() => { dispatch(setSelectedConversation(conv)); setSidebarOpen(false) }} key={i}
                  className={`flex items-center justify-between cursor-pointer mb-0.5 px-2 py-2 rounded-lg transition-colors duration-150 hover:bg-white/5 relative
                  ${isSelected ? 'bg-white/8 backdrop-blur-sm' : 'bg-transparent text-slate-500'}`}>
                  {editingId === conv._id ? (
                    // Editable input
                    <input ref={inputRef}
                      value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveTitle(conv._id);
                        if (e.key === 'Escape') cancelEditing();
                      }}
                      onClick={(e) => e.stopPropagation()} // prevent row selection
                      className="bg-transparent border-b border-slate-500 outline-none text-slate-200 w-full text-sm"
                      autoFocus
                    />
                  ) : (
                    <span>{conv?.title || 'New Conversation'}</span>
                  )}
                  <div onClick={(e) => {
                    e.stopPropagation(); // prevent row selection
                    setOpenMenuId(openMenuId === conv._id ? null : conv._id);
                  }}
                    className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors duration-150 border-none cursor-pointer">
                    <EllipsisVertical size={14} />
                  </div>
                  {openMenuId === conv._id && (
                    <div ref={menuRef} onClick={(e) => e.stopPropagation()} // prevent clicks inside menu from selecting the conversation
                      className="absolute -right-2 top-full mt-1 w-32 bg-zinc-800 rounded-lg shadow-lg z-999 py-1"
                    >
                      <button onClick={() => handleRename(conv)}
                        className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-blue-400/10 transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <UserPen size={14} /> Rename
                      </button>
                      <button onClick={() => handleDelete(conv._id)}
                        className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-red-400/10 transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <Trash size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="h-px mx-2 bg-white/8"></div>

          {/* 4. */}
          <div className="p-3.5">
            {userData
              ? <div className="flex items-center gap-2.5 cursor-pointer rounded-xl px-3 py-2 hover:bg-white/8
                  transition-colors duration-150">
                <div className="relative shrink-0">
                  {(userData?.avatar && !imageError)
                    ? <img onError={() => setImageError(true)}
                      className="w-9 h-9 rounded-xl object-cover border-2 border-white/8"
                      src={userData.avatar} alt="image"
                    />
                    : <div className="w-9 h-9 rounded-xl border-2 border-white/8 flex items-center justify-center">
                      <User size={16} className='text-slate-500' />
                    </div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-100 truncate">{userData?.name || 'User'}</p>
                  <p className="mt-px text-slate-500 text-xs">{userData?.plan}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowBilling(true)}
                    className="cursor-pointer hover:text-yellow-600 transition-colors duration-150">
                    <Coins size={18} />
                  </button>
                  <button onClick={handleLogOut}
                    className="cursor-pointer hover:text-red-600 transition-colors duration-150">
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
              : <button className="">Login</button>
            }
          </div>
        </div>

      </div>
      <BillingDrawer open={showBilling} close={() => setShowBilling(false)} />
    </>
  )
}

export default Sidebar