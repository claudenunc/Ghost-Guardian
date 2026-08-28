import React, { useState } from 'react';
import { User, Globe, Clock, Sparkles, Check } from 'lucide-react';
import { Button, Chip, Input, SectionTitle } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';

export default function WorkspaceIdentity() {
  const { creator, updateSettings, showToast, isDemo } = useGuardian();

  const [name, setName] = useState(creator?.displayName || 'Alex Chen');
  const [handle, setHandle] = useState(creator?.handle || '@alexchen');
  const [channel, setChannel] = useState(creator?.channelName || 'The Long Signal');
  const [timezone, setTimezone] = useState('America/Los_Angeles');
  const [language, setLanguage] = useState('English (US)');

  const handleSave = () => {
    showToast('Workspace identity updated.', 'success');
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

        <div className="grid grid-cols-2 gap-3">
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

      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#8f97b0]">
        <span>Identity settings apply across notifications and digest signatures.</span>
        <Button size="sm" onClick={handleSave}>
          <Check size={14} /> Save Workspace Changes
        </Button>
      </div>
    </section>
  );
}
