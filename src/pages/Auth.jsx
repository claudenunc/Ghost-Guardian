import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Ghost, ArrowRight, Sparkles, Eye } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { state, dispatch, loadDemoData, loadSavedState } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const isDemo = params.get('demo') === 'true';

  useEffect(() => {
    if (isDemo) {
      loadDemoData();
      navigate('/app');
    }
  }, [isDemo]);

  useEffect(() => {
    if (state.isLoggedIn && state.onboarded) {
      navigate('/app');
    }
  }, [state.isLoggedIn, state.onboarded]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulated auth
    dispatch({ type: 'LOGIN', payload: { name: name || 'Creator', email } });
    dispatch({ type: 'SET_DEMO', payload: false });
    const hasSaved = loadSavedState();
    if (hasSaved) {
      navigate('/app');
    } else {
      navigate('/onboarding');
    }
  };

  const handleDemo = () => {
    loadDemoData();
    navigate('/app');
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card animate-fade-in-up">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-600), var(--primary-400))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }} className="animate-ghost-glow">
            <Ghost size={28} color="white" />
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 'var(--space-2)' }}>
            {isLogin ? 'Welcome Back' : 'Meet Your Guardian'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            {isLogin ? 'Sign in to your Ghost Guardian account' : 'Create your account and set up your AI guardian'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {!isLogin && (
            <div className="input-group">
              <label className="input-label">Name</label>
              <input className="input" type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          <div className="input-group">
            <label className="input-label">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 'var(--space-2)' }}>
            {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ margin: 'var(--space-6) 0', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
        </div>

        <button onClick={handleDemo} className="btn btn-secondary btn-lg" style={{ width: '100%', gap: 'var(--space-2)' }}>
          <Eye size={16} /> Try Demo Mode
        </button>
        <p style={{ textAlign: 'center', marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          Explore Ghost Guardian with a fictional creator — no account needed
        </p>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
          <button onClick={() => setIsLogin(!isLogin)} className="btn btn-ghost btn-sm">
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
