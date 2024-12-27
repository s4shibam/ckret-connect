import { Router } from 'express'
import {
  deleteAllSketches,
  deleteSingleSketch,
  getAllSketches,
  replyToSketch,
  submitSketch,
  toggleSketchVisibility
} from '../controllers/sketch'
import { isAuthenticated } from '../middlewares/is-authenticated'
import { upload } from '../middlewares/multer'

const router = Router()

router.post('/submit', upload.single('sketch'), submitSketch)

// Authenticated sketch routes

router.use(isAuthenticated)

router.get('/all', getAllSketches)

router.delete('/single-sketch/:sid', deleteSingleSketch)

router.delete('/all', deleteAllSketches)

router.put('/reply/:sid', replyToSketch)

router.put('/visibility/:sid', toggleSketchVisibility)

export { router as sketchRouter }
