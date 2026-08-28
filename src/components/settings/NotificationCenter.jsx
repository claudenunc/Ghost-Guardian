import React, { useState } from 'react';
import {
  Bell,
  HeartHandshake,
  ShieldAlert,
  MessageSquare,
  Moon,
  Clock,
  Mail,
  CheckCircle,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { Button, Chip, Switch } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';

export default function NotificationCenter() {
  const { settings, updateSettings, showToast } = useGuardian();

  const [notifyHumanMoments, setNotifyHumanMoments] = useState(true);
  const [notifySafety, setNotifySafety] = useState(settings?.notifyThreats ?? true);
  const [notifyHighValue, setNotifyHighValue] = useState(settings?.notifyQuestions ?? true);
  const [digestFreq, setDigestFreq] = useState(settings?.notifyWeekly ? 'weekly' : 'daily');
  const [digestTime, setDigestTime] = useState('09:00');
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('08:00');

  const handleSave = () => {
    updateSettings({
      notifyThreats: notifySafety,
      notifyQuestions: notifyHighValue,
      notifyWeekly: digestFreq === 'weekly',
    });
    showToast('Notification preferences updated.', 'success');
  };

  return (
    <section className="ghost-panel p-6 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div>
          <h3 className="font-display text-lg text-white font-bold">Notification Center</h3>
          <p className="text-xs text-[#8f97b0] mt-0.5">
            Calibrate how and when Ghost Guardian interrupts your creative focus.
          </p>
        </div>
        <Chip variant="guardian">Attention Protected</Chip>
      </div>

      {/* 1. Guardian Real-Time Interruptions */}
      <div className="space-y-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#4de1dc] block">
          Real-Time Guardian Interruptions
        </span>

        <div className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-[#0d0f17]/60 overflow-hidden">
          {/* Human Moments */}
          <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-xl bg-[#ec4899]/15 text-[#ec4899] flex items-center justify-center shrink-0 mt-0.5">
                <HeartHandshake size={18} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-white">
                  Human Moments & Vulnerable Disclosures
                </p>
                <p className="text-xs text-[#8f97b0] mt-0.5 leading-relaxed">
                  Notify me when someone shares something deeply personal, emotional, or meaningful that deserves human warmth.
                </p>
              </div>
            </div>
            <Switch
              checked={notifyHumanMoments}
              onChange={(v) => setNotifyHumanMoments(v)}
            />
          </div>

          {/* Safety Alert */}
          <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-xl bg-[#f87171]/15 text-[#f87171] flex items-center justify-center shrink-0 mt-0.5">
                <ShieldAlert size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs sm:text-sm font-semibold text-white">
                    Safety & Physical Threats
                  </p>
                  <Chip variant="critical">High Priority</Chip>
                </div>
                <p className="text-xs text-[#8f97b0] mt-0.5 leading-relaxed">
                  Notify me immediately when Guardian detects a potential threat, doxxing attempt, or serious safety concern.
                </p>
              </div>
            </div>
            <Switch checked={notifySafety} onChange={(v) => setNotifySafety(v)} />
          </div>

          {/* High-Value Conversations */}
          <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-xl bg-[#818cf8]/15 text-[#818cf8] flex items-center justify-center shrink-0 mt-0.5">
                <MessageSquare size={18} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-white">
                  High-Value Conversations & Intellectual Critique
                </p>
                <p className="text-xs text-[#8f97b0] mt-0.5 leading-relaxed">
                  Notify me when insightful questions or substantive constructive feedback arrive that merit direct engagement.
                </p>
              </div>
            </div>
            <Switch
              checked={notifyHighValue}
              onChange={(v) => setNotifyHighValue(v)}
            />
          </div>
        </div>
      </div>

      {/* 2. Digest & Summary Schedule */}
      <div className="space-y-4 pt-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#8f97b0] block">
          Guardian Summary Digest
        </span>

        <div className="rounded-2xl border border-white/10 bg-[#0d0f17]/60 p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-[#8f97b0] uppercase block mb-1.5">
                Digest Frequency
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['off', 'daily', 'weekly'].map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setDigestFreq(freq)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer capitalize ${
                      digestFreq === freq
                        ? 'border-[#4de1dc] bg-[#4de1dc]/15 text-[#4de1dc]'
                        : 'border-white/10 bg-black/40 text-[#8f97b0] hover:text-white'
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#8f97b0] uppercase block mb-1.5">
                Preferred Delivery Time
              </label>
              <input
                type="time"
                value={digestTime}
                onChange={(e) => setDigestTime(e.target.value)}
                disabled={digestFreq === 'off'}
                className="w-full rounded-xl border border-white/10 bg-[#0d0f17] px-3 py-2 text-xs text-white disabled:opacity-40 focus:border-[#4de1dc] focus:outline-none"
              />
            </div>
          </div>
          <p className="text-[11px] text-[#8f97b0]">
            Includes metrics on creator attention protected, emerging question clusters, and relationship signals.
          </p>
        </div>
      </div>

      {/* 3. Quiet Hours & Safety Bypass Exception */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8f97b0] block">
            Quiet Hours (Do Not Disturb)
          </span>
          <Switch
            checked={quietHoursEnabled}
            onChange={(v) => setQuietHoursEnabled(v)}
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d0f17]/60 p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-[#8f97b0] uppercase block mb-1.5">
                Quiet Period Starts
              </label>
              <input
                type="time"
                value={quietStart}
                onChange={(e) => setQuietStart(e.target.value)}
                disabled={!quietHoursEnabled}
                className="w-full rounded-xl border border-white/10 bg-[#0d0f17] px-3 py-2 text-xs text-white disabled:opacity-40 focus:border-[#4de1dc] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#8f97b0] uppercase block mb-1.5">
                Quiet Period Ends
              </label>
              <input
                type="time"
                value={quietEnd}
                onChange={(e) => setQuietEnd(e.target.value)}
                disabled={!quietHoursEnabled}
                className="w-full rounded-xl border border-white/10 bg-[#0d0f17] px-3 py-2 text-xs text-white disabled:opacity-40 focus:border-[#4de1dc] focus:outline-none"
              />
            </div>
          </div>

          {/* Hardcoded Safety Bypass Guarantee */}
          <div className="rounded-xl border border-[#f87171]/25 bg-black/40 p-3 flex items-start gap-2.5 text-xs text-[#e4e7f1]">
            <Lock size={14} className="text-[#f87171] shrink-0 mt-0.5" />
            <span>
              <strong>Safety Override Guarantee:</strong> High-risk safety alerts (physical threats and doxxing hazards) will bypass quiet hours to ensure urgent creator protection.
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-white/5 flex items-center justify-end">
        <Button size="sm" onClick={handleSave}>
          <CheckCircle size={14} /> Update Notification Preferences
        </Button>
      </div>
    </section>
  );
}
