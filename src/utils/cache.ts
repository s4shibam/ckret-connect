import { invalidateCache } from '../services/redis'

export const invalidateUserMessagesCache = async (
  userId: string
): Promise<void> => {
  await invalidateCache(`messages:${userId}`)
}

export const invalidateUserSketchesCache = async (
  userId: string
): Promise<void> => {
  await invalidateCache(`sketches:${userId}`)
}

export const invalidateUserCaches = async (userId: string): Promise<void> => {
  await Promise.all([
    invalidateCache(`messages:${userId}`),
    invalidateCache(`sketches:${userId}`),
    invalidateCache(`profile:${userId}`)
  ])
}
