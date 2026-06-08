import express from 'express';
import db from '../db.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Helper function to shuffle array (Fisher-Yates)
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 1. GET /api/categories (Public)
router.get('/categories', async (req, res) => {
  try {
    const categories = await db.query('SELECT id, name FROM categories ORDER BY name ASC');
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. GET /api/questions (Protected)
router.get('/questions', authMiddleware, async (req, res) => {
  try {
    const categoryId = parseInt(req.query.categoryId, 10);
    let count = parseInt(req.query.count || '10', 10);

    if (isNaN(categoryId)) {
      return res.status(400).json({ error: 'categoryId parameter is required and must be a number' });
    }

    if (isNaN(count) || count < 5 || count > 20) {
      return res.status(400).json({ error: 'count must be between 5 and 20' });
    }

    // Fetch randomized questions from DB
    const questions = await db.query(
      `SELECT id, category_id, difficulty, question_text, correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3 
       FROM questions 
       WHERE category_id = ? 
       ORDER BY RAND() 
       LIMIT ${count}`,
      [categoryId]
    );

    // Shuffle options for each question
    const formattedQuestions = questions.map(q => {
      const answers = shuffle([
        q.correct_answer,
        q.wrong_answer_1,
        q.wrong_answer_2,
        q.wrong_answer_3
      ]);
      return {
        id: q.id,
        category_id: q.category_id,
        difficulty: q.difficulty,
        question_text: q.question_text,
        correct_answer: q.correct_answer, // Expose for immediate feedback UX
        answers
      };
    });

    res.json(formattedQuestions);
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. POST /api/quiz/submit (Protected)
router.post('/quiz/submit', authMiddleware, async (req, res) => {
  try {
    const { categoryId, answers } = req.body;
    const userId = req.user.userId;

    if (!categoryId || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Invalid submission format' });
    }

    let correctCount = 0;
    const totalQuestions = answers.length;

    // Verify each answer against the database
    for (const ans of answers) {
      const { questionId, selectedAnswer } = ans;
      const questionRows = await db.query(
        'SELECT correct_answer FROM questions WHERE id = ? AND category_id = ?',
        [questionId, categoryId]
      );

      if (questionRows.length > 0) {
        if (questionRows[0].correct_answer === selectedAnswer) {
          correctCount++;
        }
      }
    }

    const scorePercent = parseFloat(((correctCount / totalQuestions) * 100).toFixed(2));

    // Save to quiz_results
    await db.query(
      `INSERT INTO quiz_results (user_id, category_id, total_questions, correct_count, score_percent)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, categoryId, totalQuestions, correctCount, scorePercent]
    );

    res.status(200).json({
      correctCount,
      incorrectCount: totalQuestions - correctCount,
      scorePercent,
      totalQuestions
    });
  } catch (err) {
    console.error('Error submitting quiz:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. GET /api/quiz/results (Protected)
router.get('/quiz/results', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const results = await db.query(
      `SELECT qr.id, qr.category_id, qr.total_questions, qr.correct_count, qr.score_percent, qr.played_at, c.name AS category_name
       FROM quiz_results qr
       JOIN categories c ON qr.category_id = c.id
       WHERE qr.user_id = ?
       ORDER BY qr.played_at DESC`,
      [userId]
    );
    res.json(results);
  } catch (err) {
    console.error('Error fetching quiz results:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
