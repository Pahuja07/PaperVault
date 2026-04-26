import express from 'express';
import db from '../config/db.js'
import { eq, or, ilike } from 'drizzle-orm';
import {departmentsTable} from '../models/department.model.js'

export const getalldepart=async function(req,res){
    try {
        const departments = await db.select().from(departmentsTable);
        return res.status(200).json({ departments });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
export const getdeptbyid=async function(req,res){
    const id=req.params.id;
    const [table]=await db.select().from(departmentsTable).where(eq(departmentsTable.departmentid,id));
    if(!table){
        return res.status(400).json({message:`Department not found`});
    }
    return res.status(200).json({table});
}
export const postdept=async(req,res)=>{
    const {name,code,color}=req.body;
    if(!name || name==''){
        return res.status(400).json({error:`Name is required`});
    }
    if(!code || code==''){
        return res.status(400).json({error:`Code is required`});
    }
    if(!color || color==''){
        return res.status(400).json({error:`Color is required`});
    }
    const data=await db.insert(departmentsTable).values({
        name,
        code,
        color
    }).returning();
    return res.status(201).json({message:`Department created successfully`, data});
}
export const getdeptbynameorcode=async(req,res)=>{
    const name=req.query.name;
    const code=req.query.code;
    if(!name){
        return res.status(400).json({message:`Search query required`});
    }
    const depart=await db.select().from(departmentsTable).where(or(
        ilike(departmentsTable.name,`%${name}`),
        ilike(departmentsTable.code,`%${code}`)
));
    if(depart.length==0){
        return res.status(400).json({error:`department does not exists`});
    }
    return res.status(200).json(depart);
}
export const deletedeptbyid=async(req,res)=>{
    const id=req.params.id;
    const [data]=await db.select().from(departmentsTable).where(eq(departmentsTable.departmentid,id));
    if(!data){
        return res.status(404).json({error:`Department does not exist`});
    }
    const user=await db.delete(departmentsTable).where(eq(departmentsTable.departmentid,id));
    return res.status(200).json({message:`Department deleted from the table`});
}
