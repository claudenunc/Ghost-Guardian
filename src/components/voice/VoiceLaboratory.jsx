import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Edit3,
  BookmarkPlus,
  RotateCcw,
  Bot,
} from 'lucide-react';
import { Button, Chip, Textarea } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';
import { calibrateDraft } from '../../domain/voice/voiceCalibrator';

const samplePrompts = [
  'I’ve never understood why people are so afraid of AI. What do you actually think consciousness is?',
  'Your podcast audio was clean, but you completely skipped the hard counter-arguments.',
  'Honestly this episode felt like pure marketing hype.',
  'You gave your AI a receding hairline? 😂',
];

export default function VoiceLaboratory() {
  const { voice, dispatch, showToast } = useGuardian();

  const [input, setInput] = useState('');
  const [results, setResults] = useState(null);
  const [activeRegister, setActiveRegister] = useState('warm');
  const [editedText, setEditedText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = (customText) => {
    const textToUse = customText || input;
    if (!textToUse.trim()) return;

    const generated = {
      calm: calibrateDraft({ commentText: textToUse, voice, activeTone: 'calm' }),
      direct: calibrateDraft({ commentText: textToUse, voice, activeTone: 'direct' }),
      warm: calibrateDraft({ commentText: textToUse, voice, activeTone: 'warm' }),
      humorous: calibrateDraft({ commentText: textToUse, voice, activeTone: 'humorous' }),
    };

    setResults(generated);
    setEditedText(generated[activeRegister] || generated.warm);
    setCopied(false);
  };

  const handleRegisterSelect = (tone) => {
    setActiveRegister(tone);
    if (results) {
      setEditedText(results[tone]);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedText);
    setCopied(true);
    showToast('Copied calibrated response to clipboard.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAsExample = () => {
    const original = results ? results[activeRegister] : '';
    const example = {
      id: `lab-example-${Date.now()}`,
      before: original,
      after: editedText,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_LEARNING_EXAMPLE', payload: example });
    showToast('Saved to your voice calibration library.', 'success');
  };

  return (
    <section className="ghost-panel p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/5">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#4de1dc] block">
            Interactive Sandbox
          </span>
          <h3 className="font-display text-lg text-white mt-0.5">
            Test My Voice Laboratory
          </h3>
        </div>
        <Chip variant="guardian">Real-time Simulation</Chip>
      </div>

      {/* Input area */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-[#8f97b0] uppercase">
          Enter Any Test Comment or Scenario
        </label>
        <Textarea
          rows={2}
          placeholder="Type or paste any community comment to test how Guardian responds..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        {/* Quick sample chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-[#8f97b0]">Try sample:</span>
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInput(prompt);
                handleGenerate(prompt);
              }}
              className="text-[11px] text-[#8f97b0] hover:text-[#4de1dc] bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg transition-colors cursor-pointer truncate max-w-[240px]"
            >
              "{prompt}"
            </button>
          ))}
        </div>

        <Button
          size="sm"
          disabled={!input.trim()}
          onClick={() => handleGenerate()}
        >
          <Sparkles size={14} /> Generate 4 Voice Registers
        </Button>
      </div>

      {/* Generated Multi-Tone Registers */}
      {results && (
        <div className="space-y-4 pt-4 border-t border-white/5 animate-in fade-in duration-200">
          {/* Tone register tabs */}
          <div className="flex flex-wrap gap-1.5">
            {['warm', 'direct', 'calm', 'humorous'].map((tone) => (
              <button
                key={tone}
                type="button"
                onClick={() => handleRegisterSelect(tone)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold uppercase transition-all cursor-pointer border ${
                  activeRegister === tone
                    ? 'border-[#4de1dc] bg-[#4de1dc]/15 text-[#4de1dc] shadow-[0_0_12px_rgba(77,225,220,0.2)]'
                    : 'border-white/10 text-[#8f97b0] hover:text-white'
                }`}
              >
                {tone} Register
              </button>
            ))}
          </div>

          {/* Active Register Editor */}
          <div className="rounded-xl border border-[#4de1dc]/30 bg-[#0d0f17]/90 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {activeRegister} Calibrated Draft (Editable)
              </span>
              <span className="text-[11px] text-[#8f97b0]">
                Calibrated to your voice sliders
              </span>
            </div>

            <Textarea
              rows={3}
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              placeholder="Fine-tune response..."
            />

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleCopy}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy Response'}
                </Button>
                <Button size="sm" variant="outline" onClick={handleSaveAsExample}>
                  <BookmarkPlus size={14} /> Save as Voice Example
                </Button>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setInput('');
                  setResults(null);
                }}
              >
                <RotateCcw size={13} /> Clear
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
