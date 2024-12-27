import { NextFunction, Request, Response } from 'express'
import { env } from '../constants/env.js'
import { TErrorResponse } from '../types/common.js'
import CustomError from '../utils/custom-error.js'

// eslint-disable-next-line no-unused-vars
export const handleError = (
  err: Error | CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errorResponse: TErrorResponse = err as TErrorResponse

  errorResponse.statusCode = errorResponse.statusCode || 500
  errorResponse.message = errorResponse.message || 'Unknown error occurred'
  errorResponse.stack = env.node_env === 'dev' ? errorResponse.stack : undefined

  console.log('errorResponse: ', errorResponse)

  res.status(errorResponse.statusCode).json(errorResponse)
}
