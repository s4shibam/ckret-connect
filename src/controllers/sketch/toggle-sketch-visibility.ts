import { Request, Response } from 'express'
import { mg } from '../../models'
import { throwError } from '../../utils/throw-error'

type TToggleSketchVisibilityReqParams = {
  sid: string
}

/*
USE: Toggle sketch visibility in profile
ROUTE: sketch/visibility/:sid
METHOD: PUT
*/
export const toggleSketchVisibility = async (req: Request, res: Response) => {
  const { sid } = req?.params as TToggleSketchVisibilityReqParams

  const sketch = await mg.sketch.findById(sid)

  if (!sketch) {
    throwError('Sketch not found', 404)
  }

  if (sketch.recipient.toString() !== req.user._id.toString()) {
    throwError('Not authorized to modify this sketch', 403)
  }

  if (!sketch.show_in_profile && !sketch.encrypted_reply) {
    throwError('Cannot show sketch in profile without a reply', 400)
  }

  sketch.show_in_profile = !sketch.show_in_profile
  await sketch.save()

  res.status(200).json({
    message: `Sketch ${sketch.show_in_profile ? 'will' : 'will not'} be shown in public profile`
  })
}
