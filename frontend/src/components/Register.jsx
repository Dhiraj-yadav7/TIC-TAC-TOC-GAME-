import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Register({ onSwitchToLogin, onSuccess }) {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Client-side form validation
    if (!name.trim()) {
      setFormError('Please enter your full name');
      return;
    }
    if (!email.trim()) {
      setFormError('Please enter your email address');
      return;
    }
    if (!password || password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    try {
      setIsSubmitting(true);
      await register(name.trim(), email.trim(), password);
      if (onSuccess) onSuccess();
    } catch (err) {
      setFormError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-teal-900/60 backdrop-blur-md rounded-3xl border border-teal-700/40 shadow-2xl p-6 sm:p-8 text-slate-100 transition-all">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-teal-200 tracking-tight">
          Create Account
        </h2>
        <p className="text-teal-300/70 text-xs sm:text-sm mt-1">
          Join Tic Tac Toe to save your scores & gameplay history
        </p>
      </div>

      {formError && (
        <div className="mb-5 p-3.5 rounded-2xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs sm:text-sm flex items-center gap-2 shadow-md">
          <span>⚠️ {formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-teal-200 uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-2xl bg-teal-950/70 border border-teal-700/60 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/30 text-teal-100 placeholder-teal-600 text-sm transition-all disabled:opacity-50"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-teal-200 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-2xl bg-teal-950/70 border border-teal-700/60 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/30 text-teal-100 placeholder-teal-600 text-sm transition-all disabled:opacity-50"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-teal-200 uppercase tracking-wider mb-1.5">
            Password (Min 6 chars)
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-2xl bg-teal-950/70 border border-teal-700/60 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/30 text-teal-100 placeholder-teal-600 text-sm transition-all disabled:opacity-50"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-teal-200 uppercase tracking-wider mb-1.5">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-2xl bg-teal-950/70 border border-teal-700/60 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/30 text-teal-100 placeholder-teal-600 text-sm transition-all disabled:opacity-50"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg shadow-purple-950/50 transition-all cursor-pointer border border-purple-400/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating Account...
            </>
          ) : (
            'Register'
          )}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-teal-800/50 text-center text-xs sm:text-sm text-teal-300/70">
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          type="button"
          className="text-teal-200 font-bold hover:underline cursor-pointer"
        >
          Log in here
        </button>
      </div>
    </div>
  );
}
