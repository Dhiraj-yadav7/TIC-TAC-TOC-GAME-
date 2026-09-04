// API base URL configured from Vite environment variables with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Start a new game session
 * POST /api/games
 */
export async function createGame(playerX = 'Player X', playerO = 'Player O') {
  const response = await fetch(`${API_BASE_URL}/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerX, playerO })
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to create a new game session');
  }
  return data.data;
}

/**
 * Retrieve current game state by ID
 * GET /api/games/:id
 */
export async function getGame(gameId) {
  const response = await fetch(`${API_BASE_URL}/games/${gameId}`);
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch game state');
  }
  return data.data;
}

/**
 * Send player move to the backend
 * PUT /api/games/:id/move
 */
export async function makeMove(gameId, index, player) {
  const response = await fetch(`${API_BASE_URL}/games/${gameId}/move`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ index, player })
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to record move');
  }
  return data.data;
}

/**
 * Reset game board and state on the backend
 * POST /api/games/:id/reset
 */
export async function resetGame(gameId) {
  const response = await fetch(`${API_BASE_URL}/games/${gameId}/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to reset game');
  }
  return data.data;
}

/**
 * Fetch recent completed game history
 * GET /api/games/history
 */
export async function getGameHistory(limit = 10) {
  const response = await fetch(`${API_BASE_URL}/games/history?limit=${limit}`);
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch game history');
  }
  return data.data;
}

/**
 * Fetch aggregate game scoreboard statistics
 * GET /api/games/stats
 */
export async function getGameStats() {
  const response = await fetch(`${API_BASE_URL}/games/stats`);
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch game statistics');
  }
  return data.data;
}
