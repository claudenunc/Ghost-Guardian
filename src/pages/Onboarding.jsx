import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Ghost, ArrowRight, ArrowLeft, Check, Sparkles, Shield, Mic, Heart, AlertTriangle, Eye, Users, Zap } from 'lucide-react';
import { defaultVoice } from '../services/ai/voice';

const steps = ['Welcome', 'About You', 'Personality', 'Communication', 'Values', 'Boundaries', 'Test Voice', 'Activate'];

export default function Onboarding() {
  const navigate = useNavigate();
  const { dispatch, addToast } = useApp();
  const [step, setStep] = useState(0);

  const [creator, setCreator] = useState({
    name: '', brandName: '', channelName: '', description: '', topics: [], audience: '', contentType: '',
  });

  const [voice, setVoice] = useState({ ...defaultVoice });

  const [values, setValues] = useState({
    communityFeel: '', encouraged: [], unacceptable: [], principles: [],
  });

  const [boundaries, setBoundaries] = useState({
    avoidTopics: [], requireApproval: [], neverDiscuss: [], sensitiveTopics: [],
  });

  const [testComment, setTestComment] = useState('');
  const [guardianMode, setGuardianMode] = useState('copilot');

  const topicOptions = ['Technology', 'Philosophy', 'Science', 'Business', 'Health', 'Education', 'Entertainment', 'Gaming', 'Music', 'Art', 'Politics', 'Sports', 'Lifestyle', 'Comedy', 'News', 'Personal Development'];
  const encouragedOptions = ['Thoughtful disagreement', 'Genuine questions', 'Personal stories', 'Constructive criticism', 'Humor', 'Supporting others', 'Sharing resources'];
  const unacceptableOptions = ['Personal attacks', 'Hate speech', 'Doxxing', 'Trolling vulnerable people', 'Spam', 'Misinformation', 'Harassment'];
  const boundaryTopicOptions = ['Medical advice', 'Legal claims', 'Financial recommendations', 'Personal relationships', 'Religious debates', 'Political endorsements'];

  const updateCreator = (key, val) => setCreator(prev => ({ ...prev, [key]: val }));
  const updateVoice = (key, val) => setVoice(prev => ({ ...prev, [key]: val }));

  const toggleInArray = (arr, setFn, key, item) => {
    setFn(prev => {
      const current = prev[key] || [];
      return { ...prev, [key]: current.includes(item) ? current.filter(i => i !== item) : [...current, item] };
    });
  };

  const next = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const finish = () => {
    const fullCreator = {
      ...creator,
      voice,
      values,
      boundaries,
      knowledge: [],
      subscriberCount: 0,
      totalVideos: 0,
      yearsActive: 0,
    };
    dispatch({ type: 'SET_CREATOR', payload: fullCreator });
    dispatch({ type: 'SET_ONBOARDED', payload: true });
    dispatch({ type: 'SET_GUARDIAN_MODE', payload: guardianMode });
    addToast('success', 'Your Guardian is active. Welcome.');
    navigate('/app');
  };

  const renderSlider = (label1, label2, key, value) => (
    <div className="personality-row">
      <span className="personality-label">{label1}</span>
      <div className="personality-track" onClick={e => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
        updateVoice(key, Math.max(0, Math.min(100, pct)));
      }}>
        <div className="personality-fill" style={{ width: `${value}%` }} />
        <div className="personality-thumb" style={{ left: `${value}%` }} />
      </div>
      <span className="personality-label-right">{label2}</span>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 0: // Welcome
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-600), var(--primary-400))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-6)' }} className="animate-ghost-glow">
              <Ghost size={40} color="white" />
            </div>
            <h2 className="onboarding-step-title">Meet Your Guardian</h2>
            <p className="onboarding-step-subtitle">
              Ghost Guardian is your AI community assistant. It learns how you communicate,
              understands your boundaries, and helps you engage with your audience without
              the emotional weight of reading every comment yourself.
            </p>
            <div style={{ padding: 'var(--space-5)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', textAlign: 'left', marginTop: 'var(--space-6)' }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 'var(--leading-relaxed)' }}>
                "Someone capable is quietly watching your back."
              </p>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginTop: 'var(--space-4)' }}>
              Let's set up your Guardian. This takes about 3 minutes.
            </p>
          </div>
        );

      case 1: // About You
        return (
          <>
            <h2 className="onboarding-step-title">About You</h2>
            <p className="onboarding-step-subtitle">Tell us about yourself and your content so Ghost Guardian can understand your world.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="input-group">
                <label className="input-label">Your Name</label>
                <input className="input" placeholder="e.g. Alex Chen" value={creator.name} onChange={e => updateCreator('name', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Brand / Show Name</label>
                <input className="input" placeholder="e.g. The Signal" value={creator.brandName} onChange={e => updateCreator('brandName', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Channel Name</label>
                <input className="input" placeholder="e.g. @TheSignalPodcast" value={creator.channelName} onChange={e => updateCreator('channelName', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">What do you create?</label>
                <textarea className="input" placeholder="Describe your content, your show, or your brand..." value={creator.description} onChange={e => updateCreator('description', e.target.value)} rows={3} />
              </div>
              <div className="input-group">
                <label className="input-label">Main Topics</label>
                <div className="option-chips">
                  {topicOptions.map(t => (
                    <button key={t} className={`option-chip ${creator.topics.includes(t) ? 'selected' : ''}`} onClick={() => {
                      updateCreator('topics', creator.topics.includes(t) ? creator.topics.filter(x => x !== t) : [...creator.topics, t]);
                    }}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Who is your audience?</label>
                <input className="input" placeholder="e.g. Curious thinkers, tech enthusiasts, philosophy nerds" value={creator.audience} onChange={e => updateCreator('audience', e.target.value)} />
              </div>
            </div>
          </>
        );

      case 2: // Personality
        return (
          <>
            <h2 className="onboarding-step-title">Your Personality</h2>
            <p className="onboarding-step-subtitle">How would you describe yourself? Adjust the sliders to match your communication style.</p>
            <div className="personality-slider">
              {renderSlider('Casual', 'Formal', 'formality', voice.formality)}
              {renderSlider('Serious', 'Playful', 'humor', voice.humor)}
              {renderSlider('Reserved', 'Warm', 'warmth', voice.warmth)}
              {renderSlider('Diplomatic', 'Direct', 'directness', voice.directness)}
              {renderSlider('Brief', 'Deep', 'depth', voice.depth)}
              {renderSlider('Straight', 'Sarcastic', 'sarcasm', voice.sarcasm)}
            </div>
          </>
        );

      case 3: // Communication
        return (
          <>
            <h2 className="onboarding-step-title">Communication Preferences</h2>
            <p className="onboarding-step-subtitle">These details help Ghost Guardian match your actual communication style.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              {[
                { label: 'Do you use emojis?', key: 'useEmojis' },
                { label: 'Do you use casual slang?', key: 'useSlang' },
                { label: 'Do you ask questions in responses?', key: 'askQuestions' },
                { label: 'Do you prefer shorter responses?', key: 'preferShort' },
                { label: 'Do you occasionally swear?', key: 'swearing' },
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 'var(--text-base)' }}>{item.label}</span>
                  <div className={`toggle ${voice[item.key] ? 'active' : ''}`} onClick={() => updateVoice(item.key, !voice[item.key])} />
                </div>
              ))}
              <div className="input-group">
                <label className="input-label">Phrases you commonly use (comma-separated)</label>
                <input className="input" placeholder="e.g. Hell yeah, Here is the thing though" value={voice.commonPhrases.join(', ')} onChange={e => updateVoice('commonPhrases', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
              </div>
            </div>
          </>
        );

      case 4: // Values
        return (
          <>
            <h2 className="onboarding-step-title">Your Values</h2>
            <p className="onboarding-step-subtitle">What do you want your community to feel like?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div className="input-group">
                <label className="input-label">Describe your ideal community</label>
                <textarea className="input" placeholder="A place where..." value={values.communityFeel} onChange={e => setValues(v => ({ ...v, communityFeel: e.target.value }))} rows={3} />
              </div>
              <div className="input-group">
                <label className="input-label">Behavior you encourage</label>
                <div className="option-chips">
                  {encouragedOptions.map(o => (
                    <button key={o} className={`option-chip ${values.encouraged.includes(o) ? 'selected' : ''}`} onClick={() => toggleInArray(values, setValues, 'encouraged', o)}>{o}</button>
                  ))}
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Behavior that's unacceptable</label>
                <div className="option-chips">
                  {unacceptableOptions.map(o => (
                    <button key={o} className={`option-chip ${values.unacceptable.includes(o) ? 'selected' : ''}`} onClick={() => toggleInArray(values, setValues, 'unacceptable', o)}>{o}</button>
                  ))}
                </div>
              </div>
            </div>
          </>
        );

      case 5: // Boundaries
        return (
          <>
            <h2 className="onboarding-step-title">Boundaries</h2>
            <p className="onboarding-step-subtitle">What topics should Ghost Guardian handle carefully or avoid entirely?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div className="input-group">
                <label className="input-label">Topics requiring your approval before responding</label>
                <div className="option-chips">
                  {boundaryTopicOptions.map(o => (
                    <button key={o} className={`option-chip ${boundaries.requireApproval.includes(o) ? 'selected' : ''}`} onClick={() => toggleInArray(boundaries, setBoundaries, 'requireApproval', o)}>{o}</button>
                  ))}
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Topics to never discuss</label>
                <input className="input" placeholder="e.g. Family details, home address, financial info" value={boundaries.neverDiscuss.join(', ')} onChange={e => setBoundaries(b => ({ ...b, neverDiscuss: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Sensitive topics (handle with extra care)</label>
                <input className="input" placeholder="e.g. Mental health, grief, addiction" value={boundaries.sensitiveTopics.join(', ')} onChange={e => setBoundaries(b => ({ ...b, sensitiveTopics: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} />
              </div>
            </div>
          </>
        );

      case 6: // Test Voice
        return (
          <>
            <h2 className="onboarding-step-title">Test Your Voice</h2>
            <p className="onboarding-step-subtitle">Enter a sample comment to see how Ghost Guardian would respond in your voice.</p>
            <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
              <textarea className="input" placeholder={"Try: \"I've been following your show for a year and this episode really resonated with me.\""} value={testComment} onChange={e => setTestComment(e.target.value)} rows={3} />
            </div>
            {testComment && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {['Calm', 'Direct', 'Warm', 'Humorous'].map((style, i) => {
                  const responses = {
                    Calm: "Thank you for being here and for sharing that. It's always meaningful to hear when something resonates.",
                    Direct: "Appreciate that. A year of watching — that means a lot. What specifically hit you in this one?",
                    Warm: "A whole year! That genuinely makes my day. The fact that this one landed with you in a special way — I'd love to know which part.",
                    Humorous: "A year?! You deserve some kind of loyalty badge. But seriously, thank you. What part of this one got you?",
                  };
                  return (
                    <div key={style} className="card" style={{ padding: 'var(--space-4)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                        <span className="badge badge-primary">{style}</span>
                      </div>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                        {responses[style]}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        );

      case 7: // Activate
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--emerald-600), var(--emerald-400))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-6)' }}>
              <Shield size={40} color="white" />
            </div>
            <h2 className="onboarding-step-title">Activate Your Guardian</h2>
            <p className="onboarding-step-subtitle">Choose how Ghost Guardian operates. You can change this anytime.</p>
            <div className="mode-selector" style={{ flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
              {[
                { id: 'copilot', icon: Users, title: 'Copilot', desc: 'AI drafts responses. You approve before publishing.', color: 'var(--primary-500)' },
                { id: 'autopilot', icon: Zap, title: 'Autopilot', desc: 'AI handles low-risk comments automatically. Everything else needs your approval.', color: 'var(--amber-500)' },
                { id: 'guardian', icon: Shield, title: 'Guardian', desc: 'Maximum safety. Critical situations surfaced immediately.', color: 'var(--emerald-500)' },
              ].map(mode => (
                <div key={mode.id} className={`mode-card ${guardianMode === mode.id ? 'selected' : ''}`} onClick={() => setGuardianMode(mode.id)} style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4) var(--space-5)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: mode.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: mode.color, flexShrink: 0 }}>
                    <mode.icon size={22} />
                  </div>
                  <div>
                    <div className="mode-card-title">{mode.title}</div>
                    <div className="mode-card-desc">{mode.desc}</div>
                  </div>
                  {guardianMode === mode.id && <Check size={20} style={{ marginLeft: 'auto', color: 'var(--primary-400)' }} />}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card" key={step}>
        {/* Step indicator */}
        <div className="onboarding-step-indicator">
          {steps.map((_, i) => (
            <div key={i} className={`onboarding-step-dot ${i < step ? 'completed' : i === step ? 'active' : ''}`} />
          ))}
        </div>

        {/* Step content */}
        <div className="animate-fade-in-up">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="onboarding-actions">
          {step > 0 ? (
            <button onClick={prev} className="btn btn-ghost" style={{ gap: 'var(--space-2)' }}>
              <ArrowLeft size={16} /> Back
            </button>
          ) : <div />}
          {step < steps.length - 1 ? (
            <button onClick={next} className="btn btn-primary" style={{ gap: 'var(--space-2)' }}>
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={finish} className="btn btn-primary btn-lg" style={{ gap: 'var(--space-2)' }}>
              <Sparkles size={16} /> Activate Guardian
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
