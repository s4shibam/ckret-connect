import { OAuth2Client } from 'google-auth-library'
import { ENV } from '../constants/index.js'

export const googleClient = new OAuth2Client(ENV.google_client_id)
