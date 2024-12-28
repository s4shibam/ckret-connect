import { Model } from 'mongoose'
import { TMessage, TSketch, TStat, TUser } from '../types/models'
import messageModel from './message'
import sketchModel from './sketch'
import statModel from './stat'
import userModel from './user'

type TMg = {
  user: Model<TUser>
  message: Model<TMessage>
  sketch: Model<TSketch>
  stat: Model<TStat>
}

export const mg: TMg = {
  user: userModel,
  message: messageModel,
  sketch: sketchModel,
  stat: statModel
}
