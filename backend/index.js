import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const app=express();
const PORT=process.env.PORT || 8000;
import userRouter from './src/routes/user.routes.js'
import departmentrouter from './src/routes/department.routes.js'
import subjectrouter from './src/routes/subject.routes.js'
import paperrouter from './src/routes/paper.routes.js'
import aiRouter from './src/routes/ai.routes.js'
import devRouter from './src/routes/dev.routes.js'
import errorHandler from './src/middlewares/errorHandler.js'

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));
app.use('/dev-uploads', express.static('dev-uploads'));
app.use('/user',userRouter);
app.use('/department',departmentrouter);
app.use('/subject',subjectrouter);
app.use('/papers',paperrouter);
app.use('/ai', aiRouter);
app.use('/dev', devRouter);

app.use(express.urlencoded({extended:true}));

// Error handling middleware
app.use(errorHandler);

app.listen(PORT,()=>{
    console.log(`server is listening on port:${PORT}`);
});

