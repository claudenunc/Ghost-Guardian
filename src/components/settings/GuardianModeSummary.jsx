import React from 'react';
import { Shield, Users, Zap, ArrowRight, Sliders, CheckCircle2 } from 'lucide-react';
import { Button, Chip } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';

const modeDescriptions = {
  copilot: {
    title: 'Copilot Mode',
    icon: Users,
    desc: 'Guardian prepares draft replies, identifies human moments, and filters hostility. Nothing is published without your approval.',
    badge: 'Recommended Posture',
  },
  guardian: {
    title: 'Guardian Shield Mode',
    icon: Shield,
    desc: 'Safety-first posture. Escalations surface immediately, hostile threads default to boundaries or silence, and all critiques are strictly reviewed.',
    badge: 'Maximum Protection',
  },
  autopilot: {
    title: 'Autopilot Mode',
    icon: Zap,
    desc: 'Low-risk categories (simple praise, verified FAQs) publish automatically after policy check. Questions & critiques await you.',
    badge: 'High Velocity',
  },
};

export default function GuardianModeSummary() {
  const { policy, settings } = useGuardian();
  const currentModeKey = policy?.mode || settings?.mode || 'copilot';
  const currentMode = modeDescriptions[currentModeKey] || modeDescriptions.copilot;
  const Icon = currentMode.icon;

  return (
    <section className="ghost-panel p-6 sm:p-8 space-y-4 border-[#4de1dc]/30 bg-gradient-to-r from-[#141829]/95 via-[#131726]/95 to-[#1c1830]/95">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="size-12 rounded-2xl bg-[#4de1dc]/15 text-[#4de1dc] flex items-center justify-center shrink-0">
            <Icon size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4de1dc]">
                Current Operational Mode
              </span>
              <Chip variant="guardian">{currentMode.badge}</Chip>
            </div>
            <h3 className="font-display text-lg text-white font-bold mt-0.5">
              {currentMode.title}
            </h3>
          </div>
        </div>

        <a
          href="/app/rules"
          className="inline-flex items-center gap-2 rounded-xl bg-[#1e2235] hover:bg-[#252b42] text-white hover:text-[#4de1dc] border border-white/10 px-4 py-2 text-xs font-semibold transition-all cursor-pointer shadow-sm"
        >
          <Sliders size={14} /> Open Policy Studio
        </a>
      </div>

      <p className="text-xs sm:text-sm text-[#8f97b0] leading-relaxed max-w-3xl">
        {currentMode.desc}
      </p>

      <div className="pt-3 border-t border-white/5 flex flex-wrap items-center gap-4 text-xs text-[#8f97b0]">
        <span className="flex items-center gap-1 text-white">
          <CheckCircle2 size={13} className="text-[#4de1dc]" /> Active Guardian Policy: v{policy?.version || '2.4.0'}
        </span>
        <span>·</span>
        <span>Detailed rule matrix and keyword shields are managed in the Policy Studio.</span>
      </div>
    </section>
  );
}
