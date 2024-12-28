import { Request, Response } from 'express'
import { isValidAvatar } from '../../utils/index'
import { throwError } from '../../utils/throw-error'

type TUpdateAvatarReqBody = {
  avatar: string
}

/*
USE: Update avatar emoji
ROUTE: user/avatar
METHOD: PUT
*/
export const updateAvatar = async (req: Request, res: Response) => {
  const { avatar } = req?.body as TUpdateAvatarReqBody
  const user = req.user

  if (!avatar) {
    throwError('Avatar emoji is required', 400)
  }

  if (!isValidAvatar(avatar)) {
    throwError('Avatar must be a single emoji', 400)
  }

  user.avatar = avatar
  await user.save()

  res.status(200).json({
    message: 'Successfully updated your avatar',
    data: { avatar }
  })
}
