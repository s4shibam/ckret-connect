import { catchAsyncError as cae } from '../middleware/catch-async-error.js';
import Stat from '../models/stat.model.js';
import CustomError from '../utils/custom-error.js';

/*
USE: Get platform stats
ROUTE: stat/all
METHOD: GET
*/
export const getAllStats = cae(async (req, res, next) => {
  const stats = await Stat.findOne();

  if (!stats) {
    return next(new CustomError('Stats not found', 404));
  }

  const statsResponse = {
    total_messages_count: stats.total_messages_count,
    total_users_count: stats.registered_users.length
  };

  res.status(200).json({
    success: true,
    message: 'Successfully fetched platform stats',
    data: statsResponse
  });
});
