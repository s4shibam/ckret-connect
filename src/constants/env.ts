import dotenv from 'dotenv'
import path from 'path'

dotenv.config({
  path: path.join(__dirname, '../../.env')
})

type TEnv = {
  port: number
  jwt_secret: string | 'env-not-set'
  google_client_id: string | 'env-not-set'
  db_url: string | 'env-not-set'
  ckret_url: string | 'env-not-set'
  ckret_logo_url: string | 'env-not-set'
  encryption_key: string | 'env-not-set'
  node_env: 'dev' | 'prod'
  cloudinary_cloud_name: string | 'env-not-set'
  cloudinary_api_key: string | 'env-not-set'
  cloudinary_api_secret: string | 'env-not-set'
  cloudinary_folder: string | 'env-not-set'
}

export const env: TEnv = {
  port: Number(process.env.PORT) || 8000,
  jwt_secret: process.env.JWT_SECRET || 'env-not-set',
  google_client_id: process.env.GOOGLE_CLIENT_ID || 'env-not-set',
  db_url: process.env.DB_URL || 'env-not-set',
  ckret_url: process.env.CKRET_URL || 'env-not-set',
  ckret_logo_url: process.env.CKRET_LOGO_URL || 'env-not-set',
  encryption_key: process.env.ENCRYPTION_KEY || 'env-not-set',
  node_env: (process.env.NODE_ENV as TEnv['node_env']) || 'dev',
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'env-not-set',
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY || 'env-not-set',
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET || 'env-not-set',
  cloudinary_folder: process.env.CLOUDINARY_FOLDER || 'env-not-set'
}
