import express from 'express';
const router=express.Router();
import {authenticatedMiddleware,ensureAuthenticated} from '../middlewares/user.middleware.js'
import{isAdmin} from '../middlewares/role.middleware.js'
import{ upload} from '../middlewares/upload.middleware.js'

import {getsubjectbyid,getallpapers,getall,postpaper,deletepaper,downloadpaper} from '../controllers/paper.controller.js'
router.get('/all',getall);
router.get('/:id',getsubjectbyid);
router.get('/',getallpapers);
router.get('/:id/download',downloadpaper);
router.post('/upload',authenticatedMiddleware,ensureAuthenticated,isAdmin,upload.single('file'),postpaper);
router.delete('/:id',authenticatedMiddleware,ensureAuthenticated,isAdmin,deletepaper);
export default router;
