# 🎮 MERN Tic Tac Toe with Socket.IO Online Multiplayer

A modern, full-stack **Tic Tac Toe** web application built with the **MERN** stack (MongoDB, Express.js, React 19, Node.js), real-time WebSockets via **Socket.IO**, and styled with **Tailwind CSS**.

Features JWT Authentication, personal gameplay stats, global leaderboard, paginated game history, and real-time online room-based multiplayer matching.

---

## ✨ Features

- **🌐 Socket.IO Online Multiplayer**: Real-time room creation & joining with unique 6-character room codes, copy code button, waiting lobby, live turn sync, winner/draw detection, opponent disconnect handling, and "Play Again" functionality.
- **🎮 Local & AI Player Setup**: Customizable player names for local 2-player matches.
- **🔐 JWT Authentication**: Secure user registration & login with password hashing (`bcryptjs`) and session persistence.
- **📊 Personal Statistics & Dashboard**: Win/loss/draw counts and percentage win-rate tracking.
- **🏆 Global Leaderboard**: Real-time player rankings sorted by total wins, win rate %, and total matches played.
- **📜 Game History Log**: Paginated log of completed matches with date/time stamps and winner badges.
- **🎨 Premium Dark UI**: Modern dark teal, cyan, and purple theme with dynamic micro-animations, glassmorphism, and responsive design.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Socket.IO Client
- **Backend**: Node.js, Express.js, Socket.IO Server, Mongoose, JSON Web Tokens (JWT), bcryptjs, CORS
- **Database**: MongoDB (Local or MongoDB Atlas)

---

## 📂 Final Project Structure

```text
tic-tac-toe/
├── backend/
│   ├── controllers/
│   │   ├── authController.js        # User auth (Register, Login, Me)
│   │   ├── gameController.js        # Local match logic (create, move, reset, history, stats)
│   │   ├── leaderboardController.js # Global leaderboard generation
│   │   └── userController.js        # Personal user statistics
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT Bearer token protection
│   ├── models/
│   │   ├── Game.js                  # Mongoose Game Schema & Indexes
│   │   └── User.js                  # Mongoose User Schema & bcrypt password hashing
│   ├── routes/
│   │   ├── authRoutes.js            # Auth endpoints
│   │   ├── gameRoutes.js            # Game endpoints
│   │   ├── leaderboardRoutes.js     # Leaderboard endpoints
│   │   └── userRoutes.js            # User profile/stats endpoints
│   ├── sockets/
│   │   └── gameSocket.js            # Socket.IO online room multiplayer logic
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js                    # Express & HTTP Socket.IO entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Board.jsx            # 3x3 Interactive Grid Board
│   │   │   ├── Cell.jsx             # Individual Grid Cell with SVG icons
│   │   │   ├── GameHistory.jsx      # Match history list with pagination
│   │   │   ├── Leaderboard.jsx      # Global user leaderboard table
│   │   │   ├── Login.jsx            # Authentication Login Form
│   │   │   ├── Navbar.jsx           # Responsive Top Navigation & Auth status
│   │   │   ├── OnlineGame.jsx       # Real-time Socket.IO Multiplayer Lobby & Board
│   │   │   ├── PlayerSetup.jsx      # Local player names input form
│   │   │   ├── Profile.jsx          # Authenticated User Stats & Profile Card
│   │   │   ├── Register.jsx         # User Registration Form
│   │   │   ├── Scoreboard.jsx       # Real-time Scoreboard Card
│   │   │   └── TicTacToe.jsx        # Main Dashboard Container
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global React Auth Context & State
│   │   ├── services/
│   │   │   ├── api.js               # Game & Leaderboard REST API calls
│   │   │   └── authApi.js           # Authentication & User REST API calls
│   │   ├── App.jsx                  # Main View Router & App Layout
│   │   ├── index.css                # Global CSS styles
│   │   └── main.jsx                 # Vite Entry point
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── .env.example
├── .gitignore
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tictactoe
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=your_jwt_secret_key_here
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🔌 API Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `GET` | `/api/users/me/stats` | Fetch authenticated user personal stats | Yes |
| `GET` | `/api/leaderboard` | Fetch global user leaderboard rankings | No |
| `POST` | `/api/games` | Start a new local game session | No |
| `GET` | `/api/games/:id` | Fetch game state by ID | No |
| `PUT` | `/api/games/:id/move` | Make a move (`{ index: 0-8, player: 'X'/'O' }`) | No |
| `POST` | `/api/games/:id/reset` | Reset local game board | No |
| `GET` | `/api/games/history` | Fetch paginated completed game history | No |
| `GET` | `/api/games/stats` | Fetch aggregate scoreboard stats | No |
| `GET` | `/api/health` | Backend server health check | No |

---

## ⚡ Socket.IO Overview

The online multiplayer feature uses WebSockets via Socket.IO. Below are the key events:

### Client Emits:
- `createRoom`: `{ name, userId }` - Request room creation on backend.
- `joinRoom`: `{ roomCode, name, userId }` - Request to join existing room.
- `makeMove`: `{ roomCode, index, player }` - Send turn move.
- `restartGame`: `{ roomCode }` - Request match replay in current room.
- `leaveRoom`: `{ roomCode }` - Leave current online room.

### Server Emits:
- `roomCreated`: `{ roomCode, game }` - Confirmation with generated 6-character code.
- `playerJoined`: `{ playerO }` - Emitted when opponent joins.
- `gameUpdated`: `game` - Broadcasts updated room state.
- `gameWon`: `{ winner, line, game }` - Emitted when a player wins.
- `gameDraw`: `{ game }` - Emitted when game ends in draw.
- `gameRestarted`: `game` - Emitted when players agree to play again.
- `playerDisconnected`: `{ message }` - Emitted when opponent disconnects.
- `error`: `{ message }` - Emitted on room code errors or invalid actions.

---

## 🚀 How to Run Locally

### 1. Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://localhost:27017` (or MongoDB Atlas connection string)

### 2. Backend Setup
```bash
cd backend
npm install
# Create .env file with PORT=5000 and MONGODB_URI
npm run dev
```
The backend server runs on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
# Create .env file with VITE_API_URL=http://localhost:5000/api
npm run dev
```
The frontend dev server runs on `http://localhost:5173`.

---

## 🌐 Deployment Instructions

### 1. Database Deployment (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free cluster.
2. In **Database Access**, create a database user and password.
3. In **Network Access**, add IP `0.0.0.0/0` to allow connections from anywhere.
4. Copy the connection string URI:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/tictactoe?retryWrites=true&w=majority`

### 2. Backend Deployment (Render or Railway)

#### Deploying on Render:
1. Push project repository to GitHub.
2. Log in to [Render](https://render.com) and click **New + -> Web Service**.
3. Connect your repository and select the `backend` directory as the **Root Directory**.
4. Set Build Command: `npm install`
5. Set Start Command: `node server.js`
6. Under **Environment Variables**, add:
   - `PORT`: `5000` (or leave default assigned by Render)
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
   - `CLIENT_ORIGIN`: `https://your-frontend.vercel.app`
   - `JWT_SECRET`: `<Your Strong Random Secret Key>`
7. Click **Deploy Web Service** and copy your live backend URL (e.g. `https://tictactoe-backend.onrender.com`).

### 3. Frontend Deployment (Vercel)

1. Log in to [Vercel](https://vercel.com) and click **Add New -> Project**.
2. Select your GitHub repository.
3. Choose `frontend` as the **Root Directory**.
4. Framework Preset: **Vite**.
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://your-backend.onrender.com/api`
6. Click **Deploy**. Vercel will build and provide your live application URL.
7. Update `CLIENT_ORIGIN` in backend environment variables to match your final Vercel domain.

---

## 📝 License

ISC License. Free for open source and educational use.
