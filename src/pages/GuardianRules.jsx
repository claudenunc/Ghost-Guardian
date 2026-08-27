import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Shield, Users, Zap, Sparkles, Check, AlertTriangle } from 'lucide-react';

export default function GuardianRules() {
  const { state, dispatch, addToast } = useApp();
  const settings = state.creator?.values || {};

  const setMode = (mode) => {
    dispatch({ type: 'SET_GUARDIAN_MODE', payload: mode });
    addToast('success', `Guardian mode set to ${mode}.`);
  };

  const toggleWit = () => {
    dispatch({ type: 'SET_GUARDIAN_WIT', payload: !state.guardianWit });
    addToast('info', state.guardianWit ? 'Guardian Wit disabled.' : 'Guardian Wit enabled — responses will be sharper.');
  };

  const modes = [
    { id: 'copilot', icon: Users, title: 'Copilot', desc: 'AI drafts responses. You approve before publishing. Default and recommended for most creators.', color: 'var(--primary-500)' },
    { id: 'autopilot', icon: Zap, title: 'Autopilot', desc: 'AI automatically handles low-risk categories (simple praise, common FAQs, basic acknowledgments). Everything else needs your approval.', color: 'var(--amber-500)' },
    { id: 'guardian', icon: Shield, title: 'Guardian', desc: 'Maximum safety mode. Prioritizes escalation and human review. Critical situations surfaced immediately.', color: 'var(--emerald-500)' },
  ];

  return (
    <div className="page-content" style={{ maxWidth: 800 }}>
      <h1 className="page-title">Guardian Rules</h1>
      <p className="page-subtitle">Configure how Ghost Guardian operates and responds.</p>

      {/* Operating Mode */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Operating Mode</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {modes.map(mode => (
            <div key={mode.id} className={`mode-card ${state.guardianMode === mode.id ? 'selected' : ''}`} onClick={() => setMode(mode.id)} style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4) var(--space-5)' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: mode.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: mode.color, flexShrink: 0 }}>
                <mode.icon size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, marginBottom: 'var(--space-1)' }}>{mode.title}</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>{mode.desc}</div>
              </div>
              {state.guardianMode === mode.id && <Check size={20} style={{ color: 'var(--primary-400)', flexShrink: 0 }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Guardian Wit */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>Guardian Wit</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                Enable cleverer, sharper responses to trolling and hostility. Not an insult generator — composed intelligence that outclasses hostility without becoming hostile.
              </div>
            </div>
          </div>
          <div className={`toggle ${state.guardianWit ? 'active' : ''}`} onClick={toggleWit} />
        </div>
      </div>

      {/* Response Rules by Category */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Response Rules by Category</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {[
            { category: 'Praise', action: 'Auto-respond (Copilot: draft)', risk: 'Low', color: 'var(--emerald-400)' },
            { category: 'Questions', action: 'Draft response, await approval', risk: 'Low', color: 'var(--sky-400)' },
            { category: 'Constructive Criticism', action: 'Draft response, await approval', risk: 'Low', color: 'var(--amber-400)' },
            { category: 'Disagreement', action: 'Draft response, await approval', risk: 'Low', color: 'var(--orange-400)' },
            { category: 'Humor', action: 'Draft response', risk: 'Low', color: 'var(--primary-300)' },
            { category: 'Trolling', action: state.guardianWit ? 'De-escalate with wit' : 'Recommend silence', risk: 'Low', color: 'var(--orange-500)' },
            { category: 'Harassment', action: 'Set boundary, escalate for review', risk: 'High', color: 'var(--rose-400)' },
            { category: 'Threats', action: 'ESCALATE IMMEDIATELY', risk: 'Critical', color: 'var(--rose-500)' },
            { category: 'Spam', action: 'Ignore silently', risk: 'Low', color: 'var(--text-muted)' },
            { category: 'Sensitive', action: 'Draft with care, require approval', risk: 'Medium', color: 'var(--amber-300)' },
          ].map(rule => (
            <div key={rule.category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3)', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div className="risk-dot" style={{ background: rule.color }} />
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, minWidth: 150 }}>{rule.category}</span>
              </div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', flex: 1, textAlign: 'center' }}>{rule.action}</span>
              <span className={`badge ${rule.risk === 'Critical' ? 'badge-danger' : rule.risk === 'High' ? 'badge-warning' : 'badge-neutral'}`}>{rule.risk}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Rules */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <AlertTriangle size={18} style={{ color: 'var(--rose-400)' }} />
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Safety Rules (Always Active)</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {[
            'Credible threats are always escalated to human review immediately',
            'Doxxing attempts are flagged and never responded to',
            'Self-harm indicators trigger compassionate handling + escalation',
            'Ghost Guardian never impersonates the creator',
            'Ghost Guardian never fabricates facts',
            'Ghost Guardian never engages in harassment or humiliation',
            'Low-confidence classifications route to human review',
          ].map((rule, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              <Shield size={14} style={{ color: 'var(--emerald-400)', flexShrink: 0 }} />
              {rule}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
