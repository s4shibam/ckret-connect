import jwt from 'jsonwebtoken';
import { catchAsyncError as cae } from '../middleware/catch-async-error.js';
import User from '../models/user.model.js';
import CustomError from '../utils/custom-error.js';

export const isAuthenticated = cae(async (req, res, next) => {
  const authorizationHeader = req?.headers?.authorization;
  const token = authorizationHeader?.split('Bearer ')[1];

  if (!token) {
    return next(new CustomError('Unauthorized request', 401));
  }

  const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(verifiedUser?._id);

  if (!req?.user) {
    return next(new CustomError('User not found', 404));
  }

  next();
});
