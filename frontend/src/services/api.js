// API base URL configured from Vite environment variables with fallback
const API_BASE_URL = (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:5000/api';

/**
 * Helper to execute fetch requests with clean network error messages
 */
async function safeFetch(url, options = {}) {
  try {
    return await fetch(url, options);
  } catch (err) {
    if (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('NetworkError')) {
      throw new Error('Unable to connect to backend server. Please verify your connection or backend server status.');
    }
    throw err;
  }
}

// Helper function to build headers with Authorization Bearer token if present
function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('tictactoe_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Start a new game session
 * POST /api/games
 */
export async function createGame(playerX = 'Player X', playerO = 'Player O') {
  const response = await safeFetch(`${API_BASE_URL}/games`, {
    method: 'POST',
    headers: getAuthHeaders(),
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
  const response = await safeFetch(`${API_BASE_URL}/games/${gameId}`, {
    headers: getAuthHeaders()
  });
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
  const response = await safeFetch(`${API_BASE_URL}/games/${gameId}/move`, {
    method: 'PUT',
    headers: getAuthHeaders(),
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
  const response = await safeFetch(`${API_BASE_URL}/games/${gameId}/reset`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({})
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to reset game');
  }
  return data.data;
}

/**
 * Fetch paginated completed game history
 * GET /api/games/history?page=1&limit=5
 */
export async function getGameHistory(page = 1, limit = 5) {
  const response = await safeFetch(`${API_BASE_URL}/games/history?page=${page}&limit=${limit}`, {
    headers: getAuthHeaders()
  });
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
  const response = await safeFetch(`${API_BASE_URL}/games/stats`, {
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch game statistics');
  }
  return data.data;
}

/**
 * Fetch global registered users leaderboard
 * GET /api/leaderboard
 */
export async function getLeaderboard() {
  const response = await safeFetch(`${API_BASE_URL}/leaderboard`);
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch global leaderboard');
  }
  return data.data;
}

