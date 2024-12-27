import { Request, Response } from 'express'
import { CHAR_SIZE_LIMIT } from '../../constants/index'
import { isInvalidLength } from '../../utils/index'
import { throwError } from '../../utils/throw-error'

type TUpdateNameReqBody = {
  name: string
}

/*
USE: Update name
ROUTE: user/name
METHOD: PUT
*/
export const updateName = async (req: Request, res: Response) => {
  const user = req.user
  const { name } = req?.body as TUpdateNameReqBody

  if (!name) {
    throwError('Name is required', 400)
  }

  if (isInvalidLength(name, CHAR_SIZE_LIMIT.name)) {
    throwError(
      `Name length should be between ${CHAR_SIZE_LIMIT.name.min} to ${CHAR_SIZE_LIMIT.name.max} characters`,
      400
    )
  }

  user.name = name
  await user.save()

  res.status(200).json({
    message: 'Successfully updated your name',
    data: { name }
  })
}
