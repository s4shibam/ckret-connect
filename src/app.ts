import cors from 'cors'
import { config } from 'dotenv'
import express, { json } from 'express'
import morgan from 'morgan'
import { homePage } from './controllers/home/index'
import { handleError } from './middlewares/handle-error'
import { messageRouter } from './routes/message'
import { sketchRouter } from './routes/sketch'
import { statRouter } from './routes/stat'
import { userRouter } from './routes/user'
import { connectToDB } from './services/db'
import { throwError } from './utils/throw-error'

// Initialization
const app = express()
config()

// Database connection
connectToDB()

// Middleware configuration
app.use(json())
app.use(cors())
app.use(morgan('dev'))
app.use(express.static('public'))

// Ckret Connect Home Route
app.get('/', (_, res) => {
  res.status(200).send(homePage({ heading: 'Ckret Connect' }))
})

// API v1 Home Route
app.get('/api/v1', (_, res) => {
  res.status(200).send(homePage({ heading: 'Ckret Connect - API v1' }))
})

// API v1 Routes
app.use('/api/v1/user', userRouter)
app.use('/api/v1/message', messageRouter)
app.use('/api/v1/stat', statRouter)
app.use('/api/v1/sketch', sketchRouter)

// Handle unknown routes
app.all('*', (req) => {
  throwError(`Route '${req.originalUrl}' not found`, 404)
})

// Error Middleware configuration
app.use(handleError)

export default app
