import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Crown, X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { createOrder } from '../features/createOrder.js'
import { verifyPayment } from '../features/verifyPayment.js'
import { updateUserPlan } from '../redux/userSlice.js'

const BillingDrawer = ({ open, close }) => {
  const { userData } = useSelector(state => state.user)
  const dispatch = useDispatch()
  const handleUpgrade = async (plan) => {
    try {
      const data = await createOrder(plan)
      console.log('order created: ', data)
      const planInfo = {
        id: plan,
        credits: data?.plan?.credits || 0,
        totalCredits: data?.plan?.totalCredits || 0
      }
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data?.order?.amount,
        currency: data?.order?.currency,
        name: 'SOENCHAT',
        descriptiom: `${data?.plan?.name} Plan`,
        order_id: data?.order?.id,
        handler: async (response) => {
          //console.log(response)
          try {
            const verified_data = await verifyPayment(response)
            console.log(verified_data)
            dispatch(updateUserPlan({
              plan: planInfo?.id,
              credits: userData.credits + planInfo?.credits,       // add to existing
              totalCredits: userData.totalCredits + planInfo?.totalCredits
            }))
            alert('Payment successful! Your plan has been upgraded.')
          } catch (error) {
            console.log(error)
          }
        },
        theme: { color: "#3399cc" }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3 }}
            className="fixed right-0 top-0 z-60 w-screen lg:w-[30vw] h-screen bg-zinc-900 border-l border-white/8 shadow-2xl flex flex-col"
          >
            <div className="px-6 py-2 flex items-center justify-between border-b border-white/10">
              <div className='flex flex-col'>
                <h2 className="text-white text-xl font-semibold">Billing</h2>
                <p className='text-slate-600 text-sm'>Plans & Credits</p>
              </div>
              <div onClick={close}
                className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-200 
                hover:bg-white/10 bg-white/5 transition-colors duration-150 border-none cursor-pointer">
                <X size={18} />
              </div>
            </div>
            <div className="p-5">
              <div className="rounded-xl bg-white/8 border border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-200 text-sm">Current Plan</p>
                    <h3 className="capitalize text-white font-bold text-xl">{userData?.plan || 'Freee'}</h3>
                  </div>
                  <Crown className='text-yellow-400' />
                </div>
                <div className="mt-5">
                  <div className="flex items-center justify-between text-sm text-slate-300 mb-2">
                    <h3 className="">Credits</h3>
                    <h2 className="">{userData.credits || 0}/{userData.totalCredits || 100}</h2>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-white/90 transition-all duration-500"
                      style={{ width: `${(userData?.credits / userData?.totalCredits) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className='px-5 overflow-auto space-y-4 mb-4'>
              <div className='rounded-xl border border-white/10 p-4'>
                <h3 className='text-white font-semibold'>Starter Plan</h3>
                <p className='text-white/90 text-2xl font-bold'>₹99</p>
                <p className='text-slate-400 text-sm'>500 Credits</p>
                <button onClick={() => handleUpgrade('starter')}
                  className='mt-4 w-full rounded-lg bg-white/90 hover:bg-white/70 py-2 text-black cursor-pointer'>
                  Upgrade
                </button>
              </div>
            </div>
            <div className='px-5  overflow-auto space-y-4'>
              <div className='rounded-xl border border-white/10 p-4'>
                <h3 className='text-white font-semibold'>Pro Plan</h3>
                <p className='text-white/90 text-2xl font-bold'>₹299</p>
                <p className='text-slate-400 text-sm'>1000 Credits</p>
                <button onClick={() => handleUpgrade('pro')}
                  className='mt-4 w-full rounded-lg bg-white/90 hover:bg-white/70 py-2 text-black cursor-pointer'>
                  Upgrade
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default BillingDrawer