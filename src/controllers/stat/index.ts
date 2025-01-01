import { Request, Response } from 'express'
import { mg } from '../../models'
import { withCache } from '../../services/redis'
import { throwError } from '../../utils/throw-error'

/*
USE: Get platform stats
ROUTE: stat/all
METHOD: GET
*/
export const getAllStats = async (req: Request, res: Response) => {
  const _getStats = async () => {
    const stats = await mg.stat.findOne()

    if (!stats) {
      throwError('Stats not found', 404)
    }

    return {
      total_registered_users: stats.registered_users.length,
      total_anonymous_users: stats.anonymous_users_count,
      total_messages: stats.total_messages_count,
      total_sketches: stats.total_sketches_count
    }
  }

  const statsResponse = await withCache({
    key: 'platform:stats',
    fn: _getStats,
    options: { ttl: 60 * 60 * 24 }
  })

  res.status(200).json({
    message: 'Successfully fetched platform stats',
    data: statsResponse
  })
}
