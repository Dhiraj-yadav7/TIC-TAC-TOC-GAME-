import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import Board from './Board';

const SOCKET_SERVER_URL =
  import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000';

export default function OnlineGame() {
  const { user } = useAuth();
  const socketRef = useRef(null);

  // Connection & Room state
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connected' | 'disconnected' | 'reconnecting'
  const [lobbyMode, setLobbyMode] = useState('create'); // 'create' | 'join'
  const [roomCode, setRoomCode] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [inLobby, setInLobby] = useState(true);

  // Online Game State from Socket Server
  const [game, setGame] = useState(null);
  const [mySymbol, setMySymbol] = useState(null); // 'X' | 'O'
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [copied, setCopied] = useState(false);

  // Initialize Socket.IO connection
  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectionStatus('connected');
      setError(null);
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    socket.on('reconnect_attempt', () => {
      setConnectionStatus('reconnecting');
    });

    socket.on('error', ({ message }) => {
      setError(message || 'An online game error occurred.');
    });

    socket.on('roomCreated', ({ roomCode: code, game: initialGame }) => {
      setRoomCode(code);
      setGame(initialGame);
      setMySymbol('X');
      setInLobby(false);
      setInfoMessage('Room created successfully! Share your 6-character code with your opponent.');
    });

    socket.on('playerJoined', ({ playerO }) => {
      setInfoMessage(`🎮 ${playerO?.name || 'Player O'} joined! Game start!`);
    });

    socket.on('gameUpdated', (updatedGame) => {
      setGame(updatedGame);
      if (socket.id === updatedGame?.playerX?.socketId) {
        setMySymbol('X');
      } else if (socket.id === updatedGame?.playerO?.socketId) {
        setMySymbol('O');
      }
    });

    socket.on('gameWon', ({ winner, game: finalGame }) => {
      setGame(finalGame);
      const winnerName = winner === 'X' ? finalGame.playerX?.name : finalGame.playerO?.name;
      setInfoMessage(`🎉 ${winnerName || `Player ${winner}`} won the match!`);
    });

    socket.on('gameDraw', ({ game: finalGame }) => {
      setGame(finalGame);
      setInfoMessage("🤝 Match ended in a Draw!");
    });

    socket.on('gameRestarted', (restartedGame) => {
      setGame(restartedGame);
      setError(null);
      setInfoMessage("⚡ New round started! Play your moves.");
    });

    socket.on('playerDisconnected', ({ message }) => {
      setInfoMessage(`⚠️ ${message || 'Opponent disconnected from room.'}`);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Handle Create Online Room
  const handleCreateRoom = () => {
    setError(null);
    setInfoMessage(null);
    if (!socketRef.current) return;
    socketRef.current.emit('createRoom', {
      name: user?.name || 'Player X',
      userId: user?._id || null
    });
  };

  // Handle Join Online Room
  const handleJoinRoom = (e) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const cleanCode = joinCodeInput.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 6) {
      setError('Please enter a valid 6-character room code.');
      return;
    }

    if (!socketRef.current) return;

    socketRef.current.emit('joinRoom', {
      roomCode: cleanCode,
      name: user?.name || 'Player O',
      userId: user?._id || null
    });
    setRoomCode(cleanCode);
    setMySymbol('O');
    setInLobby(false);
  };

  // Handle Board Cell Click
  const handleCellClick = (index) => {
    if (!game || game.status !== 'playing' || game.currentPlayer !== mySymbol) return;

    setError(null);
    socketRef.current.emit('makeMove', {
      roomCode: game.roomCode,
      index,
      player: mySymbol
    });
  };

  // Handle Play Again (New Game in same room)
  const handlePlayAgain = () => {
    if (!socketRef.current || !roomCode) return;
    setError(null);
    socketRef.current.emit('restartGame', { roomCode });
  };

  // Handle Leave Game
  const handleLeaveRoom = () => {
    if (socketRef.current && game?.roomCode) {
      socketRef.current.emit('leaveRoom', { roomCode: game.roomCode });
    }
    setGame(null);
    setRoomCode('');
    setMySymbol(null);
    setInLobby(true);
    setError(null);
    setInfoMessage(null);
  };

  // Copy Room Code helper
  const handleCopyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Connection badge color
  const statusBadge =
    connectionStatus === 'connected' ? (
      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        Connected
      </span>
    ) : connectionStatus === 'reconnecting' ? (
      <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        Reconnecting...
      </span>
    ) : (
      <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        Disconnected
      </span>
    );

  return (
    <div className="w-full max-w-xl bg-teal-900/60 backdrop-blur-md rounded-3xl border border-teal-700/40 shadow-2xl p-5 sm:p-8 text-slate-100 flex flex-col items-center my-4 transition-all z-10">
      {/* Header & Real-time Connection Status */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 mb-5 pb-4 border-b border-teal-800/50">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-teal-500 flex items-center justify-center text-xl shadow-lg shadow-purple-950/40">
            🌐
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-teal-200 tracking-tight">
              Online Multiplayer
            </h2>
            <p className="text-xs text-teal-300/70">Socket.IO Real-Time Rooms</p>
          </div>
        </div>
        {statusBadge}
      </div>

      {/* Error & Notification Banners */}
      {error && (
        <div className="w-full mb-4 p-3.5 rounded-2xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs sm:text-sm flex items-center justify-between gap-2 shadow-lg backdrop-blur-md">
          <span>⚠️ {error}</span>
          <button
            onClick={() => setError(null)}
            type="button"
            className="text-red-400 hover:text-white font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {infoMessage && (
        <div className="w-full mb-4 p-3.5 rounded-2xl bg-teal-950/80 border border-teal-500/60 text-teal-200 text-xs sm:text-sm flex items-center justify-between gap-2 shadow-lg backdrop-blur-md">
          <span>{infoMessage}</span>
          <button
            onClick={() => setInfoMessage(null)}
            type="button"
            className="text-teal-400 hover:text-white font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Lobby View vs Active Room View */}
      {inLobby ? (
        <div className="w-full flex flex-col items-center">
          {/* Lobby Option Selector Tabs */}
          <div className="flex items-center justify-center p-1 bg-teal-950/80 rounded-2xl border border-teal-800/60 mb-6 w-full max-w-sm">
            <button
              onClick={() => setLobbyMode('create')}
              type="button"
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                lobbyMode === 'create'
                  ? 'bg-teal-700/90 text-teal-100 shadow-md border border-teal-500/40'
                  : 'text-teal-300/70 hover:text-teal-100'
              }`}
            >
              ➕ Create Game
            </button>
            <button
              onClick={() => setLobbyMode('join')}
              type="button"
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                lobbyMode === 'join'
                  ? 'bg-purple-700/90 text-purple-100 shadow-md border border-purple-400/40'
                  : 'text-teal-300/70 hover:text-teal-100'
              }`}
            >
              🎮 Join Game
            </button>
          </div>

          {lobbyMode === 'create' ? (
            /* Create Room Card */
            <div className="w-full bg-teal-950/70 border border-teal-800/60 p-6 rounded-3xl text-center space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-full bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-2xl mx-auto">
                🏠
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-teal-100">Host New Room</h3>
                <p className="text-xs text-teal-300/70 mt-1 max-w-xs mx-auto">
                  Create a private match room. You will play as <strong className="text-teal-300">Player X</strong>.
                </p>
              </div>

              <div className="p-3 bg-teal-900/50 rounded-2xl border border-teal-800/40 text-xs text-teal-300">
                Logged in as: <span className="font-bold text-teal-100">{user?.name || 'Player X'}</span>
              </div>

              <button
                onClick={handleCreateRoom}
                type="button"
                disabled={connectionStatus !== 'connected'}
                className="w-full py-3.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-400 hover:to-emerald-400 active:scale-[0.98] text-teal-950 font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-teal-950/60 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ➕ Create Room & Get Code
              </button>
            </div>
          ) : (
            /* Join Room Card */
            <form
              onSubmit={handleJoinRoom}
              className="w-full bg-teal-950/70 border border-teal-800/60 p-6 rounded-3xl space-y-4 shadow-xl text-center"
            >
              <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-2xl mx-auto">
                🔑
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-purple-200">Join Room</h3>
                <p className="text-xs text-teal-300/70 mt-1 max-w-xs mx-auto">
                  Enter opponent's 6-character room code. You will play as <strong className="text-purple-300">Player O</strong>.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-teal-300/80 uppercase tracking-widest mb-1.5 text-left">
                  Enter 6-Character Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. AB12CD"
                  disabled={connectionStatus !== 'connected'}
                  className="w-full px-4 py-3.5 rounded-2xl bg-teal-900/80 border border-teal-700/60 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 focus:outline-none text-center tracking-widest font-mono text-xl font-black uppercase text-teal-100 placeholder-teal-600/70 transition-all disabled:opacity-50"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={connectionStatus !== 'connected' || !joinCodeInput.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-purple-950/60 transition-all cursor-pointer disabled:opacity-50 border border-purple-400/30"
              >
                🎮 Join Game Room
              </button>
            </form>
          )}
        </div>
      ) : (
        /* Room Game Active View */
        <div className="w-full flex flex-col items-center">
          {/* Room Code Display & Copy Button */}
          <div className="w-full bg-teal-950/90 border border-teal-800/70 p-4 rounded-2xl flex items-center justify-between mb-5 shadow-inner">
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-teal-400/90 font-bold uppercase tracking-wider">
                Room Code:
              </span>
              <span className="font-mono font-black text-xl text-teal-100 tracking-widest bg-teal-900/90 px-3 py-1 rounded-xl border border-teal-700/50">
                {roomCode}
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              type="button"
              className="px-3.5 py-1.5 bg-teal-800 hover:bg-teal-700 active:scale-95 text-teal-100 text-xs font-bold rounded-xl border border-teal-600/50 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              {copied ? '✓ Copied!' : '📋 Copy Code'}
            </button>
          </div>

          {/* Player X & Player O Info Display */}
          <div className="w-full grid grid-cols-2 gap-3 mb-4">
            {/* Player X Banner */}
            <div
              className={`p-3.5 rounded-2xl border text-center transition-all ${
                game?.currentPlayer === 'X' && game?.status === 'playing'
                  ? 'bg-teal-500/20 border-teal-400/80 text-teal-100 shadow-lg shadow-teal-500/20 scale-[1.02]'
                  : 'bg-teal-950/60 border-teal-800/40 text-teal-300/70'
              }`}
            >
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                <span className="text-[11px] uppercase font-extrabold text-teal-300">
                  Player X {mySymbol === 'X' ? '(You)' : ''}
                </span>
              </div>
              <span className="font-bold text-sm truncate block text-teal-100">
                {game?.playerX?.name || 'Player X'}
              </span>
            </div>

            {/* Player O Banner */}
            <div
              className={`p-3.5 rounded-2xl border text-center transition-all ${
                game?.currentPlayer === 'O' && game?.status === 'playing'
                  ? 'bg-purple-500/20 border-purple-400/80 text-purple-100 shadow-lg shadow-purple-500/20 scale-[1.02]'
                  : 'bg-teal-950/60 border-teal-800/40 text-teal-300/70'
              }`}
            >
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span className="text-[11px] uppercase font-extrabold text-purple-300">
                  Player O {mySymbol === 'O' ? '(You)' : ''}
                </span>
              </div>
              <span className="font-bold text-sm truncate block text-purple-100">
                {game?.playerO ? game.playerO.name : 'Waiting for opponent...'}
              </span>
            </div>
          </div>

          {/* Turn / Game Status Display */}
          <div className="w-full mb-5">
            <div
              className={`py-3 px-5 rounded-2xl border text-center font-extrabold text-sm sm:text-base tracking-wide transition-all backdrop-blur-md shadow-md ${
                game?.status === 'waiting'
                  ? 'bg-amber-950/60 border-amber-600/50 text-amber-200 animate-pulse'
                  : game?.status === 'playing'
                  ? game?.currentPlayer === mySymbol
                    ? 'bg-teal-500/20 text-teal-200 border-teal-400/60 shadow-teal-500/20'
                    : 'bg-purple-950/60 text-purple-200 border-purple-500/40'
                  : game?.status === 'won'
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/60 shadow-emerald-500/30 animate-bounce'
                  : game?.status === 'draw'
                  ? 'bg-amber-500/20 text-amber-200 border-amber-400/60'
                  : 'bg-teal-950/70 text-teal-200 border-teal-800/50'
              }`}
            >
              {game?.status === 'waiting'
                ? '⏳ Waiting for opponent to join using room code...'
                : game?.status === 'playing'
                ? game?.currentPlayer === mySymbol
                  ? '⚡ Your Turn!'
                  : `⏳ Opponent (${game?.currentPlayer})'s Turn...`
                : game?.status === 'won'
                ? `🏆 ${game?.winner === 'X' ? game?.playerX?.name : game?.playerO?.name} Wins!`
                : game?.status === 'draw'
                ? "🤝 Match Ended in a Draw!"
                : 'Match Status: Ended'}
            </div>
          </div>

          {/* Interactive Game Board */}
          <Board
            board={game?.board || Array(9).fill('')}
            onCellClick={handleCellClick}
            winningLine={game?.winningLine || []}
            isGameOver={game?.status !== 'playing' || game?.currentPlayer !== mySymbol}
            isXNext={game?.currentPlayer === 'X'}
          />

          {/* Action Buttons: Play Again & Leave Room */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 z-10 w-full justify-center">
            {(game?.status === 'won' || game?.status === 'draw') && (
              <button
                onClick={handlePlayAgain}
                type="button"
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-purple-950/50 transition-all cursor-pointer border border-purple-400/30 flex items-center justify-center gap-2"
              >
                🔄 Play Again
              </button>
            )}

            <button
              onClick={handleLeaveRoom}
              type="button"
              className="w-full sm:w-auto px-6 py-3 bg-red-900/40 hover:bg-red-800/80 active:scale-95 text-red-200 hover:text-white font-bold text-xs sm:text-sm rounded-2xl border border-red-700/40 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              🚪 Leave Room
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
