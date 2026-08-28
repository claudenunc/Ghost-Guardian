import React from 'react';
import { Sparkles, CheckCircle2, BookOpen, Layers, Heart, Shield } from 'lucide-react';
import { Chip } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';
import {
  deriveLearnedTraits,
  getVoiceCalibrationStatus,
} from '../../domain/voice/voiceCalibrator';

export default function VoiceSummary() {
  const { voice, learning, knowledge } = useGuardian();
  const traits = deriveLearnedTraits(voice, learning.length);
  const status = getVoiceCalibrationStatus(learning.length, knowledge.length);

  return (
    <div className="ghost-panel p-6 sm:p-8 space-y-6">
      {/* Top Header & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#4de1dc] block">
            Profile Intelligence
          </span>
          <h3 className="font-display text-lg text-white mt-0.5">
            What Guardian Has Learned About Your Voice
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8f97b0]">Status:</span>
          <Chip variant="guardian" className="font-bold">
            ✨ {status}
          </Chip>
        </div>
      </div>

      {/* Traits Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {traits.map((trait, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-white/5 bg-[#0d0f17]/70 space-y-1.5"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[#4de1dc] shrink-0" />
              <span className="text-xs font-semibold text-white">{trait.title}</span>
            </div>
            <p className="text-xs text-[#8f97b0] leading-relaxed pl-5.5">{trait.detail}</p>
          </div>
        ))}
      </div>

      {/* Learning History */}
      <div className="pt-4 border-t border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <BookOpen size={14} className="text-[#4de1dc]" /> Voice Library & Creator Approvals (
            {learning.length})
          </span>
          <span className="text-xs text-[#8f97b0]">
            Approved calibrations stored
          </span>
        </div>

        {learning.length === 0 ? (
          <p className="text-xs text-[#8f97b0] italic py-2">
            No custom voice examples recorded yet. When you edit and approve drafts in the Inbox and click "Save as Example", Guardian integrates them here.
          </p>
        ) : (
          <div className="space-y-2.5">
            {learning.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-white/5 bg-[#0d0f17]/50 p-3.5 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between text-[10px] text-[#8f97b0]">
                  <span className="font-bold uppercase tracking-wider text-[#4de1dc]">
                    Calibrated Voice Example
                  </span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="text-[#8f97b0]">
                    <span className="text-[10px] uppercase block font-semibold">Originally:</span>
                    <p className="line-through decoration-[#8f97b0]/50 mt-0.5">"{item.before}"</p>
                  </div>
                  <div className="text-white font-medium">
                    <span className="text-[10px] uppercase block text-[#4de1dc] font-semibold">
                      Your Preference:
                    </span>
                    <p className="mt-0.5">"{item.after}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
