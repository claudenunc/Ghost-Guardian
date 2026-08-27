import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Users, Star, Heart, MessageSquare, TrendingUp, Award } from 'lucide-react';

export default function Community() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('frequent');
  const members = Object.values(state.communityMembers);

  const frequent = members.filter(m => m.comments >= 20).sort((a, b) => b.comments - a.comments);
  const returning = members.filter(m => m.category === 'returning').sort((a, b) => b.comments - a.comments);
  const newMembers = members.filter(m => m.category === 'new' && m.sentiment !== 'negative').sort((a, b) => new Date(b.firstSeen) - new Date(a.firstSeen));
  const thoughtful = members.filter(m => m.tags?.includes('philosophy') || m.tags?.includes('questions') || m.tags?.includes('deep-dives')).sort((a, b) => b.comments - a.comments);

  const tabs = [
    { id: 'frequent', label: 'Frequent Contributors', icon: TrendingUp, data: frequent },
    { id: 'returning', label: 'Returning Members', icon: Heart, data: returning },
    { id: 'thoughtful', label: 'Thoughtful Contributors', icon: Star, data: thoughtful },
    { id: 'new', label: 'New Supporters', icon: Award, data: newMembers },
  ];

  const currentTab = tabs.find(t => t.id === activeTab);
  const currentMembers = currentTab?.data || [];

  const sentimentColors = { positive: 'var(--emerald-400)', mixed: 'var(--amber-400)', negative: 'var(--rose-400)', neutral: 'var(--text-tertiary)' };
  const avatarGradients = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, #10b981, #34d399)',
    'linear-gradient(135deg, #f59e0b, #fbbf24)',
    'linear-gradient(135deg, #f43f5e, #fb7185)',
    'linear-gradient(135deg, #0ea5e9, #38bdf8)',
    'linear-gradient(135deg, #a855f7, #c084fc)',
  ];

  return (
    <div className="page-content" style={{ maxWidth: 800 }}>
      <h1 className="page-title">Community</h1>
      <p className="page-subtitle">Recognize the people who consistently contribute to your community.</p>

      <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
        {tabs.map(t => (
          <button key={t.id} className={`tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {currentMembers.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {currentMembers.map((m, i) => (
            <div key={m.handle} className="card member-card">
              <div className="member-avatar" style={{ background: avatarGradients[i % avatarGradients.length] }}>
                {m.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="member-info">
                <div className="member-name">{m.name}</div>
                <div className="member-stats">
                  {m.comments} comments · Since {new Date(m.firstSeen).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </div>
                {m.tags?.length > 0 && (
                  <div style={{ display: 'flex', gap: 'var(--space-1)', marginTop: 'var(--space-1)', flexWrap: 'wrap' }}>
                    {m.tags.slice(0, 4).map(tag => (
                      <span key={tag} className="badge badge-neutral" style={{ fontSize: '9px' }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span className="badge" style={{ background: (sentimentColors[m.sentiment] || 'var(--text-tertiary)') + '15', color: sentimentColors[m.sentiment] || 'var(--text-tertiary)' }}>
                  {m.sentiment}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon"><Users size={28} /></div>
          <div className="empty-state-title">No members in this category yet</div>
          <div className="empty-state-text">Community members will appear as more comments are processed.</div>
        </div>
      )}

      {/* Community Stats Summary */}
      <div className="card" style={{ marginTop: 'var(--space-6)' }}>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Community Overview</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-4)' }}>
          <div><div className="stat-value" style={{ color: 'var(--primary-400)' }}>{members.length}</div><div className="stat-label">Total Members</div></div>
          <div><div className="stat-value" style={{ color: 'var(--emerald-400)' }}>{frequent.length}</div><div className="stat-label">Frequent</div></div>
          <div><div className="stat-value" style={{ color: 'var(--amber-400)' }}>{returning.length}</div><div className="stat-label">Returning</div></div>
          <div><div className="stat-value" style={{ color: 'var(--sky-400)' }}>{newMembers.length}</div><div className="stat-label">New</div></div>
        </div>
      </div>
    </div>
  );
}
