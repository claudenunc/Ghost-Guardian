import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield } from 'lucide-react';
import { Button, Input, SectionTitle, Switch, Textarea } from '../components/guardian/atoms';
import { useGuardian } from '../lib/store';

const defaultVoice = {
  tone: 'Warm, direct, and thoughtful', warmth: 75, formality: 35, humor: 45, verbosity: 'adaptive',
  emojiPreference: 'rarely', vocabulary: '', preferredPhrases: '', forbiddenPhrases: '',
  boundaries: '', neverDiscussTopics: '', approvedExamples: [], rejectedExamples: [], editedExamples: [],
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding, showToast, runtime } = useGuardian();
  const [creator, setCreator] = useState({ displayName: '', channelName: '', description: '', topics: '' });
  const [voice, setVoice] = useState(defaultVoice);
  const [copilotOnly, setCopilotOnly] = useState(true);

  const submit = (event) => {
    event.preventDefault();
    completeOnboarding({ creator, voice, mode: 'copilot' });
    showToast('Demo onboarding saved locally. No account or platform connection was created.', 'info');
    navigate('/app');
  };

  return (
    <main className="min-h-screen ghost-aurora text-[#f4f6fb]">
      <form className="onboarding-form ghost-panel" onSubmit={submit}>
        <SectionTitle title="Set up your demo Guardian" subtitle="Structured creator data for the fixture environment. Production onboarding will use the same domain model after real authentication is added." />
        <p className="demo-notice"><Shield size={16} /> {runtime.isDemo ? 'Demo Mode: this data stays in this browser and does not connect a creator account.' : 'Production onboarding is unavailable.'}</p>

        <fieldset className="form-section">
          <legend>Creator identity</legend>
          <label htmlFor="creator-name">Display name</label>
          <Input id="creator-name" required value={creator.displayName} onChange={(event) => setCreator({ ...creator, displayName: event.target.value })} placeholder="Alex Chen" />
          <label htmlFor="channel-name">Channel or show name</label>
          <Input id="channel-name" value={creator.channelName} onChange={(event) => setCreator({ ...creator, channelName: event.target.value })} placeholder="The Signal" />
          <label htmlFor="creator-topics">Topics</label>
          <Input id="creator-topics" value={creator.topics} onChange={(event) => setCreator({ ...creator, topics: event.target.value })} placeholder="Technology, philosophy, science" />
          <label htmlFor="creator-description">About the creator</label>
          <Textarea id="creator-description" value={creator.description} onChange={(event) => setCreator({ ...creator, description: event.target.value })} placeholder="What does this creator make?" />
        </fieldset>

        <fieldset className="form-section">
          <legend>Creator voice</legend>
          <label htmlFor="voice-tone">Tone</label>
          <Input id="voice-tone" value={voice.tone} onChange={(event) => setVoice({ ...voice, tone: event.target.value })} />
          <label htmlFor="voice-preferred">Preferred phrases</label>
          <Textarea id="voice-preferred" value={voice.preferredPhrases} onChange={(event) => setVoice({ ...voice, preferredPhrases: event.target.value })} placeholder="Phrases that sound like the creator" />
          <label htmlFor="voice-forbidden">Forbidden phrases</label>
          <Textarea id="voice-forbidden" value={voice.forbiddenPhrases} onChange={(event) => setVoice({ ...voice, forbiddenPhrases: event.target.value })} placeholder="Phrases never to use" />
        </fieldset>

        <fieldset className="form-section">
          <legend>Policies and boundaries</legend>
          <label htmlFor="voice-boundaries">Requires creator review</label>
          <Textarea id="voice-boundaries" value={voice.boundaries} onChange={(event) => setVoice({ ...voice, boundaries: event.target.value })} placeholder="Personal disclosures, medical claims, legal questions..." />
          <label htmlFor="voice-never">Never discuss</label>
          <Textarea id="voice-never" value={voice.neverDiscussTopics} onChange={(event) => setVoice({ ...voice, neverDiscussTopics: event.target.value })} placeholder="Topics the Guardian must not address" />
          <div className="switch-row">
            <div><strong>Copilot-only review</strong><p>All drafts remain for creator approval in this demo.</p></div>
            <Switch checked={copilotOnly} onChange={setCopilotOnly} aria-label="Copilot-only review" />
          </div>
        </fieldset>

        <Button type="submit"><ArrowRight size={16} /> Save demo setup</Button>
      </form>
    </main>
  );
}
