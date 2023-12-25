import cors from 'cors';
import { config } from 'dotenv';
import express, { json } from 'express';
import morgan from 'morgan';
import { errorHandler } from './middleware/error.js';
import messageRoutes from './routes/message.route.js';
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

// Set up view engine
app.set('view engine', 'ejs');

// API Base Route
app.get('/', (_, res) => {
  res.render('index', {
    ckretURL: process.env.CKRET_URL
  });
});

// API v1 Routes
app.get('/api/v1', (_, res) =>
  res.status(200).send('Ckret Backend Server -  API v1')
);

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/message', messageRoutes);

// Handle unknown routes
app.all('*', (req, _, next) => {
  next(new CustomError(`Route '${req.originalUrl}' not found`, 404));
});

// Error Middleware configuration
app.use(errorHandler);

export default app;
