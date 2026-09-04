# 🎮 Full-Stack MERN Tic Tac Toe Application

A production-ready **Tic Tac Toe** web application built with the **MERN** stack (MongoDB, Express.js, React, Node.js) and styled with **Tailwind CSS**.

The application uses the MongoDB database as the **single source of truth** for game board state, turn management, winner/draw detection, match history, and cumulative scoreboard statistics.

---

## ✨ Features

- **Backend Source of Truth**: All game moves, turn switching, and winning/draw checks are calculated and saved in MongoDB via Mongoose.
- **Live Scoreboard API**: Aggregate statistics (`xWins`, `oWins`, `draws`) calculated directly from completed match records.
- **Game History Log**: Displays recent completed matches with dates, player names, winner badges, loading skeletons, and empty states.
- **Responsive Modern UI**: Styled with Tailwind CSS, featuring glassmorphic cards and dynamic visual highlights.
- **Accessibility (a11y)**: Grid ARIA roles (`role="grid"`, `role="gridcell"`), descriptive `aria-label` tags, and full keyboard navigation support (`Enter` / `Space`).
- **Production Readiness**: CORS origin configuration, error handling, MongoDB indexing, and graceful server shutdown.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4
- **Backend**: Node.js, Express.js v5, Mongoose v9
- **Database**: MongoDB

---

## 📂 Project Structure

```text
tic-tac-toe/
├── backend/
│   ├── controllers/
│   │   └── gameController.js   # Game logic (moves, history, win/draw detection, stats)
│   ├── models/
│   │   └── Game.js             # Mongoose Game Schema & Indexing
│   ├── routes/
│   │   └── gameRoutes.js       # Express REST API routes
│   ├── server.js               # Express application entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Board.jsx       # 3x3 Grid Board component (ARIA grid)
│   │   │   ├── Cell.jsx        # Interactive Cell component (ARIA gridcell)
│   │   │   ├── GameHistory.jsx # Recent matches log component
│   │   │   ├── Scoreboard.jsx  # Live stats card component
│   │   │   └── TicTacToe.jsx   # Main container component
│   │   ├── services/
│   │   │   └── api.js          # API service helper layer (fetch)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/games` | Start a new game session |
| `GET` | `/api/games/:id` | Get current game state by ID |
| `PUT` | `/api/games/:id/move` | Make a move (`{ index: 0-8, player: 'X'/'O' }`) |
| `POST` | `/api/games/:id/reset` | Reset game board and state |
| `GET` | `/api/games/history` | Fetch recent completed games |
| `GET` | `/api/games/stats` | Fetch aggregate scoreboard stats (`xWins`, `oWins`, `draws`) |
| `GET` | `/api/health` | Backend server health check |

---

## 🚀 Setup & Installation Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance running on `mongodb://localhost:27017` or MongoDB Atlas URI)

---

### 1. Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (optional, defaults provided):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/tictactoe
   CLIENT_ORIGIN=http://localhost:5173
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend server will run at: `http://localhost:5000`

---

### 2. Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the Vite frontend development server:
   ```bash
   npm run dev
   ```
5. Open your browser and visit: `http://localhost:5173`

---

## 📝 License

ISC License. Free for open source use.
