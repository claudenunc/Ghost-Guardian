import React, { useEffect } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  Mic,
  Shield,
  Users,
  BarChart3,
  Activity,
  Server,
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
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/inbox', label: 'Inbox', icon: Inbox },
  { to: '/app/voice', label: 'Voice', icon: Mic },
  { to: '/app/rules', label: 'Guardian Rules', icon: Shield },
  { to: '/app/audience', label: 'Audience', icon: Users },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/app/community', label: 'Community', icon: Users },
  { to: '/app/activity', label: 'Activity', icon: Activity },
  { to: '/app/system', label: 'Cloud & System', icon: Server },
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
    <div className="min-h-screen ghost-aurora pb-24 lg:pb-12 text-[#f4f6fb]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0d0f17]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <GhostMark className="transition-transform group-hover:scale-105" />
            <span className="font-display text-sm tracking-[0.2em] uppercase text-white font-bold">
              Ghost Guardian
            </span>
          </Link>

          <div className="flex items-center gap-2.5">
            <Chip variant={settings.paused ? 'attention' : 'positive'}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: settings.paused ? '#fbbf24' : '#34d399',
                }}
              />
              {settings.paused ? 'Paused' : `Active · ${settings.mode}`}
            </Chip>

            {needsAttention > 0 ? (
              <Chip variant="critical">
                <span className="pulse-dot" style={{ backgroundColor: '#f87171' }} />
                {needsAttention} need you
              </Chip>
            ) : null}

            <Button
              size="sm"
              variant={settings.paused ? 'default' : 'destructive'}
              onClick={togglePause}
              className="gap-1.5"
            >
              {settings.paused ? <Play size={14} /> : <Pause size={14} />}
              {settings.paused ? 'Resume' : 'Pause Shield'}
            </Button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="mx-auto hidden max-w-7xl gap-1 overflow-x-auto px-4 pb-2.5 lg:flex scrollbar-none">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#1e2235] text-white border border-white/15 shadow-sm'
                    : 'text-[#8f97b0] hover:bg-white/5 hover:text-white border border-transparent'
                }`
              }
            >
              <Icon size={15} strokeWidth={1.8} />
              <span>{label}</span>
              {to === '/app/inbox' && pendingCount > 0 && (
                <span className="ml-1 rounded-full bg-[#4de1dc]/20 text-[#4de1dc] px-1.5 py-0.2 text-[10px] font-bold">
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
      <nav className="fixed bottom-0 z-40 flex w-full justify-around border-t border-white/10 bg-[#0d0f17]/95 px-2 py-2 backdrop-blur-lg lg:hidden">
        {navItems.slice(0, 5).map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 rounded-lg py-1 text-[10px] transition-colors ${
                isActive ? 'text-[#4de1dc] font-bold' : 'text-[#8f97b0]'
              }`
            }
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-[#141724]/95 px-4 py-3 shadow-2xl backdrop-blur-xl max-w-md">
            {toast.type === 'success' && <CheckCircle size={18} className="text-[#34d399] shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle size={18} className="text-[#fbbf24] shrink-0" />}
            {toast.type === 'info' && <Info size={18} className="text-[#4de1dc] shrink-0" />}
            {toast.type === 'error' && <AlertTriangle size={18} className="text-[#f87171] shrink-0" />}
            <span className="text-xs sm:text-sm text-white font-medium">{toast.message}</span>
            <button
              onClick={() => dispatch({ type: 'CLEAR_TOAST' })}
              className="text-[#8f97b0] hover:text-white ml-auto p-1"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
