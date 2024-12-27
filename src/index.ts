import colors from 'colors'
import app from './app.js'
import { env } from './constants/env.js'

// Server
app.listen(env.port, () => {
  if (env.node_env === 'dev') {
    console.log(
      colors.magenta('Server is live on: http://localhost:%d'),
      env.port
    )
  } else {
    console.log(colors.magenta('Server is live on PORT: %d'), env.port)
  }
})

// Handle unhandled Promise rejections
process.on('unhandledRejection', (error: Error) => {
  console.error(
    `Unhandled rejection! 💥 Shutting down... ${error.name}: ${error.message}`
  )
  process.exit(1)
})

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error(
    `Uncaught exception! 💥 Shutting down... ${error.name}: ${error.message}`
  )
  process.exit(1)
})
