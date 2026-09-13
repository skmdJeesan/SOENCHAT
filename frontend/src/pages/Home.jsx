import { signInWithPopup } from 'firebase/auth'
import React from 'react'
import { auth, googleProvider } from '../utils/firebase.js'
import api from '../utils/axios.js'
import { FcGoogle } from "react-icons/fc";
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/userSlice.js';
import Sidebar from '../components/Sidebar.jsx';
import ChatArea from '../components/ChatArea.jsx';
import Artifact from '../components/Artifact.jsx';

const Home = () => {
  const {userData} = useSelector(state => state.user)
  const dispatch = useDispatch()

  const handleLogin = async (token) => {
    try {
      const res = await api.post('/api/auth/login', { token })
      dispatch(setUserData(res.data))
    } catch (error) {
      console.error('Login failed:', error.response?.data ?? error.message)
    }
  }

  const handleGoogleLogin = async () => {
    const data = await signInWithPopup(auth, googleProvider)
    const token = await data.user.getIdToken()
    // console.log(token)
    await handleLogin(token)
    // console.log(data)
  }

  return (
    <div className='w-full h-screen bg-zinc-900 flex text-white overflow-hidden'>

      {!userData && <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur">
        <div className="w-88 bg-[#13151c] border border-white/8 rounded-2xl p-7 flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-[20px] font-semibold text-slate-100 tracking-tight">
              Welcome to SOENCHAT 
              {/* <span className='text-slate-500 text-xs'>(#BosskiSOENCHAT)</span> */}
            </h2>
            <p className="text-base text-slate-500">Please login to continue.</p>
          </div>
          <button onClick={handleGoogleLogin}
            className='w-full flex items-center justify-center gap-3 py-2.5 rounded-xl text-sm text-black/90 bg-white hover:bg-white/80 active:scale-105 font-medium shadow-lg transition-all duration-150 cursor-pointer'>
            <FcGoogle size={16} />
            Continue With Google
          </button>
        </div>
      </div>}

      <Sidebar />
      <ChatArea />
      <Artifact />
      
    </div>
  )
}

export default Home