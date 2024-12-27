import { Request, Response } from 'express'
import { mg } from '../../models'
import { isValidUsername } from '../../utils/index'
import { throwError } from '../../utils/throw-error'

type TUpdateUsernameReqBody = {
  username: string
}

/*
USE: Update username
ROUTE: user/username
METHOD: PUT
*/
export const updateUsername = async (req: Request, res: Response) => {
  const user = req.user
  const { username } = req?.body as TUpdateUsernameReqBody

  if (!username) {
    throwError('Username is required', 400)
  }

  if (!isValidUsername(username)) {
    throwError('Invalid username format', 400)
  }

  if (username === user.username) {
    throwError('This is already your username', 400)
  }

  const isUserWithSameUsernameExists = await mg.user.findOne({ username })

  if (isUserWithSameUsernameExists) {
    throwError('Username not available', 400)
  }

  user.username = username
  await user.save()

  res.status(200).json({
    message: 'Username updated successfully',
    data: { username }
  })
}
