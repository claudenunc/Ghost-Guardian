import React from 'react';
import { useApp } from '../contexts/AppContext';
import { BarChart3, Clock, CheckCircle, Edit3, X, AlertTriangle, MessageSquare, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#38bdf8', '#a855f7'];

export default function Analytics() {
  const { state } = useApp();
  const a = state.analytics;

  const actionData = [
    { name: 'Approved', value: a.repliesApproved, fill: '#10b981' },
    { name: 'Edited', value: a.repliesEdited, fill: '#f59e0b' },
    { name: 'Rejected', value: a.repliesRejected, fill: '#f43f5e' },
    { name: 'Ignored', value: a.commentsIgnored, fill: '#6a6a82' },
    { name: 'Escalated', value: a.commentsEscalated, fill: '#fb923c' },
  ];

  const categoryBreakdown = (() => {
    const counts = {};
    state.processedComments.forEach(pc => {
      const cat = pc.classification?.category || 'UNKNOWN';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value })).sort((a, b) => b.value - a.value);
  })();

  const sentimentData = [
    { name: 'Positive', value: state.processedComments.filter(p => p.classification?.sentiment === 'positive').length, fill: '#10b981' },
    { name: 'Neutral', value: state.processedComments.filter(p => p.classification?.sentiment === 'neutral').length, fill: '#6a6a82' },
    { name: 'Negative', value: state.processedComments.filter(p => p.classification?.sentiment === 'negative').length, fill: '#f43f5e' },
    { name: 'Mixed', value: state.processedComments.filter(p => p.classification?.sentiment === 'mixed').length, fill: '#f59e0b' },
  ];

  const approvalRate = a.repliesGenerated > 0 ? Math.round((a.repliesApproved / a.repliesGenerated) * 100) : 0;
  const editRate = a.repliesGenerated > 0 ? Math.round((a.repliesEdited / a.repliesGenerated) * 100) : 0;

  return (
    <div className="page-content">
      <h1 className="page-title">Analytics</h1>
      <p className="page-subtitle">Ghost Guardian activity and performance metrics.</p>

      {/* Key Metrics */}
      <div className="grid-auto" style={{ marginBottom: 'var(--space-6)' }}>
        {[
          { label: 'Comments Processed', value: a.commentsProcessed, icon: MessageSquare, color: 'var(--primary-400)' },
          { label: 'Replies Generated', value: a.repliesGenerated, icon: BarChart3, color: 'var(--sky-400)' },
          { label: 'Approval Rate', value: `${approvalRate}%`, icon: CheckCircle, color: 'var(--emerald-400)' },
          { label: 'Edit Rate', value: `${editRate}%`, icon: Edit3, color: 'var(--amber-400)' },
          { label: 'Time Saved', value: `${a.timeSavedMinutes}m`, icon: Clock, color: 'var(--primary-300)' },
          { label: 'Escalated', value: a.commentsEscalated, icon: AlertTriangle, color: 'var(--rose-400)' },
        ].map(m => (
          <div key={m.label} className="card">
            <m.icon size={18} style={{ color: m.color, marginBottom: 'var(--space-2)' }} />
            <div className="stat-value" style={{ color: m.color }}>{m.value}</div>
            <div className="stat-label">{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }} className="grid-responsive-analytics">
        {/* Actions Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Actions Taken</h3>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={actionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: '#6a6a82', fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: '#6a6a82', fontSize: 11 }} axisLine={false} />
                <Tooltip contentStyle={{ background: '#1a1a28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f0f0f5' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {actionData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Distribution */}
        <div className="card">
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Sentiment Distribution</h3>
          <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" strokeWidth={0}>
                  {sentimentData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1a28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f0f0f5' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            {sentimentData.map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-xs)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.fill }} />
                {s.name} ({s.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card" style={{ marginTop: 'var(--space-6)' }}>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Comment Categories</h3>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" tick={{ fill: '#6a6a82', fontSize: 11 }} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#a0a0b8', fontSize: 11 }} axisLine={false} width={140} />
              <Tooltip contentStyle={{ background: '#1a1a28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f0f0f5' }} />
              <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Report Preview */}
      <div className="card" style={{ marginTop: 'var(--space-6)', borderColor: 'var(--border-primary)' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
          Ghost Guardian Weekly
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }} className="grid-responsive-analytics">
          <div style={{ padding: 'var(--space-4)', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>Community Overview</div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{a.commentsProcessed} comments processed this period. Overall sentiment: positive ({state.intelligence?.audienceSentiment?.positivePercent || 0}%).</p>
          </div>
          <div style={{ padding: 'var(--space-4)', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>Guardian Activity</div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{a.repliesApproved} replies approved, {a.repliesEdited} edited, {a.commentsEscalated} escalated. Estimated {a.timeSavedMinutes} minutes saved.</p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .grid-responsive-analytics { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
