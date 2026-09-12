import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { GhostMark, Button } from '../components/guardian/atoms';
import { ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const BYPASS_KEY = 'ghost_guardian_founder_access';
const BYPASS_CODE = 'ENVY2026';

export default function BetaWaitlist() {
  const navigate = useNavigate();

  // Route returning users past the waitlist gate.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('access') === BYPASS_CODE) {
      localStorage.setItem(BYPASS_KEY, 'true');
    }
    // Already signed in (incl. right after confirming their email)? Go to the app.
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session) {
          navigate('/app', { replace: true });
        } else if (localStorage.getItem(BYPASS_KEY) === 'true') {
          navigate('/auth', { replace: true });
        }
      }).catch(() => {});
    } else if (localStorage.getItem(BYPASS_KEY) === 'true') {
      navigate('/auth', { replace: true });
    }
  }, [navigate]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [channelUrl, setChannelUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    const trimmedChannel = channelUrl.trim();

    if (!trimmedEmail || !trimmedName) {
      setError('Please provide both your name and email address.');
      return;
    }

    setLoading(true);

    try {
      if (!supabase) {
        throw new Error('Supabase client is not configured.');
      }

      const { error: insertError } = await supabase.from('waitlist').insert([
        {
          email: trimmedEmail,
          name: trimmedName,
          channel_url: trimmedChannel || null,
        },
      ]);

      if (insertError) {
        if (
          insertError.code === '23505' ||
          insertError.message?.toLowerCase().includes('duplicate') ||
          insertError.message?.toLowerCase().includes('unique') ||
          insertError.message?.toLowerCase().includes('already')
        ) {
          setError('Already on the list.');
        } else {
          setError(insertError.message || 'Failed to join waitlist. Please try again.');
        }
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      if (
        err.message?.toLowerCase().includes('duplicate') ||
        err.message?.toLowerCase().includes('unique') ||
        err.message?.toLowerCase().includes('already')
      ) {
        setError('Already on the list.');
      } else {
        setError(err.message || 'Failed to join waitlist. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-[#0200F1] selection:text-white">
      {/* Top Bar with GhostMark */}
      <header className="p-6 sm:p-8 flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-3 group">
          <GhostMark className="transition-transform group-hover:scale-105" />
          <div>
            <span className="font-display text-sm tracking-[0.25em] uppercase text-white font-black block">
              Ghost Guardian
            </span>
            <span className="text-[9px] font-mono tracking-[0.3em] text-[#a0a0a0] block uppercase">
              Autonomous Community Shield
            </span>
          </div>
        </Link>
        <Link
          to="/pricing"
          className="text-xs font-mono uppercase tracking-widest text-[#a0a0a0] hover:text-[#00FF66] transition-colors"
        >
          Pricing & Founder Spots →
        </Link>
      </header>

      {/* Main Waitlist Card */}
      <main className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md ghost-panel p-8 sm:p-10 border border-white/10 bg-[#050505] shadow-[0_0_50px_rgba(2,0,241,0.15)] relative">
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-[#0200F1] to-transparent" />

          {submitted ? (
            <div className="space-y-6 text-center animate-in fade-in duration-300">
              <div className="inline-flex p-3.5 rounded-2xl bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66] shadow-[0_0_20px_rgba(0,255,102,0.25)]">
                <CheckCircle2 size={32} />
              </div>

              <div className="space-y-2">
                <h3 className="font-display text-2xl text-white font-black tracking-wide">
                  You're on the list.
                </h3>
                <p className="text-sm text-[#a0a0a0] leading-relaxed">
                  We'll email you when your spot opens.
                </p>
              </div>

              <div className="pt-6 border-t border-white/10">
                <p className="text-xs text-[#a0a0a0] mb-3 font-mono">
                  Want to skip the line with a lifetime founding spot?
                </p>
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 text-sm font-mono text-[#00FF66] hover:text-[#00FF66]/80 transition-colors group font-semibold"
                >
                  <span>In the meantime →</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">Claim Founding Spot</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0200F1]/15 border border-[#0200F1]/40 text-[11px] font-mono font-bold text-[#0A00FF]">
                  <Sparkles size={12} />
                  <span>Private Beta Access</span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl text-white font-black tracking-tight mt-2">
                  Ghost Guardian is in private beta.
                </h1>
                <p className="text-xs sm:text-sm text-[#a0a0a0] leading-relaxed">
                  We're onboarding 20 founding creators. Get in line.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-[#FF1400]/10 border border-[#FF1400]/30 text-[#FF1400] text-xs font-mono flex items-center gap-2 animate-in fade-in">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-[#a0a0a0] uppercase tracking-wider">
                    Email <span className="text-[#FF1400]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="creator@channel.com"
                    className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-4 py-3 text-white font-mono text-sm focus:border-[#0200F1] focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-[#a0a0a0] uppercase tracking-wider">
                    Your Name <span className="text-[#FF1400]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-4 py-3 text-white font-mono text-sm focus:border-[#0200F1] focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-[#a0a0a0] uppercase tracking-wider">
                    YouTube Channel URL <span className="text-white/40">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={channelUrl}
                    onChange={(e) => setChannelUrl(e.target.value)}
                    placeholder="youtube.com/@yourchannel"
                    className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-4 py-3 text-white font-mono text-sm focus:border-[#0200F1] focus:outline-none transition-colors"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="w-full justify-center text-xs font-mono uppercase tracking-widest py-3 cursor-pointer shadow-[0_0_20px_rgba(2,0,241,0.35)]"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="pulse-dot bg-white" />
                        <span>Securing Spot...</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span>Join Beta Waitlist</span>
                        <ArrowRight size={14} />
                      </span>
                    )}
                  </Button>
                </div>
              </form>

              <div className="text-center pt-2 border-t border-white/5 space-y-2">
                <Link
                  to="/pricing"
                  className="block text-[11px] font-mono text-[#FF6A00] hover:underline"
                >
                  Or lock founding rate at $59/mo forever →
                </Link>
                <p className="text-[11px] font-mono text-[#a0a0a0]">
                  Already a member?{' '}
                  <Link to="/auth" className="text-[#0200F1] hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs font-mono text-white/40">
        Ghost Guardian · Forged Void Architecture · Autonomous Intelligence
      </footer>
    </div>
  );
}
