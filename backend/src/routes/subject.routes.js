import express from 'express'
const router=express.Router();
import{isAdmin} from '../middlewares/role.middleware.js'
import {authenticatedMiddleware,ensureAuthenticated} from '../middlewares/user.middleware.js'
import {getallsubject,subjectbyid,deletesubj,getallsubjbydept,postsubject} from '../controllers/subject.controller.js'
router.get('/',getallsubject);
router.get('/:id',subjectbyid);
router.post('/',authenticatedMiddleware,ensureAuthenticated,isAdmin,postsubject);
router.delete('/del/:subid',authenticatedMiddleware,ensureAuthenticated,isAdmin,deletesubj);
router.get('/dep/:id',getallsubjbydept);
export default router;