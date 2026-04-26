import express from 'express'
const router=express.Router();
import {ensureAuthenticated,authenticatedMiddleware} from '../middlewares/user.middleware.js'
import {isAdmin} from '../middlewares/role.middleware.js'
import {getalldepart,getdeptbyid,postdept,getdeptbynameorcode,deletedeptbyid} from '../controllers/department.controller.js'
router.get('/',getalldepart);
router.get('/search',getdeptbynameorcode);
router.get('/:id',getdeptbyid);
router.post('/',authenticatedMiddleware,ensureAuthenticated,isAdmin,postdept);
router.delete('/:id',authenticatedMiddleware,ensureAuthenticated,isAdmin,deletedeptbyid);
export default router;