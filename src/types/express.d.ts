import { TUserDoc } from './models'

declare global {
  namespace Express {
    export interface Request {
      user: TUserDoc
    }
  }
}

export {}
