import { Request, Response } from 'express'
import { mg } from '../../models'
import { encryptMessage } from '../../utils/crypto'
import { throwError } from '../../utils/throw-error'

type TReplyToSketchReqParams = {
  sid: string
}

type TReplyToSketchReqBody = {
  replyContent: string
}

/*
USE: Add or update reply to a sketch
ROUTE: sketch/reply/:sid
METHOD: PUT
*/
export const replyToSketch = async (req: Request, res: Response) => {
  const { sid } = req?.params as TReplyToSketchReqParams
  const { replyContent } = req?.body as TReplyToSketchReqBody

  if (!replyContent) {
    throwError('Reply content is required', 400)
  }

  const sketch = await mg.sketch.findById(sid)

  if (!sketch) {
    throwError('Sketch not found', 404)
  }

  if (sketch.recipient.toString() !== req.user._id.toString()) {
    throwError('Not authorized to reply to this sketch', 403)
  }

  const encryptedReply = encryptMessage(replyContent)
  sketch.encrypted_reply = encryptedReply
  sketch.show_in_profile = true
  await sketch.save()

  res.status(200).json({
    message: 'Reply added successfully'
  })
}
