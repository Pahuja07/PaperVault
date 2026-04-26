import express from 'express'
import cors from 'cors'
const app=express();
const PORT=process.env.PORT || 8000;
import userRouter from './routes/user.routes.js'
import departmentrouter from './routes/department.routes.js'
import subjectrouter from './routes/subject.routes.js'
import paperrouter from './routes/paper.routes.js'
import airouter from './routes/ai.routes.js'
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));
app.use('/user',userRouter);
app.use('/department',departmentrouter);
app.use('/subject',subjectrouter);
app.use('/papers',paperrouter);
app.use('/ai',airouter);

app.use(express.urlencoded({extended:true}));

app.listen(PORT,()=>{
    console.log('server is listening on port:8000');

});

