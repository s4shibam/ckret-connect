import { config } from 'dotenv'
import path from 'path'
import { __dirname } from '../utils/index.js'

config({
  path: path.resolve(__dirname, '../.env')
})

export const AUTH_PROVIDER = {
  google: 'google',
  anonymous: 'anonymous'
}

export const DEFAULT_CONFIG = {
  signin_token_expiry: '30d',

  inbox_max_size: 50,
  is_inbox_enabled: true,
  message_max_length: 150,
  feedback_message: 'Thank You'
}

export const CHAR_SIZE_LIMIT = {
  NAME: {
    MIN: 1,
    MAX: 100
  },
  USERNAME: {
    MIN: 5,
    MAX: 20
  },
  FEEDBACK_MESSAGE: {
    MIN: 1,
    MAX: 100
  },
  PASSWORD: {
    MIN: 8,
    MAX: 32
  }
}

export const MESSAGE_TYPE = {
  ANONYMOUS_MESSAGE: 'AM'
}

export const HTTP_STATUS_CODE_MAP = {
  // 2xx Success
  200: 'OK',
  201: 'Created',
  204: 'No Content',

  // 4xx Client Errors
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  422: 'Unprocessable Entity',

  // 5xx Server Errors
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout'
}

export const ENV = {
  port: process.env.PORT || 8000,
  jwt_secret: process.env.JWT_SECRET || 'env-not-set',
  google_client_id: process.env.GOOGLE_CLIENT_ID || 'env-not-set',
  db_name: process.env.DB_NAME || 'env-not-set',
  db_connection_string: process.env.DB_CONNECTION_STRING || 'env-not-set',
  ckret_url: process.env.CKRET_URL || 'env-not-set',
  ckret_logo_url: process.env.CKRET_LOGO_URL || 'env-not-set',
  node_env: process.env.NODE_ENV || 'dev'
}
