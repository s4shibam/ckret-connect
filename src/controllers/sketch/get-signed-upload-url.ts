import { Request, Response } from 'express'
import { generateSignedUploadUrl } from '../../services/cloudinary'

/*
USE: Get signed URL for direct sketch upload to Cloudinary
ROUTE: sketch/signed-upload-url
METHOD: GET
*/
export const getSignedUploadUrl = async (req: Request, res: Response) => {
  const signedUrlData = generateSignedUploadUrl()

  res.status(200).json({
    message: 'Upload URL generated successfully',
    data: signedUrlData
  })
}

