import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Settings as SettingsIcon, Bell, Shield, Pause, Play, Trash2, Download, User, Eye, Moon, Lock, Ghost } from 'lucide-react';

export default function Settings() {
  const { state, dispatch, addToast } = useApp();

  const toggleNotification = (key) => {
    // For demo, just show toast
    addToast('info', `Notification setting updated.`);
  };

  const handlePause = () => {
    dispatch({ type: 'SET_GUARDIAN_PAUSED', payload: !state.guardianPaused });
    addToast(state.guardianPaused ? 'success' : 'warning', state.guardianPaused ? 'Guardian resumed.' : 'Guardian paused.');
  };

  const handleClearData = () => {
    if (window.confirm('This will clear all local data. Are you sure?')) {
      localStorage.clear();
      dispatch({ type: 'LOGOUT' });
      addToast('info', 'All data cleared.');
    }
  };

  const notificationSettings = [
    { key: 'highRisk', label: 'High-risk comments', desc: 'Alert when a high-risk comment is detected' },
    { key: 'threats', label: 'Threats', desc: 'Immediate alert for threatening content' },
    { key: 'negativitySpikes', label: 'Negativity spikes', desc: 'Alert when negative sentiment increases significantly' },
    { key: 'importantQuestions', label: 'Important questions', desc: 'Questions with high engagement from community' },
    { key: 'emergingTopics', label: 'Emerging topics', desc: 'New topics gaining traction' },
    { key: 'weeklyReport', label: 'Weekly report', desc: 'Summary of Guardian activity' },
  ];

  return (
    <div className="page-content" style={{ maxWidth: 800 }}>
      <h1 className="page-title">Settings</h1>
      <p className="page-subtitle">Manage your Ghost Guardian preferences.</p>

      {/* Account */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <User size={18} style={{ color: 'var(--primary-400)' }} />
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Account</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-600), var(--primary-400))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 'var(--text-xl)', color: 'white' }}>
            {state.creator?.name?.[0]?.toUpperCase() || 'G'}
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>{state.creator?.name || 'Creator'}</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>{state.creator?.brandName || 'Ghost Guardian User'}</div>
            {state.isDemo && <span className="badge badge-warning" style={{ marginTop: 'var(--space-1)' }}>Demo Mode</span>}
          </div>
        </div>
      </div>

      {/* Emergency Controls */}
      <div className="card" style={{ marginBottom: 'var(--space-6)', borderColor: state.guardianPaused ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <Shield size={18} style={{ color: state.guardianPaused ? 'var(--amber-400)' : 'var(--emerald-400)' }} />
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Guardian Control</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <button onClick={handlePause} className={`btn btn-lg ${state.guardianPaused ? 'btn-success' : 'btn-danger'}`} style={{ width: '100%', justifyContent: 'center', gap: 'var(--space-2)' }}>
            {state.guardianPaused ? <><Play size={18} /> Resume Guardian</> : <><Pause size={18} /> Pause Guardian</>}
          </button>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textAlign: 'center' }}>
            {state.guardianPaused ? 'Guardian is paused. No automated actions will be taken.' : 'Pausing will immediately stop all automated activity.'}
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => { dispatch({ type: 'SET_GUARDIAN_MODE', payload: 'copilot' }); addToast('info', 'Switched to Copilot mode.'); }} className="btn btn-secondary btn-sm">Switch to Copilot</button>
            <button onClick={() => { dispatch({ type: 'SET_GUARDIAN_MODE', payload: 'guardian' }); addToast('info', 'Switched to Guardian (safety) mode.'); }} className="btn btn-secondary btn-sm">Switch to Guardian</button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <Bell size={18} style={{ color: 'var(--amber-400)' }} />
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Notifications</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {notificationSettings.map(n => (
            <div key={n.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{n.label}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{n.desc}</div>
              </div>
              <div className="toggle active" onClick={() => toggleNotification(n.key)} />
            </div>
          ))}
        </div>
      </div>

      {/* Privacy & Data */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <Lock size={18} style={{ color: 'var(--primary-400)' }} />
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Privacy & Data</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
            <Download size={16} /> Export My Data
          </button>
          <button onClick={handleClearData} className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }}>
            <Trash2 size={16} /> Clear All Local Data
          </button>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textAlign: 'center' }}>
            Creator data is stored locally in your browser. Clearing data will remove all settings, voice profiles, and history.
          </p>
        </div>
      </div>

      {/* Create Without Fear (Coming Soon) */}
      <div className="card" style={{ borderStyle: 'dashed', opacity: 0.7 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ghost size={20} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>Create Without Fear</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Coming soon — a protective mode for new creators who haven't started yet because they're afraid of public judgment.
            </div>
          </div>
          <span className="badge badge-neutral" style={{ marginLeft: 'auto' }}>Future</span>
        </div>
      </div>
    </div>
  );
}
