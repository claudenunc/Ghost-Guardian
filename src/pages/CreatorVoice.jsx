import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Mic, Plus, Save, Trash2, MessageSquare, Ghost, Sparkles, BookOpen, FileText } from 'lucide-react';
import { testVoice } from '../services/ai/pipeline';
import { classify } from '../services/ai/classifier';
import { getVoiceDescription } from '../services/ai/voice';

export default function CreatorVoice() {
  const { state, dispatch, addToast } = useApp();
  const voice = state.creator?.voice || {};
  const [activeTab, setActiveTab] = useState('profile');
  const [testInput, setTestInput] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [newSource, setNewSource] = useState('');
  const [sourceType, setSourceType] = useState('text');

  const handleTest = () => {
    if (!testInput.trim()) return;
    const comment = { text: testInput, author: 'Test User' };
    const classification = classify(comment);
    const variations = testVoice(testInput, classification);
    setTestResults({ classification, variations });
  };

  const addSource = () => {
    if (!newSource.trim()) return;
    const knowledge = [...(state.knowledge || []), { type: sourceType.toUpperCase(), content: newSource, addedAt: new Date().toISOString() }];
    dispatch({ type: 'SET_KNOWLEDGE', payload: knowledge });
    setNewSource('');
    addToast('success', 'Source material added to knowledge base.');
  };

  const removeKnowledge = (index) => {
    const knowledge = state.knowledge.filter((_, i) => i !== index);
    dispatch({ type: 'SET_KNOWLEDGE', payload: knowledge });
  };

  const tabs = [
    { id: 'profile', label: 'Voice Profile', icon: Mic },
    { id: 'test', label: 'Test My Voice', icon: Sparkles },
    { id: 'sources', label: 'Source Material', icon: BookOpen },
    { id: 'examples', label: 'Training Examples', icon: FileText },
  ];

  return (
    <div className="page-content" style={{ maxWidth: 800 }}>
      <h1 className="page-title">Creator Voice</h1>
      <p className="page-subtitle">Your voice profile shapes how Ghost Guardian communicates on your behalf.</p>

      <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
        {tabs.map(t => (
          <button key={t.id} className={`tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="card animate-fade-in">
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Voice Profile</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
            Current style: <strong>{getVoiceDescription(voice) || 'Not configured'}</strong>
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            {[
              { label: 'Formality', value: voice.formality, low: 'Casual', high: 'Formal' },
              { label: 'Humor', value: voice.humor, low: 'Serious', high: 'Playful' },
              { label: 'Warmth', value: voice.warmth, low: 'Reserved', high: 'Warm' },
              { label: 'Directness', value: voice.directness, low: 'Diplomatic', high: 'Direct' },
              { label: 'Depth', value: voice.depth, low: 'Brief', high: 'Deep' },
              { label: 'Sarcasm', value: voice.sarcasm, low: 'Straight', high: 'Sarcastic' },
            ].map(item => (
              <div key={item.label} style={{ padding: 'var(--space-3)', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{item.low}</span>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{item.high}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${item.value || 50}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            {[
              { label: 'Emojis', active: voice.useEmojis },
              { label: 'Slang', active: voice.useSlang },
              { label: 'Questions', active: voice.askQuestions },
              { label: 'Short responses', active: voice.preferShort },
              { label: 'Swearing', active: voice.swearing },
            ].map(item => (
              <span key={item.label} className={`badge ${item.active ? 'badge-primary' : 'badge-neutral'}`} style={{ padding: 'var(--space-1) var(--space-3)' }}>
                {item.active ? '✓' : '✕'} {item.label}
              </span>
            ))}
          </div>
          {voice.commonPhrases?.length > 0 && (
            <div style={{ marginTop: 'var(--space-5)' }}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Common Phrases</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {voice.commonPhrases.map((p, i) => (
                  <span key={i} className="badge badge-neutral badge-lg">"{p}"</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'test' && (
        <div className="card animate-fade-in">
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Test My Voice</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
            Enter any comment to see how Ghost Guardian would respond in different styles.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <textarea className="input" placeholder={"Try: \"This is the dumbest thing I've ever watched.\""} value={testInput} onChange={e => setTestInput(e.target.value)} rows={2} style={{ flex: 1 }} />
            <button onClick={handleTest} className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>
              <Sparkles size={14} /> Test
            </button>
          </div>
          {testResults && (
            <div>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <span className="badge badge-info" style={{ marginRight: 'var(--space-2)' }}>Classified: {testResults.classification.category}</span>
                <span className="badge badge-neutral">Sentiment: {testResults.classification.sentiment}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {Object.entries(testResults.variations).map(([style, result]) => (
                  <div key={style} style={{ padding: 'var(--space-4)', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', borderLeft: '2px solid var(--primary-500)' }}>
                    <span className="badge badge-primary" style={{ marginBottom: 'var(--space-2)', display: 'inline-flex', textTransform: 'capitalize' }}>{style}</span>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                      {result?.text || 'No response — silence recommended'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'sources' && (
        <div className="card animate-fade-in">
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Source Material</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
            Add content that helps Ghost Guardian understand your knowledge and perspective.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
            <select className="select input-sm" value={sourceType} onChange={e => setSourceType(e.target.value)}>
              <option value="text">Pasted Text</option>
              <option value="faq">FAQ</option>
              <option value="transcript">Transcript</option>
              <option value="example_response">Example Response</option>
              <option value="creator_knowledge">Creator Knowledge</option>
              <option value="boundary">Boundary</option>
            </select>
          </div>
          <textarea className="input" placeholder="Paste your content here..." value={newSource} onChange={e => setNewSource(e.target.value)} rows={4} style={{ marginBottom: 'var(--space-3)' }} />
          <button onClick={addSource} className="btn btn-primary btn-sm"><Plus size={14} /> Add to Knowledge Base</button>

          {state.knowledge?.length > 0 && (
            <div style={{ marginTop: 'var(--space-6)' }}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>Knowledge Base ({state.knowledge.length} items)</div>
              {state.knowledge.map((k, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-2)' }}>
                  <span className="badge badge-neutral" style={{ flexShrink: 0 }}>{k.type}</span>
                  <p style={{ flex: 1, fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }} className="line-clamp-2">
                    {k.question || k.content}
                  </p>
                  <button onClick={() => removeKnowledge(i)} className="btn btn-ghost btn-sm" style={{ padding: 4, flexShrink: 0 }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'examples' && (
        <div className="card animate-fade-in">
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Training Examples</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
            Responses you've approved or edited become training examples that improve Ghost Guardian's voice matching.
          </p>
          {state.voiceExamples?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {state.voiceExamples.map((ex, i) => (
                <div key={i} style={{ padding: 'var(--space-4)', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>Comment:</div>
                  <p style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>"{ex.comment}"</p>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--primary-400)', marginBottom: 'var(--space-1)' }}>Approved Response:</div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>"{ex.response}"</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
              <div className="empty-state-icon"><MessageSquare size={24} /></div>
              <div className="empty-state-title">No examples yet</div>
              <div className="empty-state-text">Approve or edit responses in the Comment Inbox and click "Save as Example" to train your voice.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
