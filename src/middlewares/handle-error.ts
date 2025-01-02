import { NextFunction, Request, Response } from 'express'
import { env } from '../constants/env'
import { log } from '../services/log'
import { TErrorResponse } from '../types/common'

// eslint-disable-next-line no-unused-vars
export const handleError = async (
  err: TErrorResponse,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const errorResponse: TErrorResponse = {
    message: err.message || 'Unknown error occurred',
    statusCode: err.statusCode || 500,
    stack: env.node_env === 'dev' ? err.stack : undefined
  }

  log.error(errorResponse.message, {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    userId: req.user?._id.toString(),
    statusCode: errorResponse.statusCode,
    stack: errorResponse.stack,
    ip: req.ip
  })

  res.status(errorResponse.statusCode).json(errorResponse)
}
