import 'dotenv/config';
import express from 'express'
const router=express.Router();
import db from '../config/db.js'
import {eq,and} from 'drizzle-orm';
import{ usersTable} from '../models/user.model.js';
import {createHmac,randomBytes} from 'crypto';
import crypto from 'crypto';
import jwt from 'jsonwebtoken'
import { sendOtpEmail } from '../utils/email.js';
export const signup=async function(req,res){
const {name,email,password}=req.body;
const [existingUser]=await db.select().from(usersTable).where(eq(usersTable.email,email));
if(existingUser){
    return res.status(400).json({message:`User with this ${email} exist`});
}
const salt=randomBytes(16).toString('hex');
const hashedPassword=createHmac('sha256',salt).update(password).digest('hex');

const exisitingUser=await db.insert(usersTable).values({
    name,
    salt,
    password:hashedPassword,
    email
})
   
;
return res.status(200).json({message:`Created Succcessfully`});
};
export const login=async function(req,res){
    const {email,password}=req.body;
    const [existingUser]=await db.select().from(usersTable).where(eq(usersTable.email,email));
    if(!existingUser){
        return res.status(400).json({error:`User with this mail does not exist`});
    }
    const salt=existingUser.salt;
    const existingHash=existingUser.password;
    const newHash=createHmac('sha256',salt).update(password).digest('hex');
    if(existingHash!==newHash){
        return res.status(400).json({error:`Incorrect Password`});
    }

    const payload={
     
        id:existingUser.userid,
        name:existingUser.name,
        email:existingUser.email,
        role:existingUser.role,
        createdat:existingUser.createdat,
        updatedat:existingUser.updatedat
    };
    const token=jwt.sign(payload,process.env.JWT_SECRET);

    return res.status(200).json({message:'success',token, user: payload});

};
export const forgotpassword=async function(req,res){
    const {email}=req.body;
    const [existingUser]=await db.select().from (usersTable).where(eq(usersTable.email,email));
    if(!existingUser){
        return res.status(400).json({message: `Mail does not exist`});
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.update(usersTable).set({
        otp: otp,
        otpExpiry: otpExpiry,
    }).where(eq(usersTable.userid, existingUser.userid));

    const emailSent = await sendOtpEmail(email, otp);

    if (!emailSent) {
        return res.status(500).json({ message: 'Failed to send OTP email. Please ensure your EMAIL_PASSWORD is set in .env' });
    }

    res.json({
        message: 'OTP sent successfully to your email'
    });
};

export const verifyotp=async function(req,res){
    const {email, otp}=req.body;
    const [user]=await db.select().from(usersTable).where(eq(usersTable.email,email));
    
    if(!user || user.otp !== otp || new Date() > user.otpExpiry){
        return res.status(400).json({message: 'Invalid or expired OTP'});
    }

    // Generate a reset token that will be used for the final step
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await db.update(usersTable).set({
        resetToken: resetToken,
        resetTokenExpiry: resetTokenExpiry,
        otp: null, // Clear OTP
        otpExpiry: null
    }).where(eq(usersTable.userid, user.userid));

    res.json({
        message: 'OTP verified successfully',
        resetToken: resetToken
    });
};
export const resetpassword=async function(req,res){
    const {token, password}=req.body;
    const [existingUser]=await db.select().from(usersTable).where(eq(usersTable.resetToken,token));
    
    if(!existingUser){
        return res.status(400).json({message:`Token is invalid`});
    }
    
    // Check if token has expired
    if (existingUser.resetTokenExpiry && new Date() > existingUser.resetTokenExpiry) {
        return res.status(400).json({message: 'Token has expired'});
    }
    
    const newpassword=createHmac('sha256',existingUser.salt).update(password).digest('hex');

    await db.update(usersTable).set({
        password:newpassword,
        resetToken: null,
        resetTokenExpiry: null
    }).where(eq(usersTable.userid,existingUser.userid));
    
    return res.status(200).json({message:'Password reset successfully'});
};
