import { Router } from 'express'
import { deleteAllSketches } from '../controllers/sketch/delete-all-sketches'
import { deleteSingleSketch } from '../controllers/sketch/delete-single-sketch'
import { getAllSketches } from '../controllers/sketch/get-all-sketches'
import { getSignedUploadUrl } from '../controllers/sketch/get-signed-upload-url'
import { replyToSketch } from '../controllers/sketch/reply-to-sketch'
import { submitSketch } from '../controllers/sketch/submit-sketch'
import { toggleSketchVisibility } from '../controllers/sketch/toggle-sketch-visibility'
import { isAuthenticated } from '../middlewares/is-authenticated'
import { upload } from '../middlewares/multer'

const router = Router()

router.get('/signed-upload-url', getSignedUploadUrl)

router.post('/submit', upload.single('sketch'), submitSketch)

// Authenticated sketch routes

router.use(isAuthenticated)

router.get('/all', getAllSketches)

router.delete('/single-sketch/:sid', deleteSingleSketch)

router.delete('/all', deleteAllSketches)

router.put('/reply/:sid', replyToSketch)

router.put('/visibility/:sid', toggleSketchVisibility)

export { router as sketchRouter }
