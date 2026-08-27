import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Brain, TrendingUp, HelpCircle, Sparkles, Heart, AlertTriangle, Eye, MessageSquare } from 'lucide-react';
import { demoComments } from '../data/demoComments';

export default function AudienceIntelligence() {
  const { state } = useApp();
  const intel = state.intelligence;

  if (!intel) {
    return (
      <div className="page-content">
        <h1 className="page-title">Audience Intelligence</h1>
        <div className="empty-state">
          <div className="empty-state-icon"><Brain size={28} /></div>
          <div className="empty-state-title">Not enough data yet</div>
          <div className="empty-state-text">Audience intelligence will populate as comments are processed.</div>
        </div>
      </div>
    );
  }

  const getComment = (id) => demoComments.find(c => c.id === id) || state.comments.find(c => c.id === id);

  return (
    <div className="page-content" style={{ maxWidth: 900 }}>
      <h1 className="page-title">Audience Intelligence</h1>
      <p className="page-subtitle">What your community is really saying.</p>

      {/* Audience Sentiment Overview */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Audience Sentiment</h3>
        <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
          {[
            { label: 'Positive', value: intel.audienceSentiment.positivePercent, color: 'var(--emerald-400)' },
            { label: 'Neutral', value: intel.audienceSentiment.neutralPercent, color: 'var(--text-tertiary)' },
            { label: 'Negative', value: intel.audienceSentiment.negativePercent, color: 'var(--rose-400)' },
            { label: 'Mixed', value: intel.audienceSentiment.mixedPercent, color: 'var(--amber-400)' },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, minWidth: 100 }}>
              <div className="stat-value" style={{ color: s.color }}>{s.value}%</div>
              <div className="stat-label">{s.label}</div>
              <div className="progress-bar" style={{ marginTop: 'var(--space-2)' }}>
                <div className="progress-fill" style={{ width: `${s.value}%`, background: s.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Health */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <Heart size={18} style={{ color: 'var(--emerald-400)' }} />
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Community Health</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
          {[
            { label: 'Constructive Discussion', value: intel.communityHealth.constructiveDiscussion, color: 'var(--emerald-400)' },
            { label: 'Support Level', value: intel.communityHealth.supportLevel, color: 'var(--primary-400)' },
            { label: 'Hostility Level', value: intel.communityHealth.hostilityLevel, color: 'var(--rose-400)', invert: true },
            { label: 'Spam Level', value: intel.communityHealth.spamLevel, color: 'var(--text-muted)', invert: true },
            { label: 'Unresolved Questions', value: intel.communityHealth.unresolvedQuestions, color: 'var(--amber-400)', isCount: true },
          ].map(h => (
            <div key={h.label} style={{ padding: 'var(--space-3)', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)' }}>
              <div className="stat-value" style={{ fontSize: 'var(--text-2xl)', color: h.color }}>
                {h.isCount ? h.value : `${h.value}%`}
              </div>
              <div className="stat-label">{h.label}</div>
              {!h.isCount && (
                <div className="progress-bar" style={{ marginTop: 'var(--space-2)' }}>
                  <div className="progress-fill" style={{ width: `${h.value}%`, background: h.color }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Top Questions */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <HelpCircle size={18} style={{ color: 'var(--sky-400)' }} />
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Top Questions</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {intel.topQuestions.map((q, i) => (
            <div key={i} style={{ padding: 'var(--space-4)', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <span className="badge badge-info">{q.mentions} mention{q.mentions > 1 ? 's' : ''}</span>
              </div>
              <p style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>{q.question}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Emerging Topics */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <TrendingUp size={18} style={{ color: 'var(--amber-400)' }} />
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Emerging Topics</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          {intel.emergingTopics.map((t, i) => (
            <div key={i} className="card" style={{ padding: 'var(--space-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontWeight: 700 }}>{t.topic}</span>
                <span className={`badge ${t.trend === 'rising' ? 'badge-success' : 'badge-neutral'}`}>
                  {t.trend === 'rising' ? '↑ Rising' : '— Stable'}
                </span>
              </div>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>{t.mentions} mentions across {t.commentIds?.length || 0} comments</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content Opportunities */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <Sparkles size={18} style={{ color: 'var(--primary-400)' }} />
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Content Opportunities</h3>
        </div>
        {intel.contentOpportunities.map((op, i) => (
          <div key={i} className="card card-glow" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-3)' }}>
            <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>{op.topic}</h4>
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <span className="badge badge-primary">{op.mentions} mentions</span>
              <span className="badge badge-success">{op.demand} demand</span>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)', lineHeight: 'var(--leading-relaxed)' }}>{op.evidence}</p>
            {op.suggestedAngle && (
              <div style={{ padding: 'var(--space-3)', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', borderLeft: '2px solid var(--primary-500)' }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--primary-400)', marginBottom: 'var(--space-1)' }}>Suggested Angle</div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>{op.suggestedAngle}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* You Should See This */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <Eye size={18} style={{ color: 'var(--amber-400)' }} />
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>You Should See This</h3>
        </div>
        {intel.youShouldSeeThis.map((item, i) => {
          const comment = getComment(item.commentId);
          return comment ? (
            <div key={i} style={{ padding: 'var(--space-4)', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-3)', borderLeft: '2px solid var(--amber-400)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--amber-400)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>{item.reason}</div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>"{comment.text}"</p>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>— {comment.author} · 👍 {comment.likes || 0}</div>
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
}
