import { Request, Response } from 'express'
import { invalidateUserCaches } from '../../utils/cache'

/*
USE: Toggle inbox status 
ROUTE: user/inbox-status
METHOD: PUT
*/
export const toggleInboxStatus = async (req: Request, res: Response) => {
  const user = req.user

  const initialInboxStatus = user?.is_inbox_enabled

  user.is_inbox_enabled = !initialInboxStatus
  await user.save()

  const updatedInboxStatus = !initialInboxStatus ? 'enabled' : 'disabled'

  await invalidateUserCaches(user._id.toString())

  res.status(200).json({
    message: `Inbox ${updatedInboxStatus}`,
    data: { is_inbox_enabled: !initialInboxStatus }
  })
}
