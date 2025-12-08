import express from 'express'
import auth from '../middleware/middlewareAuth.js'
import { generateShareLink,getPublicFile,getActiveLinks,revokeLink,getAccessLogs} from '../controllers/ShareController.js'

const router = express.Router();

router.post("/generate",auth, generateShareLink);


//public view  so no authentication middleware
router.get("/view/:token", getPublicFile);


router.get("/active", auth, getActiveLinks);

//delete the public link
router.delete("/revoke/:linkId", auth, revokeLink);


router.get("/logs", auth, getAccessLogs);

export default router;