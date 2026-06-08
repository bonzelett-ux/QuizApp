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

    // Verify category exists
    const categoryRows = await db.query('SELECT id FROM categories WHERE id = ?', [categoryId]);
    if (categoryRows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Fetch randomized questions from DB (fetch a larger pool to allow filtering duplicates)
    const questions = await db.query(
      `SELECT id, category_id, difficulty, question_text, correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3 
       FROM questions 
       WHERE category_id = ? 
       ORDER BY RAND() 
       LIMIT 100`,
      [categoryId]
    );

    // Filter duplicates by normalizing question text
    const seenTexts = new Set();
    const uniqueQuestions = [];

    for (const q of questions) {
      // Normalize: strip " (Variant ID: X)" or " (ID: X)" anywhere before a question mark or end of string
      const normalizedText = q.question_text.replace(/\s*\((Variant\s+)?ID:\s*\d+\)\s*(?=\?|$)/gi, '').trim().toLowerCase();
      
      if (!seenTexts.has(normalizedText)) {
        seenTexts.add(normalizedText);
        uniqueQuestions.push(q);
      }
      
      if (uniqueQuestions.length === count) {
        break;
      }
    }

    // Shuffle options for each question
    const formattedQuestions = uniqueQuestions.map(q => {
      const answers = shuffle([
        q.correct_answer,
        q.wrong_answer_1,
        q.wrong_answer_2,
        q.wrong_answer_3
      ]);
      // Normalize to strip "(Variant ID: X)" or "(ID: X)" so user doesn't see it
      const cleanText = q.question_text.replace(/\s*\((Variant\s+)?ID:\s*\d+\)\s*(?=\?|$)/gi, '').trim();
      return {
        id: q.id,
        category_id: q.category_id,
        difficulty: q.difficulty,
        question_text: cleanText,
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

    if (isNaN(parseInt(categoryId, 10)) || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Invalid submission format' });
    }

    if (answers.length < 5 || answers.length > 20) {
      return res.status(400).json({ error: 'Answers count must be between 5 and 20' });
    }

    // Validate that category exists
    const categoryRows = await db.query('SELECT id FROM categories WHERE id = ?', [categoryId]);
    if (categoryRows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Validate structure of each answer
    for (const ans of answers) {
      if (typeof ans !== 'object' || isNaN(parseInt(ans.questionId, 10)) || typeof ans.selectedAnswer !== 'string') {
        return res.status(400).json({ error: 'Each answer must have a numeric questionId and string selectedAnswer' });
      }
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
