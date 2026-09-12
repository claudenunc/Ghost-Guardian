import React, { useState } from 'react';
import { Button, Chip, Input } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';
import { calculateTimeSaved } from '../../domain/analytics/timeSaved';

export default function WorkspaceIdentity() {
  const { creator, session, settings, updateSettings, updateCreator, showToast, comments, commentStates } = useGuardian();

  const [name, setName] = useState(creator?.displayName || session?.user?.user_metadata?.name || 'Creator');
  const [handle, setHandle] = useState(creator?.handle || '@creator');
  const [channel, setChannel] = useState(creator?.channelName || 'My YouTube Channel');
  const [timezone, setTimezone] = useState('America/Los_Angeles');
  const [language, setLanguage] = useState('English (US)');
  const [hourlyRate, setHourlyRate] = useState(settings?.hourlyRate || 50);

  const monthlySavings = calculateTimeSaved(comments, commentStates, hourlyRate, { useMonthlyProjection: true });

  const handleSave = () => {
    updateCreator?.({
      displayName: name.trim() || 'Creator',
      handle: handle.trim() || '@creator',
      channelName: channel.trim() || 'My YouTube Channel',
    });
    updateSettings?.({ hourlyRate: Math.max(1, Number(hourlyRate) || 50) });
    showToast('Workspace identity and attention valuation updated.', 'success');
  };

  return (
    <section className="ghost-panel p-6 sm:p-8 space-y-6">
      {/* Workspace Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-[#0200F1]/20 text-[#0200F1] flex items-center justify-center font-display font-bold text-lg border border-[#0200F1]/30">
            {name[0] || 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg text-white font-bold">{name}</h3>
              <Chip variant="positive">Active Workspace</Chip>
            </div>
            <p className="text-xs text-[#8f97b0] mt-0.5">
              {channel} · {handle}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-[#8f97b0] block">
            Workspace Status
          </span>
          <span className="text-xs text-[#e4e7f1] font-mono">Protected Creator Workspace</span>
        </div>
      </div>

      {/* Identity Fields Grid */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[#8f97b0] block mb-1.5">
            Creator Display Name
          </label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[#8f97b0] block mb-1.5">
            Creator Channel / Podcast Name
          </label>
          <Input value={channel} onChange={(e) => setChannel(e.target.value)} placeholder="Channel Name" />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[#8f97b0] block mb-1.5">
            Creator Handle / Platform Username
          </label>
          <Input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@handle" />
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
              aria-label="Creator Hourly Rate in Dollars"
              className="w-full rounded-xl border border-white/10 bg-[#0d0f17] pl-7 pr-3 py-2 text-xs text-white focus:border-[#0200F1] focus:outline-none"
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
              className="w-full rounded-xl border border-white/10 bg-[#0d0f17] p-2.5 text-xs text-white focus:border-[#0200F1] focus:outline-none"
            >
              <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
              <option value="America/Denver">Mountain Time (US & Canada)</option>
              <option value="America/Chicago">Central Time (US & Canada)</option>
              <option value="America/New_York">Eastern Time (US & Canada)</option>
              <option value="UTC">UTC Universal</option>
              <option value="Europe/London">London (GMT / BST)</option>
              <option value="Europe/Berlin">Central European Time</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="Australia/Sydney">Sydney (AEST)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#8f97b0] block mb-1.5">
              Primary Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0d0f17] p-2.5 text-xs text-white focus:border-[#0200F1] focus:outline-none"
            >
              <option value="English (US)">English (US)</option>
              <option value="English (UK)">English (UK)</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Japanese">Japanese</option>
            </select>
          </div>
        </div>
      </div>

      {/* Monthly Valuation Projection Snapshot */}
      <div className="p-4 rounded-xl bg-[#050505] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-white block">
            Current Attention Valuation Baseline
          </span>
          <p className="text-xs text-[#8f97b0] mt-0.5">
            At ${hourlyRate}/hr, Ghost Guardian protects an estimated{' '}
            <strong className="text-white">${monthlySavings.monthlyProjectedDollars.toLocaleString()}</strong> in creator attention monthly.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono font-bold text-[#00FF66]">
            ~{monthlySavings.monthlyProjectedHours} hrs/mo saved
          </span>
        </div>
      </div>

      {/* Save Action Bar */}
      <div className="flex justify-end pt-2">
        <Button onClick={handleSave}>
          Save Identity Changes
        </Button>
      </div>
    </section>
  );
}
