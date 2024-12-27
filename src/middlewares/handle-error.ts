import { NextFunction, Request, Response } from 'express'
import { env } from '../constants/env.js'
import { TErrorResponse } from '../types/common.js'

// eslint-disable-next-line no-unused-vars
export const handleError = (
  err: TErrorResponse,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errorResponse: TErrorResponse = {
    message: err.message || 'Unknown error occurred',
    statusCode: err.statusCode || 500,
    stack: env.node_env === 'dev' ? err.stack : undefined
  }

  console.log('errorResponse:', errorResponse)

  res.status(errorResponse.statusCode).json(errorResponse)
}
