import { Document, Types } from 'mongoose'
import { AUTH_PROVIDER, MESSAGE_TYPE } from '../constants'

export type ObjectId = Types.ObjectId

export type TUser = {
  _id: ObjectId
  name: string
  username: string | null
  avatar: string | null
  email: string
  auth_provider: typeof AUTH_PROVIDER.google | typeof AUTH_PROVIDER.anonymous
  message_max_length: number
  feedback_message: string
  inbox_max_size: number
  sketch_max_size: number
  is_inbox_enabled: boolean
  password?: string

  // Schema methods
  comparePassword: (inputPassword: string) => Promise<boolean>
}

export type TUserDoc = TUser & Document

export type TMessage = {
  _id: ObjectId
  recipient: ObjectId
  encrypted_content: string
  content?: string // Available after transform
  message_type: typeof MESSAGE_TYPE.anonymous_message
  encrypted_reply: string | null
  reply?: string // Available after transform
  show_in_profile: boolean
}

export type TMessageDoc = TMessage & Document

export type TSketch = {
  _id: ObjectId
  recipient: ObjectId
  sketch_url: string
  type: typeof MESSAGE_TYPE.anonymous_sketch
  encrypted_reply: string | null
  reply?: string // Available after transform
  show_in_profile: boolean
}

export type TSketchDoc = TSketch & Document

export type TStat = {
  _id: ObjectId
  registered_users: string[]
  anonymous_users_count: number
  total_messages_count: number
  total_sketches_count: number
}

export type TStatDoc = TStat & Document
