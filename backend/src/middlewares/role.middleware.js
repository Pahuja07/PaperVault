import {roleEnum}from '../models/user.model.js'
export const isAdmin= function(req,res,next){
    if(!req.user){
        return res.status(401).json({message:`User not authenticated`});
    }
    const role=req.user.role;
    if(role=='admin'){
        return next();
    }
    return res.status(403).json({message:`Only Admin can access this`});
}