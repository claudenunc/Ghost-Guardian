import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Users,
  AlertTriangle,
  Sparkles,
  Lock,
  EyeOff,
  CheckCircle,
  Clock,
  Sliders,
  History,
  Info,
} from 'lucide-react';
import {
  Button,
  Chip,
  SectionTitle,
  Switch,
} from '../components/guardian/atoms';
import { useGuardian } from '../lib/store';
import { policyPresets } from '../domain/policy/guardianPolicy';
import PolicyMatrix from '../components/policy/PolicyMatrix';
import PolicySimulator from '../components/policy/PolicySimulator';
import KeywordShields from '../components/policy/KeywordShields';
import TopicBoundaries from '../components/policy/TopicBoundaries';
import TrustedCommenters from '../components/policy/TrustedCommenters';

const modes = [
  {
    id: 'copilot',
    title: 'Copilot Mode',
    icon: Users,
    desc: 'Guardian drafts responses; you approve, edit, or reject each one. Nothing publishes without your explicit consent. Default and recommended.',
    badge: 'Recommended',
  },
  {
    id: 'guardian',
    title: 'Guardian Shield Mode',
    icon: Shield,
    desc: 'Safety-first posture. Escalations surface immediately, hostile threads default to firm boundaries or silence, and all critiques are strictly reviewed.',
    badge: 'Maximum Protection',
  },
  {
    id: 'autopilot',
    title: 'Autopilot Mode',
    icon: Zap,
    desc: 'Low-risk categories (simple praise, verified FAQs, acknowledgements) publish automatically after policy check. Questions & critiques await you.',
    badge: 'High Velocity',
  },
];

export default function GuardianRules() {
  const { policy, updatePolicy, applyPolicyPreset, settings, updateSettings, showToast } =
    useGuardian();

  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' | 'simulator' | 'keywords' | 'topics' | 'trusted'
  const [showAutopilotConfirm, setShowAutopilotConfirm] = useState(false);

  const handlePresetSelect = (presetKey) => {
    const preset = policyPresets[presetKey];
    if (!preset) return;
    applyPolicyPreset(preset);
    showToast(`Applied ${preset.name} policy preset.`, 'success');
  };

  const handleModeChange = (modeId) => {
    if (modeId === 'autopilot') {
      setShowAutopilotConfirm(true);
      return;
    }
    updatePolicy({ mode: modeId }, `Operating mode set to ${modeId.toUpperCase()}`);
    updateSettings({ mode: modeId });
    showToast(`Operating mode updated to ${modeId.toUpperCase()}.`, 'info');
  };

  const confirmAutopilot = () => {
    updatePolicy({ mode: 'autopilot' }, 'Operating mode set to AUTOPILOT');
    updateSettings({ mode: 'autopilot' });
    setShowAutopilotConfirm(false);
    showToast('Autopilot activated with strict safety boundaries.', 'warning');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 overflow-x-hidden w-full max-w-full">
      {/* 1. HERO SECTION */}
      <div className="ghost-panel ghost-glow p-6 sm:p-8 border-white/15 bg-black max-w-full">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="pulse-dot bg-[#4de1dc]" />
              <span className="text-xs font-bold tracking-[0.2em] text-[#4de1dc] uppercase">
                Guardian Policy Studio
              </span>
            </div>
            <h1 className="mt-2 font-display text-2xl sm:text-4xl text-white">
              Creator Authority & Boundary Calibration
            </h1>
            <p className="mt-2 text-sm text-[#8f97b0] max-w-2xl leading-relaxed">
              Define what Ghost Guardian protects you from, what it handles automatically, what it brings to you, and where it must never speak for you.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <Chip variant="guardian" className="font-mono">
              🛡️ Policy v{policy?.version || '2.4.0'}
            </Chip>
            <span className="text-[11px] text-[#8f97b0]">
              Last updated: {new Date(policy?.updatedAt || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Policy Presets Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sliders size={14} className="text-[#4de1dc]" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Policy Presets:
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {Object.keys(policyPresets).map((key) => {
              const preset = policyPresets[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handlePresetSelect(key)}
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold bg-[#1e2235] text-[#8f97b0] hover:text-white hover:border-[#4de1dc]/40 border border-white/10 transition-all cursor-pointer"
                >
                  {preset.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. OPERATING MODES */}
      <section className="space-y-4">
        <SectionTitle
          title="1. Guardian Operating Autonomy"
          subtitle="Choose the level of autonomy granted to Ghost Guardian for low-risk interactions."
        />

        <div className="grid gap-4 md:grid-cols-3">
          {modes.map((m) => {
            const Icon = m.icon;
            const active = (policy?.mode || settings.mode) === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleModeChange(m.id)}
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

        {/* Autopilot Explicit Confirmation Banner */}
        {showAutopilotConfirm && (
          <div className="rounded-2xl border border-[#fbbf24] bg-[#1c1815] p-5 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-[#fbbf24]">
              <AlertTriangle size={18} />
              <h4 className="font-display text-sm font-bold uppercase tracking-wider">
                Confirm Autopilot Activation
              </h4>
            </div>
            <p className="text-xs text-[#e4e7f1] leading-relaxed">
              Autopilot allows Ghost Guardian to automatically publish approved drafts for <strong>Routine Praise</strong> and <strong>Verified FAQs</strong>. Questions, criticism, disagreements, sensitive topics, and threats will <em>always</em> require your direct human approval.
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              <Button size="sm" onClick={confirmAutopilot}>
                Confirm & Activate Autopilot
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAutopilotConfirm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* 3. POLICY STUDIO TAB NAVIGATION */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0a0a0a] border border-white/10 overflow-x-auto max-w-full scrollbar-none">
        {[
          { id: 'matrix', label: '2. Category Policy Matrix', icon: Sliders },
          { id: 'simulator', label: '3. "What Will Happen?" Simulator', icon: Sparkles },
          { id: 'keywords', label: '4. Keyword Phrase Shields', icon: ShieldAlert },
          { id: 'topics', label: '5. Protected Topics', icon: Lock },
          { id: 'trusted', label: '6. Trusted Contributors', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer border shrink-0 ${
                isActive
                  ? 'bg-[#1e2235] text-[#4de1dc] border-[#4de1dc]/40 shadow-[0_0_15px_rgba(77,225,220,0.15)]'
                  : 'border-transparent text-[#8f97b0] hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREAS */}
      {activeTab === 'matrix' && (
        <section className="space-y-4 animate-in fade-in duration-200">
          <SectionTitle
            title="Category Policy Matrix"
            subtitle="Configure what Guardian should do for each classification. Click any card to customize posture and action."
          />
          <PolicyMatrix />
        </section>
      )}

      {activeTab === 'simulator' && (
        <section className="space-y-4 animate-in fade-in duration-200">
          <SectionTitle
            title="Policy Simulator"
            subtitle="Test community comments in real-time to inspect exact deterministic decisions, matched rules, and precedence."
          />
          <PolicySimulator />
        </section>
      )}

      {activeTab === 'keywords' && (
        <section className="space-y-4 animate-in fade-in duration-200">
          <SectionTitle
            title="Custom Keyword Shields"
            subtitle="Explicit phrase protections that trigger immediate quarantine or silence before response drafting."
          />
          <KeywordShields />
        </section>
      )}

      {activeTab === 'topics' && (
        <section className="space-y-4 animate-in fade-in duration-200">
          <SectionTitle
            title="Topics Guardian Should Never Discuss Autonomously"
            subtitle="Guardrails preventing Ghost Guardian from answering questions on designated personal or legal boundaries."
          />
          <TopicBoundaries />
        </section>
      )}

      {activeTab === 'trusted' && (
        <section className="space-y-4 animate-in fade-in duration-200">
          <SectionTitle
            title="Trusted Contributors & Precedence"
            subtitle="Manage priority routing for collaborators and founding supporters. Safety rules always supersede VIP status."
          />
          <TrustedCommenters />
        </section>
      )}

      {/* 4. NON-NEGOTIABLE SAFETY CONSTITUTION */}
      <section className="ghost-panel p-6 sm:p-8 space-y-4 border-[#34d399]/20">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-[#34d399]" />
          <h3 className="font-display text-lg text-white">Constitutional Safety Precedence (Hardcoded)</h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 text-xs text-[#8f97b0] leading-relaxed">
          <div className="p-3.5 rounded-xl bg-[#0d0f17]/50 border border-white/5 space-y-1">
            <p className="font-semibold text-white">🔒 Safety Always Overrides Convenience</p>
            <p>Physical threats, doxxing, and self-harm language bypass all VIP statuses and auto-reply permissions. Immediate human review is enforced.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#0d0f17]/50 border border-white/5 space-y-1">
            <p className="font-semibold text-white">🤝 Human Moments Are Held For You</p>
            <p>Emotional vulnerability and personal disclosures never auto-publish. Ghost Guardian preserves your authentic voice.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#0d0f17]/50 border border-white/5 space-y-1">
            <p className="font-semibold text-white">📚 Grounded in Knowledge Only</p>
            <p>Answers to audience questions cite approved transcripts and FAQs. Factual claims without evidence are withheld for review.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#0d0f17]/50 border border-white/5 space-y-1">
            <p className="font-semibold text-white">🛡️ Dignified Silence on Trolling</p>
            <p>Low-value provocation is silenced rather than argued with. Ghost Guardian never retaliates or engages in online harassment.</p>
          </div>
        </div>
      </section>

      {/* 5. POLICY REVISION HISTORY AUDIT LOG */}
      <section className="ghost-panel p-6 space-y-3">
        <div className="flex items-center justify-between text-xs text-[#8f97b0] pb-2 border-b border-white/5">
          <span className="flex items-center gap-1.5 font-semibold text-white">
            <History size={14} className="text-[#4de1dc]" /> Policy Revision History
          </span>
          <span>{policy?.history?.length || 1} Revisions Logged</span>
        </div>

        <div className="space-y-2 text-xs">
          {(policy?.history || []).slice(0, 4).map((h, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02]">
              <span className="text-white">{h.summary}</span>
              <span className="text-[#8f97b0] font-mono">{new Date(h.timestamp).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
