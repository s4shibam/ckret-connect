import { Router } from 'express'
import {
  deleteAllSketches,
  deleteSingleSketch,
  getAllSketches,
  submitSketch,
  replyToSketch,
  toggleSketchVisibility
} from '../controllers/sketch.controller.js'
import { isAuthenticated } from '../middleware/authenticate.js'
import { upload } from '../middleware/multer.js'

const router = Router()

router.post('/submit', upload.single('sketch'), submitSketch)

router.get('/all', isAuthenticated, getAllSketches)

router.delete('/single-sketch/:sid', isAuthenticated, deleteSingleSketch)

router.delete('/all', isAuthenticated, deleteAllSketches)

router.put('/reply/:sid', isAuthenticated, replyToSketch)

router.put('/visibility/:sid', isAuthenticated, toggleSketchVisibility)

export default router 