import { Request, Response } from 'express'
import { CHAR_SIZE_LIMIT } from '../../constants/index'
import { isInvalidLength } from '../../utils/index'
import { throwError } from '../../utils/throw-error'

type TUpdateFeedbackMessageReqBody = {
  feedbackMessage: string
}

/*
USE: Update feedback message
ROUTE: user/feedback-message
METHOD: PUT
*/
export const updateFeedbackMessage = async (req: Request, res: Response) => {
  const user = req.user
  const { feedbackMessage } = req?.body as TUpdateFeedbackMessageReqBody

  if (!feedbackMessage) {
    throwError('Feedback message is required', 400)
  }

  if (isInvalidLength(feedbackMessage, CHAR_SIZE_LIMIT.feedback_message)) {
    throwError(
      `Feedback message length should be between ${CHAR_SIZE_LIMIT.feedback_message.min} to ${CHAR_SIZE_LIMIT.feedback_message.max} characters`,
      400
    )
  }

  user.feedback_message = feedbackMessage
  await user.save()

  res.status(200).json({
    message: 'Successfully updated your feedback message',
    data: { feedback_message: feedbackMessage }
  })
}
