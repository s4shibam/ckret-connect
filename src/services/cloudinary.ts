import { v2 as cloudinary } from 'cloudinary'
import { env } from '../constants/env'
import { throwError } from '../utils/throw-error'

// Cloudinary configuration
cloudinary.config({
  cloud_name: env.cloudinary_cloud_name,
  api_key: env.cloudinary_api_key,
  api_secret: env.cloudinary_api_secret
})

export const uploadToCloudinary = async (
  base64Image: string,
  assetType = 'sketch'
) => {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: env.cloudinary_folder,
      resource_type: 'image',
      format: 'png'
    })

    return result.secure_url
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throwError(`Failed to upload ${assetType}`)
  }
}

export const deleteFromCloudinary = async (
  secureUrl: string,
  assetType = 'sketch'
) => {
  try {
    const publicId = secureUrl.split('/').pop()?.split('.').shift()
    if (!publicId) {
      throwError('Invalid secure URL')
    }

    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throwError(`Failed to delete ${assetType}`)
  }
}
