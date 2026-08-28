import React, { useState } from 'react';
import {
  Check,
  RefreshCw,
  Sparkles,
  X,
  EyeOff,
  VolumeX,
  MessageCircle,
  User,
  Bot,
} from 'lucide-react';
import { Button, Chip, Textarea } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';

const tones = ['calm', 'direct', 'warm', 'humorous'];

export default function ResponseEditor({ comment }) {
  const guardian = useGuardian();
  const state = guardian.stateFor(comment.id);
  const [personalMode, setPersonalMode] = useState(false);

  const availableTones = tones.filter((tone) => comment.drafts?.[tone]);

  return (
    <div className="space-y-3 pt-3 border-t border-white/5">
      {/* Tone Registers & Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] tracking-widest text-[#8f97b0] uppercase font-bold flex items-center gap-1">
            <Bot size={12} className="text-[#4de1dc]" /> Guardian Voice Registers:
          </span>
          <div className="flex flex-wrap gap-1">
            {availableTones.map((tone) => (
              <button
                key={tone}
                type="button"
                onClick={() => {
                  setPersonalMode(false);
                  guardian.useTone(comment.id, tone);
                }}
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase transition-colors cursor-pointer ${
                  state.activeTone === tone && !personalMode
                    ? 'border border-[#4de1dc]/50 bg-[#4de1dc]/20 text-[#4de1dc]'
                    : 'border border-white/10 text-[#8f97b0] hover:text-white hover:border-white/25'
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {state.wasEdited && <Chip variant="attention">Edited by you</Chip>}
          <button
            type="button"
            onClick={() => setPersonalMode(!personalMode)}
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-colors cursor-pointer border ${
              personalMode
                ? 'bg-[#c084fc]/20 border-[#c084fc]/50 text-[#c084fc]'
                : 'border-white/10 text-[#8f97b0] hover:text-white'
            }`}
          >
            <User size={10} /> {personalMode ? 'Personal Mode On' : 'Write Personal Reply'}
          </button>
        </div>
      </div>

      {/* Editor Textarea */}
      <Textarea
        value={state.responseText}
        rows={3}
        onChange={(e) => guardian.setResponse(comment.id, e.target.value)}
        placeholder={
          personalMode
            ? 'Write your personal response directly to this community member...'
            : 'Review or fine-tune Guardian draft...'
        }
      />

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {/* Left: Primary actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            disabled={state.status === 'approved' || state.status === 'edited'}
            onClick={() => guardian.approve(comment.id)}
          >
            <Check size={14} /> Approve & Publish
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => guardian.regenerate(comment.id)}
            title="Cycle to next tone draft"
          >
            <RefreshCw size={14} /> Regenerate
          </Button>

          <Button
            size="sm"
            variant={state.savedAsExample ? 'secondary' : 'outline'}
            onClick={() => guardian.saveAsExample(comment.id)}
            disabled={state.savedAsExample}
          >
            <Sparkles size={14} className={state.savedAsExample ? 'text-[#4de1dc]' : ''} />
            {state.savedAsExample ? 'Saved as Voice Example' : 'Save Voice Example'}
          </Button>
        </div>

        {/* Right: Moderation options */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => guardian.reject(comment.id)}
          >
            <X size={14} /> Reject
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              guardian.setStatus(comment.id, 'silenced', 'Ignored without public reply');
              guardian.showToast('Silenced.', 'info');
            }}
          >
            <VolumeX size={14} /> Silence
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              guardian.setStatus(comment.id, 'hidden', 'Comment hidden from public view');
              guardian.showToast('Hidden from feed.', 'info');
            }}
          >
            <EyeOff size={14} /> Hide
          </Button>
        </div>
      </div>
    </div>
  );
}
