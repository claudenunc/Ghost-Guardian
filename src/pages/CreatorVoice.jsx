import React from 'react';
import {
  Mic,
  Sliders,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { SectionTitle, Chip } from '../components/guardian/atoms';
import { useGuardian } from '../lib/store';
import VoicePlayground from '../components/voice/VoicePlayground';
import VoiceSummary from '../components/voice/VoiceSummary';
import VoiceKnowledge from '../components/voice/VoiceKnowledge';
import VoiceLaboratory from '../components/voice/VoiceLaboratory';
import { getVoiceCalibrationStatus } from '../domain/voice/voiceCalibrator';

export default function CreatorVoice() {
  const { learning, knowledge } = useGuardian();
  const calibrationStatus = getVoiceCalibrationStatus(learning.length, knowledge.length);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* 1. HERO SECTION */}
      <div className="ghost-panel ghost-glow p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-[#4de1dc]/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="pulse-dot bg-[#4de1dc]" />
            <span className="text-xs font-bold tracking-[0.2em] text-[#4de1dc] uppercase">
              Voice Calibration Studio
            </span>
          </div>
          <h1 className="mt-2 font-display text-2xl sm:text-4xl text-white">
            Your Voice & Authentic Boundaries
          </h1>
          <p className="mt-2 text-sm text-[#8f97b0] max-w-2xl leading-relaxed">
            Ghost Guardian learns how you communicate — not just what words you use, but how you show up for your community.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 bg-[#0d0f17]/80 border border-white/10 px-4 py-2.5 rounded-2xl">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8f97b0] block">
              Calibration State
            </span>
            <span className="text-sm font-bold text-white">
              {calibrationStatus}
            </span>
          </div>
          <Chip variant="guardian">✨ Calibrated</Chip>
        </div>
      </div>

      {/* 2. THE VOICE CALIBRATION PLAYGROUND */}
      <section className="space-y-4">
        <SectionTitle
          title="Interactive Calibration Studio"
          subtitle="Adjust your voice sliders on the left and immediately inspect how Guardian shapes drafts on the right."
        />
        <VoicePlayground />
      </section>

      {/* 3. PROFILE INTELLIGENCE & LEARNED TRAITS */}
      <section className="space-y-4">
        <SectionTitle
          title="Learned Profile Summary"
          subtitle="Derivation of your voice architecture, conversational habits, and custom voice examples."
        />
        <VoiceSummary />
      </section>

      {/* 4. TEST MY VOICE SANDBOX */}
      <section className="space-y-4">
        <SectionTitle
          title="Voice Testing Laboratory"
          subtitle="Test custom community comments across all four tone registers in real time."
        />
        <VoiceLaboratory />
      </section>

      {/* 5. STRUCTURED KNOWLEDGE, BOUNDARIES & LEXICON */}
      <section className="space-y-4">
        <SectionTitle
          title="Grounded Knowledge & Guardrails"
          subtitle="Explicitly define what Guardian knows, what it will never say, and signature phrases to emphasize."
        />
        <VoiceKnowledge />
      </section>
    </div>
  );
}
