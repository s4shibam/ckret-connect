import { Request, Response } from 'express'
import { mg } from '../../models'
import { throwError } from '../../utils/throw-error'

/*
USE: Get platform stats
ROUTE: stat/all
METHOD: GET
*/
export const getAllStats = async (req: Request, res: Response) => {
  const stats = await mg.stat.findOne()

  if (!stats) {
    throwError('Stats not found', 404)
  }

  const statsResponse = {
    total_messages_count: stats.total_messages_count,
    total_users_count: stats.registered_users.length
  }

  res.status(200).json({
    message: 'Successfully fetched platform stats',
    data: statsResponse
  })
}
