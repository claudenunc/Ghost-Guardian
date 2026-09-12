import React from 'react';
import { Sparkles } from 'lucide-react';
import { useGuardian } from '../../lib/store';
import { calculateVoiceConfidence } from '../../domain/voice/voiceCalibrator';

/**
 * VoiceConfidenceMeter
 * 
 * Displays creator voice learning progress based on approved learning examples.
 * Percentage is calculated as Math.min(100, (learning_examples.length / 20) * 100).
 */
export default function VoiceConfidenceMeter({
  learningExamples: propExamples,
  compact = false,
  className = '',
}) {
  const { learning } = useGuardian();
  const examples = propExamples !== undefined ? propExamples : (learning || []);
  const count = Array.isArray(examples) ? examples.length : 0;
  const percentage = calculateVoiceConfidence(examples);

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-[#4de1dc]" />
            <span className="font-semibold text-white">Voice learned: {percentage}%</span>
          </div>
          <span className="text-[11px] text-[#8f97b0] font-mono">{count}/20</span>
        </div>
        <div className="h-2 w-full rounded-full bg-[#111111] overflow-hidden border border-white/5">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${percentage}%`,
              background: 'linear-gradient(90deg, #0200F1 0%, #4de1dc 100%)',
              boxShadow: '0 0 10px rgba(77, 225, 220, 0.4)',
            }}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Voice learned: ${percentage}%`}
          />
        </div>
        <p className="text-[11px] text-[#8f97b0]">
          Approve more responses to increase accuracy.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`ghost-panel p-5 sm:p-6 border border-white/10 bg-[#0a0a0a]/90 space-y-4 ${className}`}
      data-testid="voice-confidence-meter"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#0200F1]/10 border border-[#0200F1]/20 text-[#4de1dc] shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-base sm:text-lg text-white tracking-wide">
                Voice Confidence
              </h2>
              <span className="text-xs font-mono font-bold text-[#4de1dc] bg-[#0200F1]/15 px-2.5 py-0.5 rounded-full border border-[#0200F1]/30">
                Voice learned: {percentage}%
              </span>
            </div>
            <p className="text-xs text-[#8f97b0] mt-0.5">
              Approve more responses to increase accuracy.
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <span className="text-xs font-mono text-[#8f97b0] block">
            <span className="text-white font-semibold">{count}</span> / 20 calibration examples
          </span>
          <span className="text-[10px] text-[#8f97b0] tracking-wide uppercase">
            {count >= 20 ? 'Max Attunement Reached' : `${20 - count} needed for 100%`}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="h-3 w-full rounded-full bg-[#111111] overflow-hidden border border-white/10 p-0.5">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${percentage}%`,
              background: 'linear-gradient(90deg, #0200F1 0%, #0A00FF 40%, #4de1dc 85%, #00FF66 100%)',
              boxShadow: '0 0 14px rgba(77, 225, 220, 0.45)',
            }}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Voice learned: ${percentage}%`}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-[#8f97b0] font-mono px-0.5">
          <span>0% Baseline</span>
          <span className="text-[#4de1dc] font-semibold">Voice learned: {percentage}%</span>
          <span>100% Attuned</span>
        </div>
      </div>
    </div>
  );
}
