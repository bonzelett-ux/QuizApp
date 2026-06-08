# Trivia Quiz Web App — Build Plan

A phased, step-by-step plan to build a full-stack trivia quiz web app with authentication, category selection, scored quizzes, and a results page with historical comparison.

---

## Tech Stack Choices

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React (Vite) | Fast dev server, component model fits quiz flow |
| Backend | Node.js + Express | Lightweight API, great JWT ecosystem |
| Database | PostgreSQL | Relational model fits questions/users/scores |
| Auth | JWT (JSON Web Tokens) | Stateless, easy to implement with Express |
| Password Hashing | bcrypt | Industry standard |
| Styling | CSS Modules or Tailwind | Your preference; Tailwind speeds up UI phases |

---

## Phase 1 — Project Scaffolding

**Goal:** Get a working repo with both frontend and backend running locally.

### Step 1.1 — Initialize the Monorepo
- Create a root folder `trivia-app/`
- Inside, create two folders: `client/` (React) and `server/` (Express)
- Add a root `README.md` and `.gitignore` (ignore `node_modules`, `.env`)
- Initialize git: `git init`

### Step 1.2 — Bootstrap the Backend
- `cd server && npm init -y`
- Install dependencies: `express`, `cors`, `dotenv`, `pg` (PostgreSQL client), `bcrypt`, `jsonwebtoken`
- Install dev dependencies: `nodemon`
- Create `server/src/index.js` with a basic Express server on port `4000`
- Add a health-check route: `GET /api/health` → returns `{ status: "ok" }`
- Test: `nodemon src/index.js` — confirm the route responds

### Step 1.3 — Bootstrap the Frontend
- `cd client && npm create vite@latest . -- --template react`
- Install dependencies: `axios`, `react-router-dom`
- Delete boilerplate (App.css contents, logo, etc.)
- Create a placeholder `<App />` that renders `"Trivia App"` — confirm it loads at `localhost:5173`

### Step 1.4 — Connect Frontend to Backend
- In `client/`, add a `.env`: `VITE_API_URL=http://localhost:4000/api`
- Create `client/src/api/client.js` — an Axios instance using `VITE_API_URL`
- Make a test call from `<App />` to `GET /api/health` and log the response
- Configure `cors` on the backend to allow `localhost:5173`

---

## Phase 2 — Database Setup

**Goal:** A running PostgreSQL database with all tables and seeded question data.

### Step 2.1 — Create the Database
- Install PostgreSQL locally (or use a Docker container)
- Create a database: `trivia_db`
- Create a `.env` in `server/` with `DATABASE_URL=postgresql://user:password@localhost:5432/trivia_db`
- Set up a `server/src/db.js` module using the `pg` Pool, connected via `DATABASE_URL`

### Step 2.2 — Design and Create the Schema
Run the following migrations (store as `.sql` files in `server/migrations/`):

```sql
-- 001_create_users.sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 002_create_categories.sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- 003_create_questions.sql
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id),
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  wrong_answer_1 TEXT NOT NULL,
  wrong_answer_2 TEXT NOT NULL,
  wrong_answer_3 TEXT NOT NULL
);

-- 004_create_quiz_results.sql
CREATE TABLE quiz_results (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  category_id INTEGER REFERENCES categories(id),
  total_questions INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  score_percent NUMERIC(5,2) NOT NULL,
  played_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Step 2.3 — Seed the Database
- Create `server/seeds/seed.js`
- Define 10 categories (e.g. History, Science, Geography, Sports, Movies, Music, Technology, Literature, Art, Food)
- Write or source 100 questions per category (1,000 total), spread across easy/medium/hard difficulties
- Each question has: `question_text`, `correct_answer`, and 3 wrong answers
- Run the seed script: `node seeds/seed.js` — verify row counts in psql

---

## Phase 3 — Authentication API

**Goal:** Users can register and log in; protected routes return a JWT.

### Step 3.1 — Register Endpoint
- Create `server/src/routes/auth.js`
- `POST /api/auth/register`
  - Validate: email format, password min 8 chars
  - Check if email already exists → 409 Conflict
  - Hash password with `bcrypt.hash(password, 12)`
  - Insert user into `users` table
  - Return `201` with `{ message: "Account created" }`

### Step 3.2 — Login Endpoint
- `POST /api/auth/login`
  - Look up user by email → 401 if not found
  - Compare password with `bcrypt.compare()` → 401 if mismatch
  - Sign a JWT: `jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' })`
  - Return `200` with `{ token, user: { id, email } }`

### Step 3.3 — Auth Middleware
- Create `server/src/middleware/auth.js`
- Reads `Authorization: Bearer <token>` header
- Verifies with `jwt.verify()` → attaches `req.user` if valid, returns 401 otherwise
- Apply this middleware to all protected routes going forward

### Step 3.4 — Test Auth Routes
- Use Postman or `curl` to test register and login flows
- Confirm a bad password returns 401, duplicate email returns 409
- Confirm the JWT decodes correctly

---

## Phase 4 — Quiz API

**Goal:** Endpoints to fetch categories, get randomized questions, and save results.

### Step 4.1 — Categories Endpoint
- `GET /api/categories` (public)
  - Query all rows from `categories`
  - Return `[{ id, name }, ...]`

### Step 4.2 — Questions Endpoint
- `GET /api/questions` (protected — requires JWT)
  - Query params: `categoryId`, `count` (5–20)
  - Validate `count` is between 5 and 20
  - Query: `SELECT * FROM questions WHERE category_id = $1 ORDER BY RANDOM() LIMIT $2`
  - For each question, shuffle the 4 answers together (correct + 3 wrong) before returning
  - Return `[{ id, question_text, correct_answer, answers: [...shuffled] }, ...]` — **`correct_answer` is included so the frontend can show immediate per-question feedback after the user selects**
  - Note: since scoring is also verified server-side in Step 4.3, exposing `correct_answer` here does not compromise score integrity — it only enables the feedback UX

### Step 4.3 — Submit Quiz & Score Endpoint
- `POST /api/quiz/submit` (protected)
  - Body: `{ categoryId, answers: [{ questionId, selectedAnswer }, ...] }`
  - For each questionId, fetch `correct_answer` from DB and compare
  - Calculate `correct_count`, `score_percent`
  - Insert row into `quiz_results`
  - Return `{ correctCount, incorrectCount, scorePercent, totalQuestions }`

### Step 4.4 — Results History Endpoint
- `GET /api/quiz/results` (protected)
  - Returns all past `quiz_results` for `req.user.userId`, joined with category name
  - Ordered by `played_at DESC`

---

## Phase 5 — Frontend: Auth Pages

**Goal:** Working Register and Login pages that store the JWT.

### Step 5.1 — Routing Setup
- Install and configure `react-router-dom`
- Define routes in `App.jsx`:
  - `/login` → `<LoginPage />`
  - `/register` → `<RegisterPage />`
  - `/` → `<HomePage />` (protected)
  - `/quiz` → `<QuizPage />` (protected)
  - `/results` → `<ResultsPage />` (protected)
- Create a `<ProtectedRoute />` component that redirects to `/login` if no token

### Step 5.2 — Auth Context
- Create `client/src/context/AuthContext.jsx`
- Stores `{ user, token }` in state + localStorage
- Exposes `login(token, user)`, `logout()` functions
- Wrap `<App />` in `<AuthProvider />`

### Step 5.3 — Register Page
- Form: Email, Password, Confirm Password
- On submit: `POST /api/auth/register` → on success, redirect to `/login`
- Show inline validation errors (empty fields, password mismatch, server errors)

### Step 5.4 — Login Page
- Form: Email, Password
- On submit: `POST /api/auth/login` → store token via `AuthContext.login()` → redirect to `/`
- Show error message on bad credentials

---

## Phase 6 — Frontend: Home & Quiz Setup

**Goal:** Users can choose a category and question count, then start a quiz.

### Step 6.1 — Home Page
- On mount: fetch `GET /api/categories` and display as a list or grid of cards
- Add a number input or slider for question count (min 5, max 20, default 10)
- "Play" button is disabled until a category is selected
- On click: navigate to `/quiz` with state `{ categoryId, categoryName, count }`

### Step 6.2 — Quiz State Management
- Create `client/src/context/QuizContext.jsx` (or use `useReducer` in `QuizPage`)
- State: `{ questions, currentIndex, selectedAnswers, revealedQuestions, isSubmitted }`
  - `selectedAnswers`: map of `questionId → selectedAnswer`
  - `revealedQuestions`: set of `questionId` values where the user has already selected and the answer has been shown — used to lock the question and show feedback
- On mount: fetch `GET /api/questions?categoryId=X&count=Y` and store questions (each includes `correct_answer`)

### Step 6.3 — Quiz Page Layout
- Display: **"Question X of Y"** progress indicator at the top
- Render the current question text
- Render 4 answer buttons — highlight selected answer, prevent changing after selection
- "Next" button advances to the next question (disabled until an answer is selected)
- On the last question, "Next" becomes "Finish Quiz"

### Step 6.4 — Quiz Submission
- On "Finish Quiz": `POST /api/quiz/submit` with all answers
- Show a loading state while waiting for response
- On success: navigate to `/results` with the score data

---

## Phase 7 — Frontend: Results Page

**Goal:** Show score, comparison to past results, and a "Play Again" option.

### Step 7.1 — Results Display
- Show: **percent score**, number correct, number incorrect, total questions
- Visually distinguish correct (green) vs incorrect (red) counts

### Step 7.2 — Historical Comparison
- On mount: fetch `GET /api/quiz/results`
- Filter results for the same category
- Show previous attempts in a small table or list: date, score%, correct/total
- If this is the user's first attempt in this category, show a "Personal best!" message
- If not, compare to average and best: e.g. "Your best in this category: 85%"

### Step 7.3 — Play Again Button
- Button label: "Play Again (same category)"
- On click: fetch a fresh set of randomized questions from the same category and same count
- Reset quiz state and navigate back to `/quiz`

---

## Phase 8 — Polish & Edge Cases

**Goal:** Handle errors gracefully and ensure a smooth user experience.

### Step 8.1 — Loading & Error States
- Add loading spinners on all data-fetching calls
- Show a user-friendly error message if the API fails (e.g. "Failed to load questions. Try again.")
- Handle expired JWT: on 401 response from any protected endpoint, call `logout()` and redirect to `/login`

### Step 8.2 — Input Validation
- Backend: validate all inputs (question count 5–20, valid categoryId, answers array length matches question count)
- Frontend: disable the Play button if count is out of range, show helper text

### Step 8.3 — Score Integrity
- `correct_answer` is included in the `/api/questions` response intentionally for the per-question feedback UX
- Scoring is **always verified server-side** in `/api/quiz/submit` regardless — a user manipulating the client cannot affect the score stored in the database
- The server re-fetches `correct_answer` from the DB during submission and never trusts the client to report it

### Step 8.4 — Responsive Design
- Ensure quiz cards, answer buttons, and results layout are usable on mobile
- Test at 375px, 768px, and 1280px breakpoints

---

## Phase 9 — Final Testing & Cleanup

**Goal:** Everything works end-to-end; code is clean and ready.

### Step 9.1 — End-to-End Flow Test
Walk through the full flow manually:
1. Register a new account
2. Log in
3. Select a category + question count → Play
4. Answer all questions → Finish
5. View results page with score
6. Click Play Again → confirm new random questions load
7. Finish again → confirm historical comparison shows both attempts

### Step 9.2 — Code Cleanup
- Remove all `console.log` debug statements
- Add `.env.example` files to both `client/` and `server/` documenting required vars
- Ensure no secrets are committed (check `.gitignore`)

### Step 9.3 — README
- Add project setup instructions to the root `README.md`:
  - Prerequisites (Node, PostgreSQL)
  - How to run migrations and seed
  - How to start backend and frontend
  - Environment variable reference

---

## Summary of Build Order

```
Phase 1  →  Scaffolding & repo setup
Phase 2  →  Database schema & seed data
Phase 3  →  Auth API (register, login, JWT middleware)
Phase 4  →  Quiz API (categories, questions, submit, history)
Phase 5  →  Frontend auth (login, register, protected routes)
Phase 6  →  Frontend quiz (home, category select, quiz flow)
Phase 7  →  Frontend results (score display, comparison, play again)
Phase 8  →  Polish (errors, validation, responsive, security)
Phase 9  →  Testing & cleanup
```

Each phase produces a working, testable increment. At the end of Phase 4 you have a fully working API. At the end of Phase 7 you have a complete, functional app.
