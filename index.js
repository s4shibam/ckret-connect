import colors from 'colors'
import app from './app.js'
import { ENV } from './constants/index.js'

// Server
app.listen(ENV.port, () => {
  if (ENV.node_env === 'development') {
    console.log(
      colors.magenta('Server is live on: http://localhost:%d'),
      ENV.port
    )
  } else {
    console.log(colors.magenta('Server is live on PORT: %d'), ENV.port)
  }
})
