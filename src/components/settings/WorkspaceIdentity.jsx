import React, { useState } from 'react';
import { User, Globe, Clock, Sparkles, Check, DollarSign, ShieldCheck } from 'lucide-react';
import { Button, Chip, Input, SectionTitle } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';
import { calculateTimeSaved } from '../../domain/analytics/timeSaved';

export default function WorkspaceIdentity() {
  const { creator, settings, updateSettings, showToast, comments, commentStates } = useGuardian();

  const [name, setName] = useState(creator?.displayName || 'Alex Chen');
  const [handle, setHandle] = useState(creator?.handle || '@alexchen');
  const [channel, setChannel] = useState(creator?.channelName || 'The Long Signal');
  const [timezone, setTimezone] = useState('America/Los_Angeles');
  const [language, setLanguage] = useState('English (US)');
  const [hourlyRate, setHourlyRate] = useState(settings?.hourlyRate || 50);

  const monthlySavings = calculateTimeSaved(comments, commentStates, hourlyRate, { useMonthlyProjection: true });

  const handleSave = () => {
    updateSettings({ hourlyRate: Math.max(1, Number(hourlyRate) || 50) });
    showToast('Workspace identity and attention valuation updated.', 'success');
  };

  return (
    <section className="ghost-panel p-6 sm:p-8 space-y-6">
      {/* Workspace Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-[#4de1dc]/15 text-[#4de1dc] flex items-center justify-center font-display font-bold text-lg">
            {name[0] || 'A'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg text-white font-bold">{name}</h3>
              <Chip variant="guardian">Demo Workspace</Chip>
            </div>
            <p className="text-xs text-[#8f97b0] mt-0.5">
              {channel} · {handle}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-[#8f97b0] block">
            Workspace Mode
          </span>
          <span className="text-xs text-[#e4e7f1] font-mono">Fictional Demo Environment</span>
        </div>
      </div>

      {/* Identity Fields Grid */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[#8f97b0] block mb-1.5">
            Creator Display Name
          </label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[#8f97b0] block mb-1.5">
            Creator Channel / Podcast Name
          </label>
          <Input value={channel} onChange={(e) => setChannel(e.target.value)} />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[#8f97b0] block mb-1.5">
            Creator Handle / Platform Username
          </label>
          <Input value={handle} onChange={(e) => setHandle(e.target.value)} />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[#8f97b0] block mb-1.5">
            Creator Hourly Rate ($ USD / hr)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#8f97b0]">$</span>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0d0f17] pl-7 pr-3 py-2 text-xs text-white focus:border-[#4de1dc] focus:outline-none"
              placeholder="50"
              min="1"
              max="1000"
            />
          </div>
          <p className="text-[11px] text-[#8f97b0] mt-1">
            Used to calculate creator dollar value saved across the dashboard and reports.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:col-span-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#8f97b0] block mb-1.5">
              Time Zone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0d0f17] px-3 py-2 text-xs text-white focus:border-[#4de1dc] focus:outline-none"
            >
              <option value="America/Los_Angeles">Pacific (PT - Los Angeles)</option>
              <option value="America/New_York">Eastern (ET - New York)</option>
              <option value="Europe/London">GMT / BST (London)</option>
              <option value="Europe/Paris">CET (Paris / Berlin)</option>
              <option value="Asia/Tokyo">JST (Tokyo)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#8f97b0] block mb-1.5">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0d0f17] px-3 py-2 text-xs text-white focus:border-[#4de1dc] focus:outline-none"
            >
              <option value="English (US)">English (US)</option>
              <option value="English (UK)">English (UK)</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lifetime Attention Saved Snapshot */}
      <div className="p-4 rounded-2xl border border-white/5 bg-[#0d0f17]/60 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#34d399]/15 text-[#34d399]">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h4 className="font-display text-sm text-white font-bold">Lifetime Attention Shielding</h4>
            <p className="text-xs text-[#8f97b0]">Estimated monthly value delivered by Ghost Guardian</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <span className="text-xs text-[#8f97b0] block">Monthly Time Saved</span>
            <span className="text-lg font-display font-bold text-[#4de1dc]">{monthlySavings.totalHours} hrs</span>
          </div>
          <div>
            <span className="text-xs text-[#8f97b0] block">Monthly Time Value</span>
            <span className="text-lg font-display font-bold text-[#34d399]">${monthlySavings.dollarValue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#8f97b0]">
        <span>Identity settings apply across notifications and digest signatures.</span>
        <Button size="sm" onClick={handleSave}>
          <Check size={14} /> Save Workspace Changes
        </Button>
      </div>
    </section>
  );
}

