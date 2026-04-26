import{usersTable} from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import 'dotenv/config';
import db from '../config/db.js'
import { eq } from 'drizzle-orm';

export const ensureAuthenticated=function(req,res,next){
    if(!req.user){
        return res.status(400).json({error:`You need to be logged in first`});
    }
    next();
}

export const authenticatedMiddleware=async function(req,res,next){
    try{
        const token=req.headers['authorization'];
        
        if(!token){
            return res.status(401).json({error:`No token provided`});
        }
        
        // Extract token from "Bearer <token>" format
        const tokenParts = token.split(' ');
        if(tokenParts.length !== 2 || tokenParts[0] !== 'Bearer'){
            return res.status(401).json({error:`Invalid token format`});
        }
        
        const tokens = tokenParts[1];
        if(!process.env.JWT_SECRET){
            return res.status(500).json({error:`Server configuration error`});
        }
        
        const decoded = jwt.verify(tokens, process.env.JWT_SECRET);
        const user = await db.select().from(usersTable).where(eq(usersTable.userid, decoded.id));
        
        if(!user || user.length === 0){
            return res.status(401).json({error:`User not found`});
        }
        
        req.user = user[0];
        next();
    }catch(error){
        if(error.name === 'JsonWebTokenError'){
            return res.status(401).json({error:`Invalid token`});
        }
        if(error.name === 'TokenExpiredError'){
            return res.status(401).json({error:`Token expired`});
        }
        return res.status(500).json({error:error.message});
    }
}

export const isAdmin = function(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ error: "Access denied. Admin role required." });
    }
}