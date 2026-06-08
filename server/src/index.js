import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import quizRouter from './routes/quiz.js';
import authMiddleware from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Auth routes
app.use('/api/auth', authRouter);

// Quiz routes (mount directly under /api since paths already have /categories, /questions, etc.)
app.use('/api', quizRouter);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Dummy protected route for validation
app.get('/api/protected-test', authMiddleware, (req, res) => {
  res.json({ message: 'secure data accessed', user: req.user });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
