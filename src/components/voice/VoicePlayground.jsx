import React, { useState, useMemo, useEffect } from 'react';
import {
  Sliders,
  Sparkles,
  RefreshCw,
  Check,
  ArrowRight,
  MessageSquare,
  Eye,
  SlidersHorizontal,
  Bot,
  UserCheck,
} from 'lucide-react';
import { Button, Chip, Slider, Switch } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';
import { calibrateDraft, TonePreset } from '../../domain/voice/voiceCalibrator';

const scenarios = [
  {
    id: 'praise',
    label: 'Thoughtful Community Praise',
    comment: "I've listened to every episode for two years and this one hit differently. The bit about where explanation bottoms out reframed something I've been stuck on for months.",
    author: 'Marisol · Returning listener',
  },
  {
    id: 'question',
    label: 'Technical Ambiguity Question',
    comment: 'Can you explain what you meant around the 42-minute mark? I could not tell if you were claiming physics is incomplete or just differently scoped.',
    author: 'Devon K. · Frequent contributor',
  },
  {
    id: 'criticism',
    label: 'Constructive Intellectual Pushback',
    comment: 'I usually love the show, but I think you oversimplified this. The panpsychism section skipped every serious objection.',
    author: 'rl_nine · Critical listener',
  },
];

const presets = [
  { id: 'warm', label: 'Warm & Connected', warmth: 85, directness: 65, formality: 30, humor: 50 },
  { id: 'direct', label: 'Direct & Blunt', warmth: 45, directness: 90, formality: 35, humor: 30 },
  { id: 'calm', label: 'Calm & Nuanced', warmth: 60, directness: 60, formality: 70, humor: 20 },
  { id: 'humorous', label: 'Witty & Playful', warmth: 70, directness: 75, formality: 25, humor: 85 },
];

export default function VoicePlayground() {
  const { voice, updateVoice, showToast } = useGuardian();

  const [selectedScenario, setSelectedScenario] = useState(scenarios[0]);
  const [activeTone, setActiveTone] = useState('warm');
  const [showComparison, setShowComparison] = useState(true);

  // Baseline draft (before adjustments)
  const baselineDraft = useMemo(() => {
    return calibrateDraft({
      commentText: selectedScenario.comment,
      voice: { warmth: 50, directness: 50, formality: 50, humor: 50, responseLength: 'adaptive' },
      activeTone: 'calm',
      scenario: selectedScenario.id,
    });
  }, [selectedScenario]);

  // Live dynamic draft matching current creator voice sliders
  const calibratedDraft = useMemo(() => {
    return calibrateDraft({
      commentText: selectedScenario.comment,
      voice,
      activeTone,
      scenario: selectedScenario.id,
    });
  }, [selectedScenario, voice, activeTone]);

  const applyPreset = (preset) => {
    setActiveTone(preset.id);
    updateVoice({
      warmth: preset.warmth,
      directness: preset.directness,
      formality: preset.formality,
      humor: preset.humor,
    });
    showToast(`Applied ${preset.label} voice profile.`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Tone Presets Selector Bar */}
      <div className="ghost-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#4de1dc]" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Voice Tone Presets
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer border ${
                activeTone === preset.id
                  ? 'border-[#4de1dc] bg-[#4de1dc]/15 text-[#4de1dc] shadow-[0_0_12px_rgba(77,225,220,0.2)]'
                  : 'border-white/10 bg-[#1e2235] text-[#8f97b0] hover:text-white hover:border-white/25'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Playground: Controls on Left, Live Simulation on Right */}
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        {/* LEFT COLUMN: HOW I SOUND (CONTROLS) */}
        <section className="ghost-panel p-6 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Sliders size={18} className="text-[#4de1dc]" />
              <h3 className="font-display text-base text-white">How I Sound</h3>
            </div>
            <span className="text-xs text-[#8f97b0]">Live Slider Controls</span>
          </div>

          <div className="space-y-5">
            <VoiceSlider
              label="Warmth & Connection"
              value={voice.warmth ?? 75}
              hint="Reserved & clinical ↔ Generous & connected"
              onChange={(v) => updateVoice({ warmth: v })}
            />
            <VoiceSlider
              label="Directness & Punch"
              value={voice.directness ?? 75}
              hint="Diplomatic & padded ↔ Blunt & concise"
              onChange={(v) => updateVoice({ directness: v })}
            />
            <VoiceSlider
              label="Formality & Rigor"
              value={voice.formality ?? 35}
              hint="Colloquial & casual ↔ Academic & formal"
              onChange={(v) => updateVoice({ formality: v })}
            />
            <VoiceSlider
              label="Humor & Wit"
              value={voice.humor ?? 45}
              hint="Deadpan / serious ↔ Playful & teasing"
              onChange={(v) => updateVoice({ humor: v })}
            />
          </div>

          {/* Style Toggles & Length Preferences */}
          <div className="pt-4 border-t border-white/5 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#8f97b0] block mb-2">
                Response Length Target
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'concise', label: 'Concise (1 sentence)' },
                  { id: 'adaptive', label: 'Adaptive (1-2 sentences)' },
                  { id: 'detailed', label: 'Detailed (Deep dive)' },
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => updateVoice({ responseLength: l.id, preferShort: l.id === 'concise' })}
                    className={`rounded-xl p-2 text-center text-xs font-medium transition-colors border cursor-pointer ${
                      (voice.responseLength || 'adaptive') === l.id
                        ? 'border-[#4de1dc] bg-[#4de1dc]/10 text-white font-bold'
                        : 'border-white/10 text-[#8f97b0] hover:text-white'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              <VoiceToggle
                label="Include contextual emojis"
                checked={Boolean(voice.usesEmojis)}
                onChange={(v) => updateVoice({ usesEmojis: v })}
              />
              <VoiceToggle
                label="Ask follow-up questions"
                checked={Boolean(voice.asksQuestions ?? true)}
                onChange={(v) => updateVoice({ asksQuestions: v })}
              />
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: SEE IT IN ACTION (LIVE SCENARIO & BEFORE/AFTER) */}
        <section className="ghost-panel p-6 space-y-5 bg-gradient-to-b from-[#141829]/95 to-[#121422]/95 border-[#4de1dc]/30">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-[#4de1dc]" />
              <h3 className="font-display text-base text-white">Live Voice Output</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowComparison(!showComparison)}
              className="text-xs text-[#4de1dc] hover:underline cursor-pointer focus:outline-none"
            >
              {showComparison ? 'Hide Baseline Comparison' : 'Show Baseline Comparison'}
            </button>
          </div>

          {/* Scenario Selector */}
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8f97b0] block mb-1.5">
              Test Scenario Scenario:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {scenarios.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setSelectedScenario(sc)}
                  className={`rounded-lg px-2.5 py-1 text-xs transition-colors cursor-pointer border ${
                    selectedScenario.id === sc.id
                      ? 'border-[#4de1dc]/60 bg-[#4de1dc]/15 text-[#4de1dc] font-semibold'
                      : 'border-white/10 text-[#8f97b0] hover:text-white'
                  }`}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scenario Comment Box */}
          <div className="rounded-xl border border-white/10 bg-[#0d0f17]/90 p-4">
            <div className="flex items-center justify-between text-xs text-[#8f97b0] mb-1.5">
              <span className="font-medium text-white">{selectedScenario.author}</span>
              <Chip variant="muted">Incoming Comment</Chip>
            </div>
            <p className="text-sm text-white italic leading-relaxed">
              "{selectedScenario.comment}"
            </p>
          </div>

          {/* Calibrated Output Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4de1dc] flex items-center gap-1.5">
                <Sparkles size={14} /> Guardian Calibrated Draft
              </span>
              <Chip variant="guardian">Active Output</Chip>
            </div>

            <div className="rounded-xl border border-[#4de1dc]/40 bg-[#4de1dc]/5 p-4 text-sm text-white font-medium leading-relaxed animate-in fade-in duration-200">
              "{calibratedDraft}"
            </div>
          </div>

          {/* Before & After Comparison */}
          {showComparison && (
            <div className="pt-3 border-t border-white/5 space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#8f97b0] block">
                Baseline (Uncalibrated Standard):
              </span>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs text-[#8f97b0] italic leading-relaxed">
                "{baselineDraft}"
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between text-xs text-[#8f97b0]">
            <span>✨ Live feedback: Slider updates visibly calibrate wording in real time.</span>
          </div>
        </section>
      </div>
    </div>
  );
}

function VoiceSlider({ label, value, hint, onChange }) {
  const getDescriptor = (val) => {
    if (val <= 25) return 'Low';
    if (val <= 50) return 'Moderate';
    if (val <= 75) return 'Prominent';
    return 'High';
  };

  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-white uppercase tracking-wider">{label}</span>
        <span className="text-[#4de1dc] font-mono font-bold">
          {value}% ({getDescriptor(value)})
        </span>
      </div>
      <p className="text-[11px] text-[#8f97b0] mt-0.5">{hint}</p>
      <div className="mt-2.5">
        <Slider
          value={[value]}
          max={100}
          step={5}
          onChange={onChange}
          aria-label={`${label} — current value: ${getDescriptor(value)}`}
        />
      </div>
    </div>
  );
}

function VoiceToggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-white/5 bg-[#0d0f17]/40">
      <span className="text-xs font-semibold text-white">{label}</span>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}
