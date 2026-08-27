import React from 'react';
import {
  Shield,
  ShieldCheck,
  Zap,
  Users,
  Bell,
  Download,
  RotateCcw,
  Video,
  Link2,
  Bot,
  Sparkles,
  Check,
} from 'lucide-react';
import {
  Button,
  Chip,
  SectionTitle,
  Switch,
} from '../components/guardian/atoms';
import { useGuardian } from '../lib/store';

const modes = [
  {
    id: 'copilot',
    title: 'Copilot',
    body: 'Guardian drafts, you approve. Nothing publishes without you. Default and recommended.',
  },
  {
    id: 'autopilot',
    title: 'Autopilot',
    body: 'Only low-risk categories you approved — simple praise, common FAQs, acknowledgements — go out automatically.',
  },
  {
    id: 'guardian',
    title: 'Guardian',
    body: 'Safety-first. Escalations surface immediately and hostile threads default to boundaries or silence.',
  },
];

const plans = [
  { name: 'Free', price: '$0', body: 'Demo mode and limited comment processing.' },
  { name: 'Creator', price: '$29/mo', body: 'For individual creators with an active comment section.' },
  { name: 'Pro', price: '$89/mo', body: 'High volume, multiple channels, weekly reports.' },
  { name: 'Custom Guardian', price: 'Talk to us', body: 'Podcasts, media companies, agencies and creator teams.' },
];

export default function Settings() {
  const { settings, updateSettings, resetDemo, exportData, showToast } = useGuardian();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <SectionTitle
        title="Settings & Controls"
        subtitle="You are always in control. Pause, switch modes, configure notifications, export backups, or manage your workspace."
      />

      {/* OPERATING MODE SELECTOR */}
      <section className="space-y-3">
        <SectionTitle title="Operating Mode" />
        <div className="grid gap-3 lg:grid-cols-3">
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                updateSettings({ mode: m.id });
                showToast(`${m.title} mode active.`, 'success');
              }}
              className={`ghost-panel p-5 text-left transition-all cursor-pointer ${
                settings.mode === m.id ? 'border-[#4de1dc] ghost-glow' : 'hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#4de1dc]" />
                  <p className="font-display text-white font-bold">{m.title}</p>
                </div>
                {settings.mode === m.id && <Chip variant="guardian">Active</Chip>}
              </div>
              <p className="mt-2 text-xs text-[#8f97b0] leading-relaxed">{m.body}</p>
            </button>
          ))}
        </div>
      </section>

      {/* EMERGENCY CONTROLS */}
      <section className="ghost-panel space-y-4 p-6">
        <h3 className="font-display text-base text-white">Emergency Controls & Wit</h3>
        <ToggleRow
          label="Pause Guardian entirely"
          hint="Stops all automated activity immediately."
          checked={settings.paused}
          onChange={(v) => {
            updateSettings({ paused: v });
            showToast(v ? 'Guardian paused.' : 'Guardian resumed.', v ? 'warning' : 'success');
          }}
        />
        <ToggleRow
          label="Pause auto-replies only"
          hint="Classification and intelligence keep running; nothing gets published."
          checked={settings.pauseAutoReplies}
          onChange={(v) => {
            updateSettings({ pauseAutoReplies: v });
            showToast(v ? 'Auto-replies paused.' : 'Auto-replies resumed.', 'info');
          }}
        />
        <ToggleRow
          label="Guardian Wit"
          hint="Composed, clever responses to hostility. Outclass it without becoming it — never insults."
          checked={settings.guardianWit}
          onChange={(v) => {
            updateSettings({ guardianWit: v });
            showToast(v ? 'Guardian Wit enabled.' : 'Guardian Wit disabled.', 'info');
          }}
        />
      </section>

      {/* NOTIFICATIONS */}
      <section className="ghost-panel space-y-4 p-6">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-[#4de1dc]" />
          <h3 className="font-display text-base text-white">Creator Notification Preferences</h3>
        </div>
        <ToggleRow
          label="Threats and critical risk alerts"
          hint="Immediate alert when a safety violation or doxxing risk is flagged."
          checked={settings.notifyThreats}
          onChange={(v) => updateSettings({ notifyThreats: v })}
        />
        <ToggleRow
          label="Important and recurring questions"
          hint="Notify when 5+ commenters ask the same conceptual question."
          checked={settings.notifyQuestions}
          onChange={(v) => updateSettings({ notifyQuestions: v })}
        />
        <ToggleRow
          label="Unusual negativity spikes"
          hint="Alert if hostile sentiment exceeds 20% on any single video."
          checked={settings.notifySpikes}
          onChange={(v) => updateSettings({ notifySpikes: v })}
        />
        <ToggleRow
          label="Ghost Guardian Weekly Digest"
          hint="Receive weekly summaries of time saved, community trends, and top inquiries."
          checked={settings.notifyWeekly}
          onChange={(v) => updateSettings({ notifyWeekly: v })}
        />
      </section>

      {/* PLATFORM CONNECTIONS */}
      <section className="space-y-3">
        <SectionTitle
          title="Platform Connections"
          subtitle="YouTube first. The same intelligence pipeline accepts other social platforms."
        />
        <div className="ghost-panel space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-[#f87171]/15 text-[#f87171] flex items-center justify-center">
                <Video size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">YouTube Data Integration</p>
                  <Chip variant="positive">Connected (Demo)</Chip>
                </div>
                <p className="text-xs text-[#8f97b0] mt-0.5">
                  Running on authenticated workspace demo data. Live channel linking uses YouTube OAuth 2.0.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
            {['Instagram', 'TikTok', 'X (Twitter)', 'Reddit', 'Discord', 'Facebook'].map((p) => (
              <Chip key={p} variant="outline">
                <Link2 size={11} /> {p} — Planned
              </Chip>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING ARCHITECTURE */}
      <section className="space-y-3">
        <SectionTitle
          title="Subscription Tiers & Plans"
          subtitle="Transparent pricing architecture built for sustainable creator longevity."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => (
            <div key={p.name} className="ghost-panel p-5 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-display font-bold text-white">{p.name}</p>
                {p.name === 'Creator' && <Chip variant="guardian">Popular</Chip>}
              </div>
              <p className="text-2xl font-display text-[#4de1dc] font-bold">{p.price}</p>
              <p className="text-xs text-[#8f97b0] leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMING SOON EXPANSIONS */}
      <section className="space-y-3">
        <SectionTitle title="Future Expansion Suite" />
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="ghost-panel p-5 space-y-2">
            <div className="flex items-center gap-2 text-[#4de1dc]">
              <Bot size={18} />
              <h4 className="font-display text-base text-white">Creator Assistant</h4>
            </div>
            <p className="text-xs text-[#8f97b0] leading-relaxed">
              Episode and guest research, automated show notes, YouTube titles, newsletter drafts, and production checklists — built on your personal knowledge base.
            </p>
            <Chip variant="outline">In Active Development</Chip>
          </div>

          <div className="ghost-panel p-5 space-y-2">
            <div className="flex items-center gap-2 text-[#4de1dc]">
              <Sparkles size={18} />
              <h4 className="font-display text-base text-white">Create Without Fear</h4>
            </div>
            <p className="text-xs text-[#8f97b0] leading-relaxed">
              Shielding mode designed for new creators who hesitate to publish due to anxiety about hostile public comments. Protect your nervous system while building your audience.
            </p>
            <Chip variant="outline">In Active Development</Chip>
          </div>
        </div>
      </section>

      {/* DATA MANAGEMENT & EXPORT */}
      <section className="ghost-panel space-y-4 p-6 border-white/15">
        <h3 className="font-display text-base text-white">Your Data & Local Storage</h3>
        <p className="text-xs text-[#8f97b0] leading-relaxed">
          Ghost Guardian persists your calibrated voice settings, approved knowledge items, and moderation decisions directly in your browser. You can export a full JSON backup anytime.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button size="sm" onClick={exportData}>
            <Download size={14} /> Export My Data (JSON Backup)
          </Button>
          <Button size="sm" variant="destructive" onClick={resetDemo}>
            <RotateCcw size={14} /> Reset Workspace to Demo
          </Button>
        </div>
      </section>
    </div>
  );
}

function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div>
        <p className="text-xs sm:text-sm font-semibold text-white">{label}</p>
        {hint && <p className="text-[11px] text-[#8f97b0] mt-0.5">{hint}</p>}
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}
