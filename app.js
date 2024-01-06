import cors from 'cors';
import { config } from 'dotenv';
import express, { json } from 'express';
import morgan from 'morgan';
import { homePage } from './controllers/home.controller.js';
import { errorHandler } from './middleware/error.js';
import messageRoutes from './routes/message.route.js';
import statRoutes from './routes/stat.route.js';
import userRoutes from './routes/user.route.js';
import CustomError from './utils/custom-error.js';
import { connectToDB } from './utils/db-connection.js';

// Initialization
const app = express();
config();

// Database connection
connectToDB();

// Middleware configuration
app.use(json());
app.use(cors());
app.use(morgan('dev'));
app.use(express.static('public'));

// Ckret Connect Home Route
app.get('/', (_, res) =>
  res.status(200).send(homePage({ heading: 'Ckret Connect' }))
);

// API v1 Home Route
app.get('/api/v1', (_, res) =>
  res.status(200).send(homePage({ heading: 'Ckret Connect - API v1' }))
);

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/message', messageRoutes);
app.use('/api/v1/stat', statRoutes);

// Handle unknown routes
app.all('*', (req, _, next) => {
  next(new CustomError(`Route '${req.originalUrl}' not found`, 404));
});

// Error Middleware configuration
app.use(errorHandler);

export default app;
