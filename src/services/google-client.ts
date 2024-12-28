import { OAuth2Client } from 'google-auth-library'
import { env } from '../constants/env'
import { throwError } from '../utils/throw-error'

export const googleClient = new OAuth2Client(env.google_client_id)

type TDecodedGoogleTokenResponse = {
  email: string
  name: string
}

export const decodeGoogleToken = async (
  token?: string
): Promise<TDecodedGoogleTokenResponse> => {
  if (!token) {
    throwError('Google authentication token is required', 400)
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: env.google_client_id
  })

  const { email, name } = ticket.getPayload() as TDecodedGoogleTokenResponse

  if (!email || !name) {
    throwError('Invalid token payload', 400)
  }

  return { email, name }
}
