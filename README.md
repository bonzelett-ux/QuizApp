# Trivia Quiz Web App

A full-stack trivia quiz application with category selection, scored quizzes, and historical comparisons.

## Project Structure

- `/server`: Express backend
- `/client`: React (Vite) frontend

## Getting Started

### Prerequisites
- Node.js (v16+)
- MySQL database server running locally or accessible remotely.

### Database Setup
1. Create a MySQL database named `trivia_db`.
2. Configure `.env` files in both client and server directories:
   - In `/server`, copy `.env.example` to `.env` and adjust the MySQL details.
   - In `/client`, copy `.env.example` to `.env` and verify the `VITE_API_URL`.
3. To automatically run migrations and populate the database with 1,002 questions across 10 categories:
   ```bash
   cd server
   node seeds/seed.js
   ```

### Running the Application

#### 1. Start the Backend Server
```bash
cd server
node src/index.js
```
The server will run on `http://localhost:4000`.

#### 2. Start the Frontend Client
```bash
cd client
node node_modules/vite/bin/vite.js
```
The client will be served at `http://localhost:5173/`.

### Tech Stack
- **Frontend:** React, React Router, Axios, HSL CSS variables, glassmorphic layout.
- **Backend:** Node.js, Express, MySQL, JWT authentication, bcrypt password hashing.

