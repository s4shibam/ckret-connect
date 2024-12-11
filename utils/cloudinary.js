import { v2 as cloudinary } from 'cloudinary'
import { ENV } from '../constants/index.js'

// Configure cloudinary
cloudinary.config({
  cloud_name: ENV.cloudinary_cloud_name,
  api_key: ENV.cloudinary_api_key,
  api_secret: ENV.cloudinary_api_secret
})

export const uploadToCloudinary = async (base64Image) => {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: ENV.cloudinary_folder,
      resource_type: 'image',
      format: 'png'
    })

    return result.secure_url
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error('Failed to upload sketch')
  }
}
