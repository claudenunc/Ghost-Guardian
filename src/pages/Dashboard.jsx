import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { MessageSquare, CheckCircle, AlertTriangle, Clock, TrendingUp, Users, Zap, Brain, ArrowRight, Shield, Eye, Sparkles, Ghost } from 'lucide-react';

export default function Dashboard() {
  const { state } = useApp();
  const navigate = useNavigate();
  const { processedComments, analytics, intelligence, communityMembers, creator } = state;

  const pending = processedComments.filter(p => p.status === 'pending').length;
  const escalated = processedComments.filter(p => p.strategy?.requiresHumanReview || p.classification?.risk === 'critical').length;
  const approved = analytics.repliesApproved;
  const totalProcessed = analytics.commentsProcessed;

  // You should see this
  const shouldSeeComments = intelligence?.youShouldSeeThis?.map(item => {
    const pc = processedComments.find(p => p.comment.id === item.commentId);
    return pc ? { ...item, comment: pc.comment, classification: pc.classification } : null;
  }).filter(Boolean) || [];

  // Content opportunities
  const opportunities = intelligence?.contentOpportunities || [];

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <h1 className="page-title">Guardian Dashboard</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            {state.guardianPaused ? '⏸ Guardian is paused' : '🛡️ Your Guardian is watching'}
            {state.isDemo && ' · Demo Mode'}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid-auto" style={{ marginBottom: 'var(--space-6)' }}>
        {[
          { label: 'New Comments', value: pending, icon: MessageSquare, color: 'var(--primary-400)', onClick: () => navigate('/app/inbox') },
          { label: 'Needs Attention', value: escalated, icon: AlertTriangle, color: 'var(--rose-400)', onClick: () => navigate('/app/inbox') },
          { label: 'Approved', value: approved, icon: CheckCircle, color: 'var(--emerald-400)' },
          { label: 'Time Saved', value: `${analytics.timeSavedMinutes}m`, icon: Clock, color: 'var(--amber-400)' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ cursor: stat.onClick ? 'pointer' : 'default' }} onClick={stat.onClick}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <stat.icon size={20} style={{ color: stat.color }} />
              {stat.onClick && <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />}
            </div>
            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Escalated / Risk Alerts */}
      {escalated > 0 && (
        <div className="escalation-banner" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="escalation-banner-icon"><AlertTriangle size={20} /></div>
          <div className="escalation-banner-content">
            <div className="escalation-banner-title">HUMAN ATTENTION REQUIRED</div>
            <div className="escalation-banner-text">{escalated} comment{escalated > 1 ? 's' : ''} flagged for your review — including potential threats or sensitive content.</div>
          </div>
          <button onClick={() => navigate('/app/inbox')} className="btn btn-sm btn-danger" style={{ flexShrink: 0 }}>Review Now</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }} className="grid-responsive">
        {/* Your Audience Is Trying To Tell You */}
        <div className="card" style={{ gridColumn: intelligence?.emergingTopics?.length ? 'span 1' : 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <Brain size={18} style={{ color: 'var(--primary-400)' }} />
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>Your Audience Is Trying To Tell You</h3>
          </div>
          {intelligence?.topQuestions?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {intelligence.topQuestions.slice(0, 3).map((q, i) => (
                <div key={i} style={{ padding: 'var(--space-3)', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                    <span className="badge badge-info">{q.mentions} mentions</span>
                  </div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{q.question}</p>
                </div>
              ))}
              <button onClick={() => navigate('/app/intelligence')} className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>
                View All Intelligence <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Not enough data yet.</p>
          )}
        </div>

        {/* Emerging Topics */}
        {intelligence?.emergingTopics?.length > 0 && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <TrendingUp size={18} style={{ color: 'var(--amber-400)' }} />
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>Emerging Topics</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {intelligence.emergingTopics.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3)', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{t.topic}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{t.mentions} mentions</div>
                  </div>
                  <span className={`badge ${t.trend === 'rising' ? 'badge-success' : 'badge-neutral'}`}>
                    {t.trend === 'rising' ? '↑ Rising' : '— Stable'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* You Should See This */}
      {shouldSeeComments.length > 0 && (
        <div className="card" style={{ marginTop: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <Eye size={18} style={{ color: 'var(--amber-400)' }} />
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>You Should See This</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {shouldSeeComments.slice(0, 4).map((item, i) => (
              <div key={i} style={{ padding: 'var(--space-4)', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', borderLeft: '2px solid var(--amber-400)' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--amber-400)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>{item.reason}</div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                  "{item.comment.text?.slice(0, 200)}{item.comment.text?.length > 200 ? '...' : ''}"
                </p>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
                  — {item.comment.author}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Opportunities */}
      {opportunities.length > 0 && (
        <div className="card" style={{ marginTop: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <Sparkles size={18} style={{ color: 'var(--primary-400)' }} />
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>Content Opportunities</h3>
          </div>
          <div className="grid-auto">
            {opportunities.map((op, i) => (
              <div key={i} className="card card-glow" style={{ padding: 'var(--space-4)' }}>
                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>{op.topic}</h4>
                <span className="badge badge-primary" style={{ marginBottom: 'var(--space-2)' }}>{op.mentions} mentions · {op.demand} demand</span>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', lineHeight: 'var(--leading-relaxed)' }}>{op.evidence}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coming Soon: Creator Assistant */}
      <div className="card" style={{ marginTop: 'var(--space-6)', borderStyle: 'dashed', opacity: 0.7 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ghost size={20} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>Coming Soon — Creator AI Assistant</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Episode research, show notes, content ideas, guest research, and more.</div>
          </div>
          <span className="badge badge-neutral" style={{ marginLeft: 'auto' }}>Future</span>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .grid-responsive { grid-template-columns: 1fr !important; }
          .grid-responsive .card { grid-column: span 1 !important; }
        }
      `}</style>
    </div>
  );
}
