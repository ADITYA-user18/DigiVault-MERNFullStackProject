import express from 'express'
import middlewareAuth from '../middleware/middlewareAuth.js'
import upload from '../services/multerService.js'
import { uploadFile, getMyFiles, deleteFile ,renameFile,getDashboardData} from '../controllers/fileController.js'



const router = express.Router()

router.post('/upload', middlewareAuth, upload.single("file"), uploadFile)

router.get('/getfiles', middlewareAuth, getMyFiles)

router.delete('/delete', middlewareAuth, deleteFile);

router.put('/rename',middlewareAuth,renameFile);


router.get('/dashboard',middlewareAuth,getDashboardData)






export default router;
