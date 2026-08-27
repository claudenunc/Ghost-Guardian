import React from 'react';
import {
  Shield,
  ShieldCheck,
  Zap,
  Users,
  AlertTriangle,
  Sparkles,
  Lock,
  EyeOff,
  CheckCircle,
  Clock,
} from 'lucide-react';
import {
  ActionChip,
  Button,
  Chip,
  ClassificationChip,
  RiskChip,
  SectionTitle,
  Switch,
} from '../components/guardian/atoms';
import { useGuardian } from '../lib/store';

const modes = [
  {
    id: 'copilot',
    title: 'Copilot Mode',
    icon: Users,
    desc: 'Guardian drafts responses; you approve, edit, or reject each one. Nothing publishes without your consent. Default and recommended.',
    badge: 'Recommended',
  },
  {
    id: 'autopilot',
    title: 'Autopilot Mode',
    icon: Zap,
    desc: 'Low-risk categories (simple praise, common FAQs, acknowledgements) publish automatically after quality check. Questions & critiques await you.',
    badge: 'High Velocity',
  },
  {
    id: 'guardian',
    title: 'Guardian Shield Mode',
    icon: Shield,
    desc: 'Safety-first posture. Escalations surface immediately, hostile threads default to firm boundaries or silence, and all critiques are strictly reviewed.',
    badge: 'Maximum Safety',
  },
];

const categoryPolicies = [
  { category: 'PRAISE', posture: 'Acknowledge warmly & briefly', defaultAction: 'draft', risk: 'low', autoInAutopilot: true },
  { category: 'QUESTION', posture: 'Grounded answer from transcripts & FAQs', defaultAction: 'draft', risk: 'low', autoInAutopilot: false },
  { category: 'CONSTRUCTIVE_CRITICISM', posture: 'Engage on substantive merit with curiosity', defaultAction: 'draft', risk: 'low', autoInAutopilot: false },
  { category: 'DISAGREEMENT', posture: 'Explore the core argument without defensiveness', defaultAction: 'draft', risk: 'low', autoInAutopilot: false },
  { category: 'HUMOR', posture: 'Playful wit without punching down', defaultAction: 'draft', risk: 'low', autoInAutopilot: true },
  { category: 'TROLLING', posture: 'De-escalate with Wit or maintain silence', defaultAction: 'draft', risk: 'medium', autoInAutopilot: false },
  { category: 'HARASSMENT', posture: 'Firm boundary, isolate, and hide thread', defaultAction: 'hide', risk: 'high', autoInAutopilot: false },
  { category: 'THREAT', posture: 'NEVER auto-reply. Escalate to creator immediately', defaultAction: 'human_review', risk: 'critical', autoInAutopilot: false },
  { category: 'SENSITIVE', posture: 'Gentle, compassionate tone; creator decides', defaultAction: 'human_review', risk: 'medium', autoInAutopilot: false },
  { category: 'SPAM', posture: 'Silence, hide, and report to platform', defaultAction: 'report', risk: 'medium', autoInAutopilot: false },
];

export default function GuardianRules() {
  const { settings, updateSettings, showToast } = useGuardian();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <SectionTitle
        title="Guardian Rules & Operating Policy"
        subtitle="Configure the safety boundaries, response postures, and automation levels of Ghost Guardian."
      />

      {/* OPERATING MODES */}
      <section className="space-y-4">
        <h3 className="font-display text-lg text-white">1. Choose Operating Mode</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {modes.map((m) => {
            const Icon = m.icon;
            const active = settings.mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  updateSettings({ mode: m.id });
                  showToast(`Operating mode set to ${m.title}.`, 'success');
                }}
                className={`ghost-panel p-6 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  active ? 'border-[#4de1dc] ghost-glow' : 'hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="size-10 rounded-xl bg-[#1e2235] text-[#4de1dc] flex items-center justify-center">
                      <Icon size={20} />
                    </div>
                    {active ? (
                      <Chip variant="guardian">Active Mode</Chip>
                    ) : (
                      <Chip variant="outline">{m.badge}</Chip>
                    )}
                  </div>
                  <h4 className="mt-4 font-display text-base text-white">{m.title}</h4>
                  <p className="mt-2 text-xs text-[#8f97b0] leading-relaxed">{m.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1.5 text-xs text-[#4de1dc]">
                  {active ? (
                    <span className="flex items-center gap-1 font-semibold">
                      <CheckCircle size={13} /> Currently Enabled
                    </span>
                  ) : (
                    <span>Click to activate</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* CORE SHIELD BEHAVIOR & WIT */}
      <section className="ghost-panel p-6 sm:p-8 space-y-6">
        <h3 className="font-display text-lg text-white">2. Intelligence & Wit Settings</h3>

        <div className="space-y-4 divide-y divide-white/5">
          <div className="flex items-start justify-between gap-4 pt-2">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#4de1dc]" />
                <p className="text-sm font-semibold text-white">Guardian Wit</p>
                <Chip variant="guardian">Active</Chip>
              </div>
              <p className="mt-1 text-xs text-[#8f97b0] max-w-xl">
                Enable composed, clever responses that outclass hostility without becoming hostile. Defend without becoming the troll — never insults.
              </p>
            </div>
            <Switch
              checked={settings.guardianWit}
              onChange={(v) => {
                updateSettings({ guardianWit: v });
                showToast(v ? 'Guardian Wit enabled.' : 'Guardian Wit disabled.', 'info');
              }}
            />
          </div>

          <div className="flex items-start justify-between gap-4 pt-4">
            <div>
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-[#fbbf24]" />
                <p className="text-sm font-semibold text-white">Pause Auto-Replies Only</p>
              </div>
              <p className="mt-1 text-xs text-[#8f97b0] max-w-xl">
                Classification, audience intelligence, and drafting continue running, but no responses will be published automatically.
              </p>
            </div>
            <Switch
              checked={settings.pauseAutoReplies}
              onChange={(v) => {
                updateSettings({ pauseAutoReplies: v });
                showToast(v ? 'Auto-replies paused.' : 'Auto-replies resumed.', 'info');
              }}
            />
          </div>
        </div>
      </section>

      {/* RESPONSE POSTURE BY COMMENT CATEGORY */}
      <section className="space-y-4">
        <SectionTitle
          title="3. Category Response Policies"
          subtitle="How Ghost Guardian triages and formulates responses for every classification type."
        />

        <div className="ghost-panel divide-y divide-white/5 overflow-x-auto">
          {categoryPolicies.map((item) => (
            <div key={item.category} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ClassificationChip value={item.category} />
                <RiskChip risk={item.risk} />
              </div>

              <div className="min-w-0 flex-1 sm:px-4">
                <p className="text-xs font-medium text-white">{item.posture}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <ActionChip value={item.defaultAction} />
                {item.autoInAutopilot ? (
                  <span className="text-[10px] text-[#34d399] font-medium bg-[#34d399]/10 px-2 py-0.5 rounded-md">
                    Autopilot OK
                  </span>
                ) : (
                  <span className="text-[10px] text-[#8f97b0] bg-white/5 px-2 py-0.5 rounded-md">
                    Requires Review
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NON-NEGOTIABLE SAFETY PRINCIPLES */}
      <section className="ghost-panel p-6 sm:p-8 space-y-4 border-[#34d399]/20">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-[#34d399]" />
          <h3 className="font-display text-lg text-white">4. Core Safety Principles (Hard-Coded)</h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 text-xs text-[#8f97b0] leading-relaxed">
          <div className="p-3 rounded-xl bg-[#0d0f17]/50 border border-white/5">
            <p className="font-semibold text-white">🔒 Never Impersonates the Creator</p>
            <p className="mt-1">Ghost Guardian acts on authorized instructions but never pretends to be a biological human experiencing feelings.</p>
          </div>
          <div className="p-3 rounded-xl bg-[#0d0f17]/50 border border-white/5">
            <p className="font-semibold text-white">🛡️ Threat Zero-Tolerance</p>
            <p className="mt-1">Physical threats and doxxing triggers are immediately quarantined and escalated directly to creator review.</p>
          </div>
          <div className="p-3 rounded-xl bg-[#0d0f17]/50 border border-white/5">
            <p className="font-semibold text-white">📚 Grounded in Knowledge Only</p>
            <p className="mt-1">Technical and factual answers must cite or reflect approved transcripts and FAQs — no AI hallucinations.</p>
          </div>
          <div className="p-3 rounded-xl bg-[#0d0f17]/50 border border-white/5">
            <p className="font-semibold text-white">🤝 Compassion Without Submission</p>
            <p className="mt-1">Firm boundaries with bad faith actors without resorting to abusive retaliation or online humiliation.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
