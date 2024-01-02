export const AUTH_PROVIDER = {
  google: 'google'
};

export const DEFAULT_CONFIG = {
  signin_token_expiry: '30d',

  inbox_max_size: 50,
  is_inbox_enabled: true,
  message_max_length: 150,
  feedback_message: 'Thank You',
  feedback_message_max_length: 50
};

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
};
