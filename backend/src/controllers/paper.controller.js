import {papersTable} from '../models/paper.model.js'
import {subjectsTable} from '../models/subject.model.js'
import db from '../config/db.js'
import {eq,and,ilike} from 'drizzle-orm';
import { BlobServiceClient } from '@azure/storage-blob';
import OpenAI from 'openai';

import{departmentsTable} from '../models/department.model.js'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const getallpapers=async function(req,res){
    const papers=await db.select().from(papersTable);
    return res.status(200).json({papers});
};
export const getsubjectbyid= async function(req,res){
    const id=req.params.id;
    const paper=await db.select().from(papersTable).where(eq(papersTable.paperid,id));
    if(!paper){
        return res.status(404).json({message:'Paper not found'});
    }
    return res.status(200).json({message:`Paper`,paper});
}
export const getall=async function(req,res){
  
    let title = req.query.title;
    let semester = req.query.semester;
    let examType = req.query.examtype || req.query.examType;
    let difficulty = req.query.difficulty;
    let departmentid = req.query.departmentid;
    let subjectid = req.query.subjectid;
    let year = req.query.year;
    
    const condition = [];
    if (title) {
        condition.push(ilike(papersTable.title, `%${title}%`));
    }
    if (semester) {
        condition.push(eq(papersTable.semester, parseInt(semester)));
    }
    if (year) {
        condition.push(eq(papersTable.year, parseInt(year)));
    }
    if (examType) {
        condition.push(eq(papersTable.examtype, examType));
    }
    if (departmentid) {
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(departmentid);
        if (!isUuid) {
            const deptRows = await db.select().from(departmentsTable).where(ilike(departmentsTable.code, departmentid));
            if (deptRows && deptRows.length > 0) {
                departmentid = deptRows[0].departmentid;
            } else {
                // If department code not found, force a zero match
                departmentid = '00000000-0000-0000-0000-000000000000';
            }
        }
        condition.push(eq(papersTable.departmentid, departmentid)); 
    }
    if(subjectid){
        condition.push(eq(papersTable.subjectid,subjectid));
    }
    if(difficulty){
        condition.push(eq(papersTable.difficulty,difficulty));
    }
    
    const papers = await db.select().from(papersTable)
      .where(condition.length > 0 ? and(...condition) : undefined); 

    let importantTopics = null;
    if (papers.length > 0) {
        try {
            const paperTitles = papers.map(p => p.title).join(', ');
            const prompt = `Based on these exam paper titles: ${paperTitles}. What are the most important topics to study? Provide a concise list of 3-5 important topics.`;
            const response = await openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 150
            });
            importantTopics = response.choices[0].message.content;
        } catch (err) {
            console.error('AI Analysis error:', err);
        }
    }

    return res.status(200).json({ papers, aiAnalysis: importantTopics });
}
export const postpaper=async function(req,res){
    try {
        console.log('content-type:', req.headers['content-type']);
        console.log('req.file:', req.file);
        console.log('req.body:', req.body);
    
        let { title, semester, examtype, difficulty, year, departmentid, subjectName, subjectCode } = req.body;
        let { subjectid } = req.body;
        const file = req.file;
        const uploadedby = req.user?.userid;
    
        if (!file) return res.status(400).json({ message: 'File required' });
    
        if (!title) return res.status(400).json({ error: 'Title is required' });
        if (!semester) return res.status(400).json({ error: 'semester is required' });
        if (isNaN(semester)) return res.status(400).json({ error: 'It should be a number' });
    
        // Upload to Azure Blob Storage
        let fileUrl;
        try {
            const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
            if (!connectionString) throw new Error('Azure Storage connection string missing');
            const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
            const containerClient = blobServiceClient.getContainerClient('papers');
            await containerClient.createIfNotExists({ access: 'blob' });
            
            const blockBlobClient = containerClient.getBlockBlobClient(`${Date.now()}-${file.originalname}`);
            await blockBlobClient.uploadData(file.buffer);
            fileUrl = blockBlobClient.url;
        } catch (uploadError) {
            console.error('File upload error:', uploadError);
            return res.status(500).json({ error: 'Failed to upload file to Azure Storage' });
        }
    
        // Handle department lookup (it might be a code like 'cse' or a UUID)
        let user;
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(departmentid);
        if (isUuid) {
            user = await db.select().from(departmentsTable).where(eq(departmentsTable.departmentid, departmentid));
        } else {
            user = await db.select().from(departmentsTable).where(ilike(departmentsTable.code, departmentid));
            if (user && user.length > 0) departmentid = user[0].departmentid;
        }
        if (!user || user.length === 0) return res.status(404).json({ error: 'depT ID does not exist' });
    
        // If subjectid is missing, try to auto-generate using AI from the title
        if (!subjectid) {
            if (!subjectName || !subjectCode) {
                try {
                    const prompt = `Extract the likely subject code and subject name from this exam paper title: "${title}". Respond ONLY with a JSON object like {"subjectCode": "CS101", "subjectName": "Computer Science"}. If no code is visible, invent a short one like "GEN101".`;
                    const aiResponse = await openai.chat.completions.create({
                        model: 'gpt-3.5-turbo',
                        messages: [{ role: 'user', content: prompt }],
                        response_format: { type: 'json_object' }
                    });
                    const extracted = JSON.parse(aiResponse.choices[0].message.content);
                    subjectCode = extracted.subjectCode;
                    subjectName = extracted.subjectName;
                } catch (err) {
                    console.error('AI Subject Extraction error:', err);
                    subjectCode = 'UNKNOWN101';
                    subjectName = title.substring(0, 50);
                }
            }

            let existingSubject = await db.select().from(subjectsTable).where(
                and(eq(subjectsTable.code, subjectCode), eq(subjectsTable.departmentid, departmentid))
            ).limit(1);
            
            if (existingSubject.length > 0) {
                subjectid = existingSubject[0].subjectid;
            } else {
                const newSubject = await db.insert(subjectsTable).values({
                    name: subjectName,
                    code: subjectCode,
                    semester: parseInt(semester),
                    departmentid: departmentid
                }).returning();
                subjectid = newSubject[0].subjectid;
            }
        }
    
        const inserted = await db.insert(papersTable).values({
          title, semester, examtype, difficulty, year, fileUrl, subjectid, departmentid, uploadedby
        }).returning({
          paperid: papersTable.paperid,
          title: papersTable.title
        });
    
        return res.status(201).json({ message: 'Paper Uploaded', inserted });
      } catch (err) {
        console.error('Upload error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
    
};
export const downloadpaper=async function(req,res){
    try {
        const id=req.params.id;
        const paper=await db.select().from(papersTable).where(eq(papersTable.paperid,id)).limit(1);
        
        if(!paper || paper.length===0){
            return res.status(404).json({message:'Paper not found'});
        }
        
        const fileUrl=paper[0].fileUrl;
        
        // Redirect to OneDrive download URL
        // OneDrive URLs are already shareable, so we can redirect directly
        return res.redirect(301, fileUrl);
        
    } catch (error) {
        console.error('Download error:', error);
        return res.status(500).json({ error: 'Failed to download paper' });
    }
};

export const deletepaper = async function(req, res) {
    try {
        const id = req.params.id;
        const data = await db.select().from(papersTable).where(eq(papersTable.paperid, id));
        if (!data || data.length === 0) {
            return res.status(404).json({ message: `Paper not found` });
        }
        
        const fileUrl = data[0].fileUrl;
        
        // Extract blob name from URL
        // URL format: https://<account>.blob.core.windows.net/<container>/<blobname>
        if (fileUrl && fileUrl.includes('blob.core.windows.net')) {
            try {
                const urlObj = new URL(fileUrl);
                const pathParts = urlObj.pathname.split('/');
                // pathParts usually ['', 'papers', 'blobname...']
                const containerName = pathParts[1];
                const blobName = pathParts.slice(2).join('/');
                
                const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
                if (connectionString && containerName && blobName) {
                    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
                    const containerClient = blobServiceClient.getContainerClient(containerName);
                    const blockBlobClient = containerClient.getBlockBlobClient(decodeURIComponent(blobName));
                    await blockBlobClient.deleteIfExists();
                }
            } catch (azureErr) {
                console.error('Failed to delete blob from Azure:', azureErr);
                // Continue with database deletion even if Azure deletion fails
            }
        }
        
        await db.delete(papersTable).where(eq(papersTable.paperid, id));
        return res.status(200).json({ message: `Paper deleted successfully` });
    } catch (error) {
        console.error('Delete paper error:', error);
        return res.status(500).json({ error: 'Failed to delete paper' });
    }
}
