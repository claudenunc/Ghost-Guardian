import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  Mic,
  Shield,
  Lightbulb,
  Users,
  BarChart3,
  Activity,
  Settings,
  Pause,
  Play,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  MoreHorizontal,
  ChevronRight,
} from 'lucide-react';
import { GhostMark, Chip, Button } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';

const navItems = [
  { to: '/app', label: 'Briefing', icon: LayoutDashboard, end: true },
  { to: '/app/inbox', label: 'Inbox', icon: Inbox },
  { to: '/app/voice', label: 'Voice', icon: Mic },
  { to: '/app/rules', label: 'Guardian Rules', icon: Shield },
  { to: '/app/audience', label: 'Audience', icon: Lightbulb },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/app/community', label: 'Community', icon: Users },
  { to: '/app/activity', label: 'Journal', icon: Activity },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

const primaryMobileNav = navItems.slice(0, 4);
const secondaryMobileNav = navItems.slice(4);

export default function AppLayout() {
  const { settings, updateSettings, comments, stateFor, toast, dispatch } = useGuardian();
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const location = useLocation();

  const isSecondaryActive = secondaryMobileNav.some((item) => location.pathname.startsWith(item.to));

  const needsAttention = comments.filter(
    (c) =>
      (c.risk === 'critical' || c.risk === 'high' || c.recommendedAction === 'human_review') &&
      stateFor(c.id).status === 'pending'
  ).length;

  const pendingCount = comments.filter((c) => stateFor(c.id).status === 'pending').length;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMoreOpen) {
        setMobileMoreOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMoreOpen]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        dispatch({ type: 'CLEAR_TOAST' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, dispatch]);

  const togglePause = () => {
    updateSettings({ paused: !settings.paused });
  };

  return (
    <div className="min-h-screen bg-black pb-28 lg:pb-12 text-white overflow-x-hidden">
      {/* Classified Military Tech Command Header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#000000] shadow-[0_4px_30px_rgba(0,0,0,0.95)]">
        {/* Tactical Telemetry Strip */}
        <div className="border-b border-white/[0.05] bg-[#050505] px-4 py-1 sm:px-6 hidden sm:flex items-center justify-between text-[10px] font-mono tracking-widest text-[#a0a0a0]">
          <div className="flex items-center gap-3">
            <span className="text-[#00FF66] flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[#00FF66] shadow-[0_0_8px_#00FF66]" />
              SYSTEM PROTOCOL: ACTIVE
            </span>
            <span className="text-white/20">|</span>
            <span>CLEARANCE: CREATOR // LEVEL-4</span>
            <span className="text-white/20">|</span>
            <span>CORE: DETERMINISTIC SAFETY GUARD</span>
          </div>
          <div className="flex items-center gap-3">
            <span>DEFENSE BUFFER: 100%</span>
            <span className="text-white/20">|</span>
            <span className="text-[#0A00FF]">ATTENTION SHIELD ENGAGED</span>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <GhostMark className="transition-transform group-hover:scale-105" />
            <div>
              <span className="font-display text-sm tracking-[0.25em] uppercase text-white font-black block">
                Ghost Guardian
              </span>
              <span className="text-[9px] font-mono tracking-[0.3em] text-[#a0a0a0] block uppercase">
                Forged Intelligence Platform
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Chip variant={settings.paused ? 'attention' : 'positive'} className="shrink-0">
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: settings.paused ? '#FF6A00' : '#00FF66',
                  boxShadow: settings.paused ? '0 0 8px #FF6A00' : '0 0 8px #00FF66',
                }}
              />
              {settings.paused ? 'Defense Paused' : `Posture: ${settings.mode.toUpperCase()}`}
            </Chip>

            {needsAttention > 0 ? (
              <Chip variant="critical" className="hidden sm:inline-flex shrink-0">
                <span className="pulse-dot bg-[#FF1400] shadow-[0_0_8px_#FF1400]" />
                {needsAttention} Priority Alerts
              </Chip>
            ) : null}

            <Button
              size="sm"
              variant={settings.paused ? 'default' : 'destructive'}
              onClick={togglePause}
              aria-label={settings.paused ? 'Resume Shield' : 'Pause Shield'}
              className="gap-1.5 shrink-0 font-mono tracking-wider text-[11px]"
            >
              {settings.paused ? <Play size={13} /> : <Pause size={13} />}
              <span className="hidden sm:inline">{settings.paused ? 'Resume Shield' : 'Pause Shield'}</span>
            </Button>
          </div>
        </div>

        {/* Tactical Desktop Navigation */}
        <nav className="mx-auto hidden max-w-7xl gap-1.5 overflow-x-auto px-4 pb-2.5 lg:flex scrollbar-none" aria-label="Main navigation">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-display font-bold uppercase tracking-wider transition-all duration-150 ${
                  isActive
                    ? 'bg-[#0a0a0a] text-white border border-[#0A00FF] shadow-[0_0_18px_rgba(10,0,255,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]'
                    : 'text-[#a0a0a0] hover:bg-white/[0.04] hover:text-white border border-transparent'
                }`
              }
            >
              <Icon size={14} strokeWidth={2} />
              <span>{label}</span>
              {to === '/app/inbox' && pendingCount > 0 && (
                <span className="ml-1 rounded bg-[#0A00FF] text-white px-1.5 py-0.2 text-[10px] font-mono font-bold shadow-[0_0_10px_#0A00FF]">
                  {pendingCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav
        className="fixed bottom-0 z-40 flex w-full justify-around border-t border-white/[0.08] bg-black px-2 py-2 lg:hidden shadow-[0_-4px_25px_rgba(0,0,0,1)]"
        style={{ backgroundColor: '#000000' }}
        aria-label="Mobile navigation"
      >
        {primaryMobileNav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileMoreOpen(false)}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 min-h-[44px] min-w-[48px] justify-center text-[10px] font-display font-bold uppercase tracking-wider transition-colors ${
                isActive ? 'text-white' : 'text-[#a0a0a0] hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}

        {/* Tactical More Button for mobile access to Audience, Analytics, Community, Journal, Settings */}
        <button
          type="button"
          aria-expanded={mobileMoreOpen}
          aria-label="Toggle tactical operations navigation menu"
          onClick={() => setMobileMoreOpen(!mobileMoreOpen)}
          className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 min-h-[44px] min-w-[48px] justify-center text-[10px] font-display font-bold uppercase tracking-wider transition-colors ${
            mobileMoreOpen || isSecondaryActive ? 'text-white' : 'text-[#a0a0a0] hover:text-white'
          }`}
        >
          <MoreHorizontal size={18} />
          <span>More</span>
        </button>
      </nav>

      {/* Tactical Mobile Menu Sheet */}
      {mobileMoreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end animate-in fade-in duration-150">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/90 transition-opacity"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
            onClick={() => setMobileMoreOpen(false)}
            aria-hidden="true"
          />

          {/* Sheet */}
          <div
            className="relative z-10 w-full rounded-t-2xl border-t border-white/20 bg-[#0a0a0a] p-5 shadow-[0_-10px_40px_rgba(0,0,0,1)] space-y-4 max-h-[80vh] overflow-y-auto"
            style={{ backgroundColor: '#0a0a0a' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="font-display text-sm tracking-[0.2em] uppercase font-bold text-white block">
                  Tactical Operations
                </span>
                <span className="text-[10px] font-mono text-[#a0a0a0]">
                  Extended Guardian Suite
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMoreOpen(false)}
                aria-label="Close extended menu"
                className="p-2 text-[#a0a0a0] hover:text-white rounded-lg border border-white/10 bg-[#0a0a0a]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid gap-2">
              {secondaryMobileNav.map(({ to, label, icon: Icon }) => {
                const isActive = location.pathname.startsWith(to);
                return (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileMoreOpen(false)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-[#0a0a0a] border-[#0A00FF] text-white shadow-[0_0_15px_rgba(10,0,255,0.3)]'
                        : 'border-white/5 bg-[#080808] text-[#a0a0a0] hover:text-white hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-[#0A00FF]/20 text-[#0A00FF]' : 'bg-white/5 text-[#a0a0a0]'}`}>
                        <Icon size={18} />
                      </div>
                      <span className="font-display font-bold uppercase text-xs tracking-wider">
                        {label}
                      </span>
                    </div>
                    <ChevronRight size={16} className={isActive ? 'text-[#0A00FF]' : 'text-white/20'} />
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Military Command Toast Banner */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 lg:bottom-8 right-4 z-50 flex max-w-md items-center justify-between gap-3 rounded-xl border border-white/20 bg-[#0a0a0a] px-4 py-3 text-xs shadow-[0_0_30px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.2)] animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' && <CheckCircle size={16} className="text-[#00FF66] shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle size={16} className="text-[#FF6A00] shrink-0" />}
            {toast.type === 'error' && <AlertTriangle size={16} className="text-[#FF2A00] shrink-0" />}
            {toast.type === 'info' && <Info size={16} className="text-[#0A00FF] shrink-0" />}
            <span className="font-mono text-white leading-relaxed">{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: 'CLEAR_TOAST' })}
            className="text-[#a0a0a0] hover:text-white p-1 rounded transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
