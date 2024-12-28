import CustomError from './custom-error'

export function throwError(
  message = 'Internal error occurred',
  statusCode = 500
): never {
  throw new CustomError(message, statusCode)
}
