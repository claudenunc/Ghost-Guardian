import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { History, Filter, Check, Edit3, X, EyeOff, AlertTriangle, Search } from 'lucide-react';

export default function ActivityHistory() {
  const { state } = useApp();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const actionIcons = { approved: Check, edited: Edit3, rejected: X, ignored: EyeOff, escalated: AlertTriangle };
  const actionColors = { approved: 'var(--emerald-400)', edited: 'var(--amber-400)', rejected: 'var(--rose-400)', ignored: 'var(--text-muted)', escalated: 'var(--orange-500)' };

  const filtered = state.activity.filter(a => {
    if (filter !== 'all' && a.action !== filter) return false;
    if (searchTerm && !JSON.stringify(a).toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="page-content" style={{ maxWidth: 800 }}>
      <h1 className="page-title">Activity History</h1>
      <p className="page-subtitle">{state.activity.length} actions recorded</p>

      <div className="filter-bar">
        <div className="search-input">
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input placeholder="Search activity..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select className="select input-sm" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Actions</option>
          <option value="approved">Approved</option>
          <option value="edited">Edited</option>
          <option value="rejected">Rejected</option>
          <option value="ignored">Ignored</option>
          <option value="escalated">Escalated</option>
        </select>
      </div>

      {filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {filtered.map(entry => {
            const Icon = actionIcons[entry.action] || History;
            const color = actionColors[entry.action] || 'var(--text-tertiary)';
            return (
              <div key={entry.id} className="card" style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color }}>
                  <Icon size={14} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                    <span className="badge" style={{ background: color + '20', color, textTransform: 'capitalize' }}>{entry.action}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{formatTime(entry.timestamp)}</span>
                    {entry.platform && <span className="badge badge-neutral">{entry.platform}</span>}
                  </div>
                  {entry.comment && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }} className="truncate">Comment: "{entry.comment}"</p>}
                  {entry.response && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }} className="truncate">Response: "{entry.response}"</p>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon"><History size={28} /></div>
          <div className="empty-state-title">{state.activity.length === 0 ? 'No activity yet' : 'No matching activity'}</div>
          <div className="empty-state-text">{state.activity.length === 0 ? 'Activity will appear here as you interact with comments.' : 'Try adjusting your filters.'}</div>
        </div>
      )}
    </div>
  );
}
