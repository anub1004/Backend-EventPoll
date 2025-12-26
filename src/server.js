import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import pollRoutes from './routes/pollRoutes.js';
import  errorHandler  from './middleware/errorHandler.js';

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: 'https://eventman-alpha.vercel.app/', // frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // if you are sending cookies or auth headers
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/polls', pollRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Event Polling API is running best' });
});
app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
// Error handler
app.use(errorHandler);

;
