import React, { useState } from 'react';
import {
  Mic,
  Plus,
  Sparkles,
  Trash2,
  BookOpen,
  Sliders,
  Check,
  Shield,
  FileText,
} from 'lucide-react';
import {
  Button,
  Chip,
  EmptyState,
  Input,
  SectionTitle,
  Slider,
  Switch,
  Textarea,
} from '../components/guardian/atoms';
import { useGuardian } from '../lib/store';

const categories = [
  'FAQ',
  'BOUNDARY',
  'PERSONAL_PREFERENCE',
  'CONTENT',
  'EXAMPLE_RESPONSE',
];

export default function CreatorVoice() {
  const { voice, updateVoice, knowledge, addKnowledge, removeKnowledge, learning, showToast } = useGuardian();

  const [draft, setDraft] = useState({
    category: 'FAQ',
    title: '',
    body: '',
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <SectionTitle
        title="Creator Voice Engine"
        subtitle="Calibrate how Ghost Guardian communicates on your behalf — maintaining your authentic voice, boundaries, and knowledge."
      />

      {/* CORE IDENTITY & TRAITS SLIDERS */}
      <section className="ghost-panel p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2">
          <Sliders size={18} className="text-[#4de1dc]" />
          <h3 className="font-display text-lg text-white">Voice & Tone Calibration</h3>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <SliderRow
            label="Formality"
            value={voice.formality || 35}
            hint="Casual & grounded ↔ Academic & formal"
            onChange={(v) => updateVoice({ formality: v })}
          />
          <SliderRow
            label="Warmth & Empathy"
            value={voice.warmth || 75}
            hint="Clinical ↔ Generous & connected"
            onChange={(v) => updateVoice({ warmth: v })}
          />
          <SliderRow
            label="Directness"
            value={voice.directness || 75}
            hint="Diplomatic ↔ Blunt & punchy"
            onChange={(v) => updateVoice({ directness: v })}
          />
          <SliderRow
            label="Humor & Wit"
            value={voice.humor || 45}
            hint="Deadpan / serious ↔ Playful"
            onChange={(v) => updateVoice({ humor: v })}
          />
          <SliderRow
            label="Intellectual Depth"
            value={voice.depth || 80}
            hint="Concise ↔ Philosophical & nuanced"
            onChange={(v) => updateVoice({ depth: v })}
          />
          <SliderRow
            label="Sarcasm / Sharpness"
            value={voice.sarcasm || 25}
            hint="None ↔ Witty & wry"
            onChange={(v) => updateVoice({ sarcasm: v })}
          />
        </div>

        {/* Toggles */}
        <div className="grid gap-4 pt-4 border-t border-white/10 sm:grid-cols-2 lg:grid-cols-3">
          <ToggleRow
            label="Allow occasional swearing"
            hint="E.g. 'Hell yeah', 'shit'"
            checked={voice.swears}
            onChange={(v) => updateVoice({ swears: v })}
          />
          <ToggleRow
            label="Include Emojis"
            hint="Minimal, contextual emojis"
            checked={voice.usesEmojis}
            onChange={(v) => updateVoice({ usesEmojis: v })}
          />
          <ToggleRow
            label="Ask Follow-Up Questions"
            hint="Invite deeper community dialog"
            checked={voice.asksQuestions}
            onChange={(v) => updateVoice({ asksQuestions: v })}
          />
          <ToggleRow
            label="Prefer Short Replies"
            hint="Keep responses under 2 sentences"
            checked={voice.preferShort}
            onChange={(v) => updateVoice({ preferShort: v })}
          />
        </div>
      </section>

      {/* VOCABULARY & BOUNDARIES */}
      <section className="ghost-panel p-6 sm:p-8 space-y-6">
        <h3 className="font-display text-lg text-white">Phrases & Custom Boundaries</h3>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold tracking-wider text-[#8f97b0] uppercase">
              Common Phrases to Emphasize
            </label>
            <Input
              className="mt-2"
              value={voice.commonPhrases || ''}
              onChange={(e) => updateVoice({ commonPhrases: e.target.value })}
              placeholder="e.g. 'Fair enough', 'That's the crux', 'The honest answer is'"
            />
          </div>

          <div>
            <label className="text-xs font-semibold tracking-wider text-[#8f97b0] uppercase">
              Forbidden Phrases (Never Use)
            </label>
            <Input
              className="mt-2"
              value={voice.forbiddenPhrases || ''}
              onChange={(e) => updateVoice({ forbiddenPhrases: e.target.value })}
              placeholder="e.g. 'Thanks for sharing!', 'Great point!', 'We appreciate your perspective!'"
            />
          </div>

          <div>
            <label className="text-xs font-semibold tracking-wider text-[#8f97b0] uppercase">
              Topics Requiring Human Approval
            </label>
            <Input
              className="mt-2"
              value={voice.humanApprovalTopics || ''}
              onChange={(e) => updateVoice({ humanApprovalTopics: e.target.value })}
              placeholder="e.g. Medical advice, legal claims, financial tips"
            />
          </div>

          <div>
            <label className="text-xs font-semibold tracking-wider text-[#8f97b0] uppercase">
              Never Discuss Under Any Circumstance
            </label>
            <Input
              className="mt-2"
              value={voice.neverDiscuss || ''}
              onChange={(e) => updateVoice({ neverDiscuss: e.target.value })}
              placeholder="e.g. Home address, personal family details"
            />
          </div>
        </div>
      </section>

      {/* TEST MY VOICE INTERACTIVE TOOL */}
      <TestMyVoiceTool />

      {/* KNOWLEDGE BASE / SOURCE MATERIAL */}
      <section className="space-y-4">
        <SectionTitle
          title="Creator Knowledge Base & Source Material"
          subtitle="Grounded transcripts, FAQs, and rules that Ghost Guardian uses to answer audience questions accurately."
        />

        <div className="ghost-panel p-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
            <div>
              <label className="text-xs text-[#8f97b0] font-semibold uppercase">Category</label>
              <select
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                className="w-full mt-1.5 rounded-xl border border-white/10 bg-[#0d0f17] px-3 py-2 text-sm text-white focus:border-[#4de1dc] focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#8f97b0] font-semibold uppercase">Title / Subject</label>
              <Input
                className="mt-1.5"
                placeholder="e.g. Episode 148 position on Panpsychism"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#8f97b0] font-semibold uppercase">Content / Answer / Boundary</label>
            <Textarea
              rows={3}
              className="mt-1.5"
              placeholder="Paste transcript excerpt, FAQ answer, or approved boundary definition..."
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            />
          </div>

          <Button
            size="sm"
            disabled={!draft.title.trim() || !draft.body.trim()}
            onClick={() => {
              addKnowledge({ category: draft.category, title: draft.title, body: draft.body });
              setDraft({ category: draft.category, title: '', body: '' });
              showToast('Added to your creator knowledge base.', 'success');
            }}
          >
            <Plus size={14} /> Add Source Material
          </Button>
        </div>

        {/* Knowledge Items List */}
        <div className="space-y-3">
          {knowledge.map((item) => (
            <div key={item.id} className="ghost-panel flex items-start justify-between gap-4 p-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip variant={item.category === 'BOUNDARY' ? 'attention' : 'guardian'}>
                    {item.category.replace(/_/g, ' ')}
                  </Chip>
                  {item.evidence && <Chip variant="outline">{item.evidence}</Chip>}
                  <span className="text-sm font-semibold text-white">{item.title}</span>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-[#8f97b0] leading-relaxed">{item.body}</p>
              </div>
              <button
                onClick={() => {
                  removeKnowledge(item.id);
                  showToast('Removed from knowledge base.', 'info');
                }}
                className="text-[#8f97b0] hover:text-[#f87171] p-1.5 transition-colors"
                title="Delete item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* VOICE TRAINING LOG */}
      <section className="space-y-4">
        <SectionTitle
          title="Voice Calibration & Learning Log"
          subtitle="Every time you approve an edit in the Inbox and click 'Save as Example', it's recorded here to refine your Guardian."
        />

        {learning.length === 0 ? (
          <EmptyState>No learning examples recorded yet. Edit a draft in the inbox and select 'Save as Example'.</EmptyState>
        ) : (
          <div className="space-y-3">
            {learning.map((item) => (
              <div key={item.id} className="ghost-panel p-5 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#8f97b0]">
                  <span className="uppercase tracking-wider font-semibold">Training Example</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#8f97b0] font-bold">Guardian Originally Drafted:</p>
                  <p className="text-xs text-[#8f97b0] line-through decoration-[#8f97b0]/50 mt-0.5">"{item.before}"</p>
                </div>
                <div className="pt-1">
                  <p className="text-[10px] uppercase tracking-wider text-[#4de1dc] font-bold">You Preferred & Calibrated To:</p>
                  <p className="text-sm text-white font-medium mt-0.5">"{item.after}"</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function TestMyVoiceTool() {
  const { voice, showToast } = useGuardian();
  const [input, setInput] = useState('');
  const [variants, setVariants] = useState(null);
  const [picked, setPicked] = useState(null);

  const handleGenerate = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const short = trimmed.length < 40;
    const isQuestion = trimmed.includes('?');
    const swear = voice.swears ? 'Hell yeah' : 'Genuinely';

    setVariants({
      calm: isQuestion
        ? `Short answer: that's covered in the episode, and if it isn't clear there, it's worth a proper follow-up.`
        : short
        ? `Appreciated. Thank you for being here.`
        : `Noted, and thank you for taking the time to write it out so clearly.`,
      direct: isQuestion
        ? `Direct answer first: yes. The longer version is in the episode, and the ambiguity is on us.`
        : `Straight answer: agreed on the substance. Here's the part worth pushing on.`,
      warm: short
        ? `${swear} — thank you for being here.`
        : `This is a generous thing to write. The part that stands out is what you said about the middle of it — say more if you want to.`,
      humorous: isQuestion
        ? `Great question, mildly inconvenient timing. Short answer's yes; long answer probably needs its own episode.`
        : `Bold of you to make us think this early. Fair point, though.`,
    });
    setPicked(null);
  };

  return (
    <section className="space-y-4">
      <SectionTitle
        title="✨ Test My Voice in Real-Time"
        subtitle="Paste any comment to see how Ghost Guardian formats responses across your 4 tone registers."
      />
      <div className="ghost-panel p-6 space-y-4">
        <Textarea
          rows={2}
          placeholder="e.g. 'I've watched every episode for two years and this one hit differently.'"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button size="sm" onClick={handleGenerate} disabled={!input.trim()}>
          <Sparkles size={14} /> Generate 4 Voice Registers
        </Button>

        {variants && (
          <div className="grid gap-3 pt-3 sm:grid-cols-2">
            {Object.keys(variants).map((tone) => (
              <button
                key={tone}
                type="button"
                onClick={() => {
                  setPicked(tone);
                  showToast(`Calibrated model toward your ${tone.toUpperCase()} register.`, 'success');
                }}
                className={`rounded-xl border p-4 text-left transition-all cursor-pointer ${
                  picked === tone
                    ? 'border-[#4de1dc] bg-[#4de1dc]/10 shadow-[0_0_15px_rgba(77,225,220,0.15)]'
                    : 'border-white/10 bg-[#0d0f17]/60 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tracking-widest text-[#4de1dc] font-bold uppercase">
                    {tone} Register
                  </span>
                  {picked === tone && <Check size={14} className="text-[#4de1dc]" />}
                </div>
                <p className="mt-2 text-xs sm:text-sm text-white leading-relaxed">{variants[tone]}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SliderRow({ label, value, hint, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-white uppercase tracking-wider">{label}</span>
        <span className="text-[#4de1dc] font-mono font-bold">{value}%</span>
      </div>
      <p className="text-[11px] text-[#8f97b0] mt-0.5">{hint}</p>
      <div className="mt-2.5">
        <Slider value={[value]} max={100} step={5} onChange={onChange} />
      </div>
    </div>
  );
}

function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-3 p-3 rounded-xl border border-white/5 bg-[#0d0f17]/40">
      <div>
        <p className="text-xs font-semibold text-white">{label}</p>
        {hint && <p className="text-[10px] text-[#8f97b0] mt-0.5">{hint}</p>}
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}
