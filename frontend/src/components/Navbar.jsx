import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="w-full bg-teal-950/80 backdrop-blur-md border-b border-teal-800/50 text-slate-100 sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div
          onClick={() => setActiveTab(isAuthenticated ? 'game' : 'login')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center font-black text-teal-950 text-lg shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
            ✕◯
          </div>
          <div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-200 via-emerald-100 to-teal-300">
              Tic Tac Toe
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-widest text-teal-400/70 bg-teal-900/60 px-2 py-0.5 rounded-full border border-teal-700/40">
              JWT MERN
            </span>
          </div>
        </div>

        {/* Navigation Tabs (when authenticated) */}
        {isAuthenticated && (
          <div className="flex items-center gap-1 sm:gap-2 bg-teal-900/60 p-1 rounded-2xl border border-teal-800/60">
            <button
              onClick={() => setActiveTab('game')}
              type="button"
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'game'
                  ? 'bg-teal-700/80 text-teal-100 shadow-md border border-teal-500/40'
                  : 'text-teal-300/70 hover:text-teal-100'
              }`}
            >
              🎮 Game
            </button>
            <button
              onClick={() => setActiveTab('history')}
              type="button"
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-teal-700/80 text-teal-100 shadow-md border border-teal-500/40'
                  : 'text-teal-300/70 hover:text-teal-100'
              }`}
            >
              📜 History
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              type="button"
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-teal-700/80 text-teal-100 shadow-md border border-teal-500/40'
                  : 'text-teal-300/70 hover:text-teal-100'
              }`}
            >
              👤 Profile
            </button>
          </div>
        )}

        {/* Auth User Info & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden xs:flex flex-col items-end">
                <span className="text-xs sm:text-sm font-bold text-teal-200 leading-tight">
                  {user?.name || 'User'}
                </span>
                <span className="text-[10px] text-teal-400/60 font-medium">
                  {user?.email}
                </span>
              </div>
              <button
                onClick={() => {
                  logout();
                  setActiveTab('login');
                }}
                type="button"
                className="px-3 sm:px-4 py-1.5 bg-red-900/40 hover:bg-red-800/80 text-red-200 hover:text-white text-xs font-bold rounded-xl border border-red-700/40 transition-all cursor-pointer flex items-center gap-1.5"
                title="Log out of session"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('login')}
                type="button"
                className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-teal-700/80 text-teal-100 border border-teal-500/40 shadow-md'
                    : 'text-teal-300 hover:text-teal-100'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setActiveTab('register')}
                type="button"
                className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md border border-purple-400/30 transition-all cursor-pointer"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
