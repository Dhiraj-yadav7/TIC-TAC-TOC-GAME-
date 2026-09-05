import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import TicTacToe from './components/TicTacToe';
import GameHistory from './components/GameHistory';
import Profile from './components/Profile';
import Leaderboard from './components/Leaderboard';
import OnlineGame from './components/OnlineGame';
import { getGameHistory } from './services/api';

function AppContent() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('game');

  // Dedicated history state when viewing history tab directly
  const [standaloneHistory, setStandaloneHistory] = useState({
    games: [],
    currentPage: 1,
    totalPages: 1,
    totalGames: 0
  });
  const [standalonePage, setStandalonePage] = useState(1);
  const [standaloneLoading, setStandaloneLoading] = useState(false);
  const [standaloneError, setStandaloneError] = useState(null);

  // Synchronize active tab with authentication status
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated && activeTab !== 'login' && activeTab !== 'register') {
        setActiveTab('login');
      } else if (isAuthenticated && (activeTab === 'login' || activeTab === 'register')) {
        setActiveTab('game');
      }
    }
  }, [isAuthenticated, authLoading, activeTab]);

  // Fetch history for standalone history tab
  const fetchStandaloneHistory = async (page = 1) => {
    try {
      setStandaloneLoading(true);
      setStandaloneError(null);
      const data = await getGameHistory(page, 5);
      setStandaloneHistory(data || { games: [], currentPage: 1, totalPages: 1, totalGames: 0 });
      setStandalonePage(data?.currentPage || page);
    } catch (err) {
      setStandaloneError(err.message || 'Failed to fetch game history.');
    } finally {
      setStandaloneLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === 'history') {
      fetchStandaloneHistory(standalonePage);
    }
  }, [isAuthenticated, activeTab]);

  // Show full-screen loader while restoring auth session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-950 via-teal-900 to-emerald-950 text-slate-100 flex flex-col items-center justify-center p-4 select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-teal-200 text-sm font-semibold tracking-wider">
            Loading Tic Tac Toe...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-950 via-teal-900 to-emerald-950 text-slate-100 flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* Navbar Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 z-10">
        {!isAuthenticated ? (
          activeTab === 'register' ? (
            <Register
              onSwitchToLogin={() => setActiveTab('login')}
              onSuccess={() => setActiveTab('game')}
            />
          ) : (
            <Login
              onSwitchToRegister={() => setActiveTab('register')}
              onSuccess={() => setActiveTab('game')}
            />
          )
        ) : (
          <>
            {activeTab === 'game' && <TicTacToe />}

            {activeTab === 'online' && <OnlineGame />}

            {activeTab === 'history' && (
              <div className="flex flex-col items-center w-full">
                <GameHistory
                  historyData={standaloneHistory}
                  loading={standaloneLoading}
                  error={standaloneError}
                  onRefresh={() => fetchStandaloneHistory(standalonePage)}
                  onPageChange={(p) => {
                    setStandalonePage(p);
                    fetchStandaloneHistory(p);
                  }}
                />
              </div>
            )}

            {activeTab === 'leaderboard' && <Leaderboard />}

            {activeTab === 'profile' && (
              <Profile onStartGame={() => setActiveTab('game')} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
