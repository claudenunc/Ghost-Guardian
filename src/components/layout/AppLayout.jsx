import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import {
  LayoutDashboard, Inbox, Mic, Shield, Brain, BarChart3,
  History, Link2, Users, Settings, Menu, X, Pause, Play,
  Ghost, ChevronDown, LogOut, Zap, Home, Bell
} from 'lucide-react';

const navItems = [
  { section: 'Command Center', items: [
    { to: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/app/inbox', icon: Inbox, label: 'Comment Inbox', badge: true },
  ]},
  { section: 'Creator', items: [
    { to: '/app/voice', icon: Mic, label: 'Creator Voice' },
    { to: '/app/rules', icon: Shield, label: 'Guardian Rules' },
  ]},
  { section: 'Intelligence', items: [
    { to: '/app/intelligence', icon: Brain, label: 'Audience Intelligence' },
    { to: '/app/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/app/community', icon: Users, label: 'Community' },
  ]},
  { section: 'System', items: [
    { to: '/app/history', icon: History, label: 'Activity History' },
    { to: '/app/platforms', icon: Link2, label: 'Platforms' },
    { to: '/app/settings', icon: Settings, label: 'Settings' },
  ]},
];

const mobileNavItems = [
  { to: '/app', icon: LayoutDashboard, label: 'Home', end: true },
  { to: '/app/inbox', icon: Inbox, label: 'Inbox' },
  { to: '/app/intelligence', icon: Brain, label: 'Intel' },
  { to: '/app/analytics', icon: BarChart3, label: 'Stats' },
  { to: '/app/settings', icon: Settings, label: 'More' },
];

export default function AppLayout() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const pendingCount = state.processedComments.filter(p => p.status === 'pending').length;

  const togglePause = () => {
    dispatch({ type: 'SET_GUARDIAN_PAUSED', payload: !state.guardianPaused });
    dispatch({ type: 'ADD_TOAST', payload: {
      type: state.guardianPaused ? 'success' : 'warning',
      message: state.guardianPaused ? 'Guardian resumed.' : 'Guardian paused.',
    }});
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/');
  };

  return (
    <div className="app-layout">
      {/* Sidebar overlay for mobile */}
      <div
        className={`sidebar-overlay ${state.sidebarOpen ? 'open' : ''}`}
        onClick={() => dispatch({ type: 'CLOSE_SIDEBAR' })}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${state.sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-600), var(--primary-400))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ghost size={18} color="white" />
          </div>
          <div>
            <div className="sidebar-logo-text">Ghost Guardian</div>
            <div className="sidebar-logo-ghost">{state.isDemo ? 'Demo Mode' : state.creator?.brandName || ''}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(section => (
            <div key={section.section} className="sidebar-nav-section">
              <div className="sidebar-nav-label">{section.section}</div>
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => dispatch({ type: 'CLOSE_SIDEBAR' })}
                >
                  <item.icon size={18} />
                  {item.label}
                  {item.badge && pendingCount > 0 && (
                    <span className="badge badge-primary">{pendingCount}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-link" style={{ width: '100%' }}>
            <LogOut size={18} />
            {state.isDemo ? 'Exit Demo' : 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="app-main">
        <header className="app-header">
          <div className="app-header-left">
            <button
              className="mobile-hamburger btn-icon btn-ghost"
              onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            >
              {state.sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className={`guardian-status ${state.guardianPaused ? 'paused' : 'active'}`}>
              <div className="guardian-status-dot" />
              {state.guardianPaused ? 'Paused' : 'Active'}
              <span style={{ fontSize: 'var(--text-xs)', opacity: 0.7, textTransform: 'capitalize' }}>
                · {state.guardianMode}
              </span>
            </div>
          </div>
          <div className="app-header-right">
            <button onClick={togglePause} className={`btn btn-sm ${state.guardianPaused ? 'btn-success' : 'btn-secondary'}`} style={{ gap: '6px' }}>
              {state.guardianPaused ? <><Play size={14} /> Resume</> : <><Pause size={14} /> Pause</>}
            </button>
            {state.isDemo && (
              <span className="badge badge-warning" style={{ fontSize: '10px' }}>DEMO</span>
            )}
          </div>
        </header>

        <Outlet />

        {/* Mobile nav */}
        <nav className="mobile-nav">
          <div className="mobile-nav-items">
            {mobileNavItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </main>
    </div>
  );
}
