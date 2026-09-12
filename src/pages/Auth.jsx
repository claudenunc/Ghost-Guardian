import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { Button, GhostMark } from '../components/guardian/atoms';
import { useGuardian } from '../lib/store';

export default function Auth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { isAuthenticated, signIn, register } = useGuardian();
  const next = params.get('next') || '/app';

  const [activeTab, setActiveTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate(next, { replace: true });
  }, [isAuthenticated, navigate, next]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      await signIn({ email: email.trim(), password });
      navigate(next, { replace: true });
    } catch (err) {
      setError(err.message || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password) {
      setError('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const result = await register({ name: name.trim(), email: email.trim(), password });
      if (result?.requiresEmailConfirmation) {
        setInfo('Almost there — check your inbox and confirm your email, then sign in.');
        setActiveTab('signin');
        setPassword('');
        setConfirmPassword('');
        return;
      }
      navigate('/app', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-4 py-3 text-white font-mono text-sm focus:border-[#0200F1] focus:outline-none transition-colors placeholder:text-white/25';

  return (
    <main className="public-page min-h-screen ghost-aurora text-[#f4f6fb]">
      <section className="public-card ghost-panel" style={{ maxWidth: 440, width: '100%' }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <GhostMark />
          <div>
            <p className="text-xs uppercase tracking-widest text-[#4de1dc]">Access boundary</p>
            <h1 className="font-display text-2xl text-white">Ghost Guardian</h1>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 mb-6 bg-[#0a0a0a] rounded-lg p-1 border border-white/10">
          <button
            type="button"
            onClick={() => { setActiveTab('signin'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-xs font-mono uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === 'signin'
                ? 'bg-[#0200F1]/20 text-[#0200F1] border border-[#0200F1]/40 shadow-[0_0_12px_rgba(2,0,241,0.2)]'
                : 'text-[#a0a0a0] hover:text-white border border-transparent'
            }`}
          >
            <LogIn size={14} />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-xs font-mono uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-[#0200F1]/20 text-[#0200F1] border border-[#0200F1]/40 shadow-[0_0_12px_rgba(2,0,241,0.2)]'
                : 'text-[#a0a0a0] hover:text-white border border-transparent'
            }`}
          >
            <UserPlus size={14} />
            Create Account
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 rounded-lg bg-[#FF1400]/10 border border-[#FF1400]/30 text-[#FF1400] text-xs font-mono mb-4 animate-in fade-in">
            {error}
          </div>
        )}

        {/* Info Display (e.g. confirm your email) */}
        {info && (
          <div className="p-3 rounded-lg bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66] text-xs font-mono mb-4 animate-in fade-in">
            {info}
          </div>
        )}

        {/* Sign In Form */}
        {activeTab === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-[#a0a0a0] uppercase tracking-wider">
                Email <span className="text-[#FF1400]">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-[#a0a0a0] uppercase tracking-wider">
                Password <span className="text-[#FF1400]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} pr-11`}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0a0a0] hover:text-white transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full justify-center text-xs font-mono uppercase tracking-widest py-3 cursor-pointer shadow-[0_0_20px_rgba(2,0,241,0.35)]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="pulse-dot bg-white" />
                  <span>Authenticating...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn size={14} />
                  <span>Sign In</span>
                </span>
              )}
            </Button>
          </form>
        )}

        {/* Create Account Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-[#a0a0a0] uppercase tracking-wider">
                Name <span className="text-[#FF1400]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className={inputClass}
                disabled={loading}
                autoComplete="name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-[#a0a0a0] uppercase tracking-wider">
                Email <span className="text-[#FF1400]">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-[#a0a0a0] uppercase tracking-wider">
                Password <span className="text-[#FF1400]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} pr-11`}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0a0a0] hover:text-white transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-[#a0a0a0] uppercase tracking-wider">
                Confirm Password <span className="text-[#FF1400]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} pr-11`}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0a0a0] hover:text-white transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full justify-center text-xs font-mono uppercase tracking-widest py-3 cursor-pointer shadow-[0_0_20px_rgba(2,0,241,0.35)]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="pulse-dot bg-white" />
                  <span>Creating Account...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus size={14} />
                  <span>Create Account</span>
                </span>
              )}
            </Button>
          </form>
        )}

        {/* Return Home */}
        <Link className="button button-secondary text-center mt-6" to="/">Return to home</Link>
      </section>
    </main>
  );
}
