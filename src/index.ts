import app from './app'
import { env } from './constants/env'
import { connectMongo, disconnectMongo } from './services/db'
import { disconnectRedis, initRedis } from './services/redis'

const startServer = async () => {
  try {
    initRedis()
    await connectMongo()

    app.listen(env.port, () => {
      if (env.node_env === 'dev') {
        console.log(`Server is running on http://localhost:${env.port}`.green)
      } else {
        console.log(`Server is running on port ${env.port}`.green)
      }
    })
  } catch (error) {
    console.error('Failed to start server...\n'.red, error)
    process.exit(1)
  }
}

const gracefulShutdown = async () => {
  try {
    console.log('Shutting down gracefully...\n'.yellow)

    await disconnectRedis()
    await disconnectMongo()

    process.exit(0)
  } catch (error) {
    console.error('Error during shutdown...\n'.red, error)
    process.exit(1)
  }
}

const handleFatalError = (error: Error, type: 'rejection' | 'exception') => {
  console.error(`Shutting down due to unhandled ${type}...\n`.red, error)
  gracefulShutdown()
}

startServer()

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

process.on('unhandledRejection', (error: Error) =>
  handleFatalError(error, 'rejection')
)
process.on('uncaughtException', (error: Error) =>
  handleFatalError(error, 'exception')
)
