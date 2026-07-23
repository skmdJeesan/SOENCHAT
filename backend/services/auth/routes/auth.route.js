import express from 'express'
import { deductCredits, login, logOut, userPaymentUpdate } from '../controllers/auth.controller.js'

const router = express.Router()

router.post('/login', login)
router.get('/logout', logOut)
router.put('/update-plan', userPaymentUpdate)
router.put('/deduct-credits', deductCredits)

export default router