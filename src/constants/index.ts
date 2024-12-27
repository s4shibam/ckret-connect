export const AUTH_PROVIDER = {
  google: 'google',
  anonymous: 'anonymous'
} as const

export const DEFAULT_CONFIG = {
  signin_token_expiry: '30d',

  inbox_max_size: 50,
  is_inbox_enabled: true,
  message_max_length: 150,
  feedback_message: 'Thank You',
  sketch_max_size: 25
} as const

export const CHAR_SIZE_LIMIT = {
  name: {
    min: 1,
    max: 100
  },
  username: {
    min: 5,
    max: 20
  },
  feedback_message: {
    min: 1,
    max: 100
  },
  password: {
    min: 8,
    max: 32
  }
} as const

export const MESSAGE_TYPE = {
  anonymous_message: 'AM',
  anonymous_sketch: 'AS'
} as const
