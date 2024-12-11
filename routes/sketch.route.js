import { Router } from 'express'
import {
  deleteAllSketches,
  deleteSingleSketch,
  getAllSketches,
  submitSketch
} from '../controllers/sketch.controller.js'
import { isAuthenticated } from '../middleware/authenticate.js'
import { upload } from '../middleware/multer.js'

const router = Router()

router.post('/submit', upload.single('sketch'), submitSketch)

router.get('/all', isAuthenticated, getAllSketches)

router.delete('/single-sketch/:sid', isAuthenticated, deleteSingleSketch)

router.delete('/all', isAuthenticated, deleteAllSketches)

export default router 