import {subjectsTable} from '../models/subject.model.js'
import {eq,or,ilike} from 'drizzle-orm'
import {departmentsTable} from '../models/department.model.js'
import db from '../config/db.js'
export const getallsubject=async function(req,res){
    try {
        const subjects = await db.select().from(subjectsTable);
        return res.status(200).json({ subjects });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
export const subjectbyid=async function(req,res){
    const id=req.params.id;
    const [table]=await db.select().from(subjectsTable).where(eq(subjectsTable.subjectid,id));
    if(!table){
        return res.status(400).json({error:`Subject does not exist`});
    }
    return res.status(200).json({table});
}
export const postsubject=async function(req,res){
  const{name,code,semester,departmentId}=req.body;
  
  if(!name || name == ''){
    return res.status(400).json({error:`Name is required`});
  }
  if(!code || code == ''){
    return res.status(400).json({error:`Code is required`});
  }
  if(!semester || semester == ''){
    return res.status(400).json({error:`Semester is required`});
  }
  if(!departmentId || departmentId == ''){
    return res.status(400).json({error:`Department ID is required`});
  }
  
 const sub=await db.select().from(departmentsTable).where(eq(departmentsTable.departmentid,departmentId));
 if(sub.length === 0){
    return res.status(400).json({message:`Department does not exist`});
 }
 
 const arr=await db.insert(subjectsTable).values({
    name,
    code,
    semester,
    departmentid:departmentId
 }).returning();
 
 return res.status(201).json({message:'Subject created successfully', data:arr});
}
export const deletesubj=async function(req,res){
    const {subid}=(req.params);
    const [exam]=await db.select().from(subjectsTable).where(eq(subjectsTable.subjectid,subid));
    if(!exam){
        return res.status(400).json({message:`Subject not found`});
       
    }
    await db.delete(subjectsTable).where(eq(subjectsTable.subjectid,subid));
    return res.status(200).json({message:`Subject deleted successfully`});
}
export const getallsubjbydept=async function(req,res){
    try{
        const id=req.params.id;
        const subjects=await db.select().from(subjectsTable).where(eq(subjectsTable.departmentid,id));

        if(!subjects || subjects.length==0){
            return res.status(404).json({message:'No subjects found'});
        }
        return res.status(200).json({subjects});

    }
    catch(err){
        return res.status(500).json({error:err.message});
    }
    // const id=req.params.id;
    // const subjects=await db.select().from(subjectsTable).where(eq(subjectsTable.departmentid,id));
    // if(!subjects || subjects.length === 0){
    //     return res.status(404).json({message:`No subjects found for this department`});
    // }
    // return res.status(200).json({subjects});
}