import { plans } from "../config/plans.js"
import razorpay from "../config/razorpay.js"
import Payment from "../models/payment.model.js"
import crypto from 'crypto'
import axios from 'axios'

export const createOrder = async (req, res) => {
  try {
    const {plan} = req.body
    const userId = req.headers['x-user-id']

    const selected_plan = plans[plan]
    if(!selected_plan) {
      return res.status(404).json({message: 'plan not found!'})
    }

    const order = await razorpay.orders.create({
      amount: selected_plan.amount,
      currency: 'INR',
      receipt: `reciept-${Date.now()}`
    })

    await Payment.create({
      userId, orderId: order.id, 
      amount: selected_plan.amount,
      currency: order.currency,
      credits: selected_plan.credits,
      plan: selected_plan.id,
      status: 'created', 
    })

    return res.status(200).json({order, plan: selected_plan})

  } catch (error) {
    return res.status(500).json({message: `created order error: ${error}`})
  }
}

export const verifyPayment = async (req, res) => {
  try {
    const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body
    
    // Check if all required fields are present
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({message: 'Missing required payment details'})
    }

    // Generate signature
    const generate_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')
    
    // Match generated signature with razorpay_signature
    if(generate_signature !== razorpay_signature) {
      return res.status(400).json({message: 'payment verification failed!'})
    }

    // Find payment
    const payment = await Payment.findOne({orderId: razorpay_order_id})
    if (!payment) {
      return res.status(404).json({message: 'Payment record not found!'})
    }

    // Check if already paid
    if (payment.status === 'paid') {
      return res.status(200).json({message: 'Payment already verified!'})
    }

    // Update payment
    payment.status = 'paid'
    payment.paymentId = razorpay_payment_id
    await payment.save()
    console.log('Payment updated successfully')

    // Update user plan - wrap in try-catch to prevent 500
    try {
      const userUpdateResponse = await axios.put(`${process.env.AUTH_SERVICE}/update-plan`, {
        userId: payment.userId, 
        credits: payment.credits, 
        plan: payment.plan
      })
    } catch (axiosError) {
      console.error('Failed to update user plan:', {
        message: axiosError.message,
        response: axiosError.response?.data,
        status: axiosError.response?.status
      })
      // Don't return error here - payment is already saved
    }

    return res.status(200).json({message: 'Payment verified successfully!'})

  } catch (error) {
    console.error('Verify Payment Error:', error)
    console.error('Error Stack:', error.stack)
    return res.status(500).json({
      message: `payment verification error: ${error.message}`,
      details: error.stack
    })
  }
}