import { useState, useEffect, useRef, useCallback } from 'react';
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
      setInfoMessage('Room created! Share your code with an opponent to start playing.');
    });

    socket.on('playerJoined', ({ playerO }) => {
      setInfoMessage(`${playerO?.name || 'Player O'} joined the game! Match started.`);
    });

    socket.on('gameUpdated', (updatedGame) => {
      setGame(updatedGame);
      // Synchronize player symbol
      if (socket.id === updatedGame?.playerX?.socketId) {
        setMySymbol('X');
      } else if (socket.id === updatedGame?.playerO?.socketId) {
        setMySymbol('O');
      }
    });

    socket.on('gameWon', ({ winner, line, game: finalGame }) => {
      setGame(finalGame);
      const winnerName = winner === 'X' ? finalGame.playerX?.name : finalGame.playerO?.name;
      setInfoMessage(`🎉 ${winnerName || `Player ${winner}`} won the match!`);
    });

    socket.on('gameDraw', ({ game: finalGame }) => {
      setGame(finalGame);
      setInfoMessage("🤝 The game ended in a Draw!");
    });

    socket.on('playerDisconnected', ({ message }) => {
      setInfoMessage(`⚠️ ${message || 'Opponent left the room.'}`);
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
    if (!cleanCode) {
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
      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        Connected
      </span>
    ) : connectionStatus === 'reconnecting' ? (
      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        Reconnecting...
      </span>
    ) : (
      <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[11px] font-bold flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        Disconnected
      </span>
    );

  return (
    <div className="w-full max-w-lg bg-teal-900/60 backdrop-blur-md rounded-3xl border border-teal-700/40 shadow-2xl p-5 sm:p-8 text-slate-100 flex flex-col items-center my-4 transition-all">
      {/* Header & Connection Badge */}
      <div className="w-full flex items-center justify-between mb-5 pb-3 border-b border-teal-800/50">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌐</span>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-teal-200">
              Online Multiplayer
            </h2>
            <p className="text-xs text-teal-300/70">Real-time Socket.IO match</p>
          </div>
        </div>
        {statusBadge}
      </div>

      {/* Error & Info Banners */}
      {error && (
        <div className="w-full mb-4 p-3.5 rounded-2xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs sm:text-sm flex items-center gap-2 shadow-md">
          <span>⚠️ {error}</span>
        </div>
      )}

      {infoMessage && (
        <div className="w-full mb-4 p-3.5 rounded-2xl bg-teal-950/80 border border-teal-500/50 text-teal-200 text-xs sm:text-sm flex items-center justify-between gap-2 shadow-md">
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

      {/* Lobby View vs Room Game View */}
      {inLobby ? (
        <div className="w-full space-y-6">
          {/* Create Room Box */}
          <div className="bg-teal-950/70 border border-teal-800/60 p-5 rounded-2xl text-center space-y-3 shadow-md">
            <h3 className="text-lg font-bold text-teal-200">Host New Game Room</h3>
            <p className="text-xs text-teal-300/70">
              Generate a unique room code and invite your opponent.
            </p>
            <button
              onClick={handleCreateRoom}
              type="button"
              disabled={connectionStatus !== 'connected'}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 active:scale-[0.98] text-teal-950 font-extrabold text-sm sm:text-base rounded-2xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              ➕ Create Game Room (Player X)
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-teal-800/50" />
            <span className="text-xs text-teal-400 font-bold uppercase tracking-wider">OR</span>
            <div className="flex-1 h-px bg-teal-800/50" />
          </div>

          {/* Join Room Box */}
          <form
            onSubmit={handleJoinRoom}
            className="bg-teal-950/70 border border-teal-800/60 p-5 rounded-2xl space-y-3.5 shadow-md"
          >
            <h3 className="text-lg font-bold text-teal-200 text-center">Join Existing Room</h3>
            <div>
              <label className="block text-xs font-bold text-teal-300/80 uppercase tracking-wider mb-1.5">
                6-Character Room Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. AB12CD"
                disabled={connectionStatus !== 'connected'}
                className="w-full px-4 py-3 rounded-2xl bg-teal-900/80 border border-teal-700/60 focus:border-purple-400 focus:outline-none text-center tracking-widest font-mono text-lg font-bold uppercase text-teal-100 placeholder-teal-600 transition-all disabled:opacity-50"
                required
              />
            </div>
            <button
              type="submit"
              disabled={connectionStatus !== 'connected' || !joinCodeInput.trim()}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg shadow-purple-950/50 transition-all cursor-pointer disabled:opacity-50 border border-purple-400/30"
            >
              🎮 Join Game Room (Player O)
            </button>
          </form>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          {/* Room Header Code Display */}
          <div className="w-full bg-teal-950/80 border border-teal-800/60 p-3.5 rounded-2xl flex items-center justify-between mb-5 shadow-inner">
            <div className="flex items-center gap-2">
              <span className="text-xs text-teal-400 font-bold uppercase tracking-wider">
                Room Code:
              </span>
              <span className="font-mono font-black text-lg text-teal-100 tracking-widest">
                {roomCode}
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              type="button"
              className="px-3 py-1 bg-teal-900 hover:bg-teal-800 text-teal-200 hover:text-white text-xs font-bold rounded-xl border border-teal-700/50 transition-all cursor-pointer"
            >
              {copied ? '✓ Copied' : '📋 Copy Code'}
            </button>
          </div>

          {/* Players Info Banner */}
          <div className="w-full grid grid-cols-2 gap-3 mb-4">
            <div
              className={`p-3 rounded-2xl border text-center transition-all ${
                game?.currentPlayer === 'X' && game?.status === 'playing'
                  ? 'bg-teal-500/20 border-teal-400/80 text-teal-100 shadow-lg shadow-teal-500/10'
                  : 'bg-teal-950/50 border-teal-800/40 text-teal-300/70'
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-teal-400 block mb-0.5">
                Player X {mySymbol === 'X' ? '(You)' : ''}
              </span>
              <span className="font-bold text-sm truncate block">
                {game?.playerX?.name || 'Player X'}
              </span>
            </div>

            <div
              className={`p-3 rounded-2xl border text-center transition-all ${
                game?.currentPlayer === 'O' && game?.status === 'playing'
                  ? 'bg-purple-500/20 border-purple-400/80 text-purple-100 shadow-lg shadow-purple-500/10'
                  : 'bg-teal-950/50 border-teal-800/40 text-teal-300/70'
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-purple-400 block mb-0.5">
                Player O {mySymbol === 'O' ? '(You)' : ''}
              </span>
              <span className="font-bold text-sm truncate block">
                {game?.playerO ? game.playerO.name : 'Waiting for opponent...'}
              </span>
            </div>
          </div>

          {/* Turn / Game Status Banner */}
          <div className="w-full mb-5">
            <div className="py-2.5 px-4 rounded-xl bg-teal-950/70 border border-teal-800/50 text-center font-extrabold text-sm sm:text-base text-teal-200">
              {game?.status === 'waiting'
                ? '⏳ Waiting for opponent to join using room code...'
                : game?.status === 'playing'
                ? game?.currentPlayer === mySymbol
                  ? '⚡ Your Turn!'
                  : `⏳ Opponent (${game?.currentPlayer})'s Turn...`
                : game?.status === 'won'
                ? `🏆 ${game?.winner === 'X' ? game?.playerX?.name : game?.playerO?.name} Wins!`
                : game?.status === 'draw'
                ? "🤝 It's a Draw!"
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

          {/* Leave Room Button */}
          <button
            onClick={handleLeaveRoom}
            type="button"
            className="mt-6 px-6 py-2.5 bg-red-900/40 hover:bg-red-800/80 text-red-200 hover:text-white font-bold text-xs sm:text-sm rounded-2xl border border-red-700/40 transition-all cursor-pointer"
          >
            🚪 Leave Room
          </button>
        </div>
      )}
    </div>
  );
}
