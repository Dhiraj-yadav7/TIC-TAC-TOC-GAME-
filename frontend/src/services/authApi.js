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

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function registerUser({ name, email, password }) {
  const response = await safeFetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to register. Please try again.');
  }

  return data;
}

/**
 * Login existing user
 * POST /api/auth/login
 */
export async function loginUser({ email, password }) {
  const response = await safeFetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Invalid email or password.');
  }

  return data;
}

/**
 * Fetch current user profile
 * GET /api/auth/me
 */
export async function getMe(token) {
  if (!token) throw new Error('No authentication token provided');

  const response = await safeFetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Session expired. Please log in again.');
  }

  return data.user;
}

/**
 * Fetch authenticated user personal statistics
 * GET /api/users/me/stats
 */
export async function getUserStats(token) {
  if (!token) throw new Error('No authentication token provided');

  const response = await safeFetch(`${API_BASE_URL}/users/me/stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch personal statistics');
  }

  return data.data;
}

