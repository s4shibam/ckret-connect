import { Logtail } from '@logtail/node'
import { LogtailTransport } from '@logtail/winston'
import winston from 'winston'
import { env } from '../constants/env'

const logtail = new Logtail(env.logtail_token)

const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: () =>
      new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }) + ' [IST]'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
)

const getTransports = (): winston.transport[] => {
  if (env.node_env === 'dev') {
    return [
      new winston.transports.Console({
        format: logFormat
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
    const reqBody = meta.body

    // Mask sensitive data
    if (reqBody?.password) {
      reqBody.password = '***'
    }

    if (reqBody?.token) {
      reqBody.token = reqBody.token.slice(0, 10) + '...'
    }

    if (reqBody?.messageContent) {
      reqBody.messageContent = `Length: ${reqBody.messageContent.length}`
    }

    if (reqBody?.replyContent) {
      reqBody.replyContent = `Length: ${reqBody.replyContent.length}`
    }

    logger[level](message, { ...meta, body: reqBody })
  }

export const log = {
  error: createLogFunction('error'),
  warn: createLogFunction('warn'),
  info: createLogFunction('info'),
  debug: createLogFunction('debug')
}
