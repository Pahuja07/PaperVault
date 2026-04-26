import express from 'express'
import{signup,login,forgotpassword,verifyotp,resetpassword} from '../controllers/user.controller.js'
const router=express.Router();
router.post('/signup',signup)
router.post('/login',login)
router.post('/forgotpassword',forgotpassword)
router.post('/verify-otp',verifyotp)
router.post('/reset-password',resetpassword);

export default router;

