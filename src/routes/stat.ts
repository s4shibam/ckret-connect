import { Router } from 'express'
import { getAllStats } from '../controllers/stat/index'

const router = Router()

router.get('/all', getAllStats)

export { router as statRouter }
