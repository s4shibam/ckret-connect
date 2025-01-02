import { Logtail } from '@logtail/node'
import { LogtailTransport } from '@logtail/winston'
import winston from 'winston'
import { env } from '../constants/env'

const logtail = new Logtail(env.logtail_token)

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

const getTransports = (): winston.transport[] => {
  if (env.node_env === 'dev') {
    return [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }),
      new winston.transports.File({
        filename: '.logs/error.log',
        level: 'error',
        format: logFormat
      }),
      new winston.transports.File({
        filename: '.logs/combined.log',
        format: logFormat
      })
    ]
  }
  return [new LogtailTransport(logtail)]
}

const logger = winston.createLogger({
  level: env.node_env === 'dev' ? 'debug' : 'info',
  format: logFormat,
  transports: getTransports(),
  exceptionHandlers: [
    new winston.transports.File({
      filename: '.logs/exceptions.log'
    })
  ],
  exitOnError: false
})

type TLogMeta = {
  path?: string
  method?: string
  query?: any
  body?: any
  ip?: string
  userId?: string
  [key: string]: any
}

const createLogFunction =
  (level: 'error' | 'warn' | 'info' | 'debug') =>
  (message: string, meta: TLogMeta = {}) => {
    const formattedReqBody = {
      ...meta.body,
      password: meta.body?.password ? '***' : undefined,
      encrypted_content: meta.body?.encrypted_content ? '***' : undefined,
      encrypted_reply: meta.body?.encrypted_reply ? '***' : undefined
    }

    logger[level](message, {
      ...meta,
      body: formattedReqBody,
      timestamp: new Date()
    })
  }

export const log = {
  error: createLogFunction('error'),
  warn: createLogFunction('warn'),
  info: createLogFunction('info'),
  debug: createLogFunction('debug')
}
