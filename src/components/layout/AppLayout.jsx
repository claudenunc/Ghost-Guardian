import React, { useEffect } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
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

export default function AppLayout() {
  const { settings, updateSettings, comments, stateFor, toast, dispatch } = useGuardian();

  const needsAttention = comments.filter(
    (c) =>
      (c.risk === 'critical' || c.risk === 'high' || c.recommendedAction === 'human_review') &&
      stateFor(c.id).status === 'pending'
  ).length;

  const pendingCount = comments.filter((c) => stateFor(c.id).status === 'pending').length;

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
    <div className="min-h-screen bg-black pb-28 lg:pb-12 text-white">
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
              className="gap-1.5 shrink-0 font-mono tracking-wider text-[11px]"
            >
              {settings.paused ? <Play size={13} /> : <Pause size={13} />}
              <span className="hidden sm:inline">{settings.paused ? 'Resume Shield' : 'Pause Shield'}</span>
            </Button>
          </div>
        </div>

        {/* Tactical Desktop Navigation */}
        <nav className="mx-auto hidden max-w-7xl gap-1.5 overflow-x-auto px-4 pb-2.5 lg:flex scrollbar-none">
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
      <nav className="fixed bottom-0 z-40 flex w-full justify-around border-t border-white/[0.08] bg-[#000000] px-2 py-2 lg:hidden">
        {navItems.slice(0, 5).map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[10px] font-display font-bold uppercase tracking-wider transition-colors ${
                isActive ? 'text-[#0A00FF]' : 'text-[#a0a0a0] hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

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
