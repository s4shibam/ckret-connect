import { Request } from 'express'
import multer from 'multer'
import { throwError } from '../utils/throw-error'

const storage = multer.memoryStorage()

const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(throwError('Only image files are allowed!', 400), false)
  }
}

export const upload = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 1 * 1024 * 1024 // 1MB limit
  }
})
