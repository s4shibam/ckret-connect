// stat

import { Router } from 'express';
import { getAllStats } from '../controllers/stat.controller.js';
const router = Router();

router.get('/all', getAllStats);

export default router;
