import { HTTP_STATUS_CODE_MAP } from '../constants/index.js';
import CustomError from '../utils/custom-error.js';

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Wrong Mongodb Id error
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new CustomError(message, 400);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new CustomError(message, 400);
  }

  // Wrong JWT error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Json Web Token is invalid, Try again';
    err = new CustomError(message, 400);
  }

  // JWT EXPIRE error
  if (err.name === 'TokenExpiredError') {
    const message = 'Session expired, Sign in again';
    err = new CustomError(message, 400);
  }

  res.status(err.statusCode).json({
    error: true,
    message: err.message,
    statusCode: err.statusCode,
    statusText: HTTP_STATUS_CODE_MAP[err.statusCode] || 'Unknown Status'
  });
};
