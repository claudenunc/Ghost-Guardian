import React, { useState } from 'react';
import {
  X,
  Share2,
  FileDown,
  Mail,
  Clock,
  Check,
  Copy,
} from 'lucide-react';
import { Button, Chip } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';
import {
  generateSocialShareTemplates,
  generateTimeSavedReport,
} from '../../domain/analytics/timeSaved';

function TwitterIcon({ size = 14, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon({ size = 14, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

export default function TimeSavedBreakdown({
  isOpen,
  onClose,
  timeSavedData,
  onOpenWeeklyEmail,
  onOpenMonthlyReport,
}) {
  const { creator, settings, updateSettings, showToast } = useGuardian();
  const [shareTab, setShareTab] = useState('twitter'); // 'twitter' | 'linkedin'
  const [showShareModal, setShowShareModal] = useState(false);
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [customRate, setCustomRate] = useState(settings?.hourlyRate || 50);
  const [copiedKey, setCopiedKey] = useState(null);

  if (!isOpen) return null;

  const hours = timeSavedData?.totalHours || 47;
  const value = timeSavedData?.dollarValue || 2350;
  const rate = timeSavedData?.hourlyRate || settings?.hourlyRate || 50;
  const breakdown = timeSavedData?.breakdown || {};

  const categories = [
    {
      key: 'spamFiltered',
      icon: '🗑️',
      title: 'Spam filtered',
      hours: breakdown.spamFiltered?.hoursSaved || 12,
      display: breakdown.spamFiltered?.display || '847 comments isolated from your feed',
      detail: '1 min / comment saved on reading, identifying bot fraud & removing phishing links.',
      accent: 'text-[#34d399]',
      border: 'border-white/5 hover:border-[#34d399]/30',
    },
    {
      key: 'routineReplies',
      icon: '🤖',
      title: 'Routine replies drafted',
      hours: breakdown.routineReplies?.hoursSaved || 15,
      display: breakdown.routineReplies?.display || '234 comments acknowledged in your voice',
      detail: '4 min / comment saved on reading, voice alignment calibration, and draft posting.',
      accent: 'text-[#4de1dc]',
      border: 'border-white/5 hover:border-[#4de1dc]/30',
    },
    {
      key: 'hostileShielded',
      icon: '🛡️',
      title: 'Hostile shielded',
      hours: breakdown.hostileShielded?.hoursSaved || 8,
      display: breakdown.hostileShielded?.display || '23 comments concealed in Shield Vault',
      detail: '20 min / comment saved on emotional cognitive drain, rumination & threat evaluation.',
      accent: 'text-[#818cf8]',
      border: 'border-white/5 hover:border-[#818cf8]/30',
    },
    {
      key: 'strategicSilence',
      icon: '🤐',
      title: 'Strategic silence',
      hours: breakdown.strategicSilence?.hoursSaved || 12,
      display: breakdown.strategicSilence?.display || '156 comments left unanswered (smart move)',
      detail: '5 min / comment saved by deliberately withholding attention from bad-faith troll bait.',
      accent: 'text-[#fbbf24]',
      border: 'border-white/5 hover:border-[#fbbf24]/30',
    },
  ];

  const humanMoments = breakdown.humanMomentsPreserved || {
    count: 18,
    display: '18 moments preserved for your authentic voice',
  };

  const shareTemplates = generateSocialShareTemplates({
    totalHours: hours,
    dollarValue: value,
    breakdown,
  });

  const handleCopyShare = (platform) => {
    const text = platform === 'twitter' ? shareTemplates.twitter : shareTemplates.linkedin;
    navigator.clipboard.writeText(text);
    setCopiedKey(platform);
    showToast(`Copied ${platform === 'twitter' ? 'Twitter/X' : 'LinkedIn'} share text!`, 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExportReport = () => {
    const reportText = generateTimeSavedReport({
      creatorName: creator?.displayName || 'Alex Chen',
      channelName: creator?.channelName || 'The Long Signal',
      totalHours: hours,
      dollarValue: value,
      hourlyRate: rate,
      breakdown,
      periodLabel: 'Monthly Value Breakdown',
    });

    const blob = new Blob([reportText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ghost-guardian-time-saved-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast('Time saved report downloaded.', 'success');
  };

  const handleSaveRate = () => {
    const parsed = Math.max(1, Number(customRate) || 50);
    updateSettings({ hourlyRate: parsed });
    setIsEditingRate(false);
    showToast(`Creator hourly rate updated to $${parsed}/hr.`, 'success');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 animate-in fade-in duration-200"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.96)' }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border border-white/20 bg-[#0a0a0a] shadow-[0_0_60px_rgba(0,0,0,1)] overflow-hidden"
        style={{ backgroundColor: '#0a0a0a' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-white/10 bg-[#000000]"
          style={{ backgroundColor: '#000000' }}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-white/10 text-white">
                <Clock size={16} />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Attention Economics
              </span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl text-white font-bold">
              How Ghost Guardian saved you {hours} hours
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#8f97b0] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Hero Value Banner */}
          <div className="p-5 rounded-2xl border border-[#4de1dc]/30 bg-gradient-to-br from-[#13202a]/80 via-[#101424]/90 to-[#1b152d]/80 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8f97b0] block">
                Total Month Valuation
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-display font-bold text-white">{hours} hours</span>
                <span className="text-lg font-display text-[#34d399] font-semibold">· ${value.toLocaleString()} value</span>
              </div>
            </div>

            {/* Hourly Rate Tool */}
            <div className="flex items-center gap-2 bg-[#0a0d14]/70 px-3.5 py-2 rounded-xl border border-white/5 text-xs">
              {isEditingRate ? (
                <div className="flex items-center gap-2">
                  <span className="text-[#8f97b0]">$</span>
                  <input
                    type="number"
                    value={customRate}
                    onChange={(e) => setCustomRate(e.target.value)}
                    aria-label="Custom Hourly Rate in Dollars"
                    className="w-16 rounded-lg bg-black/50 border border-[#4de1dc] px-2 py-1 text-xs text-white focus:outline-none"
                    min="1"
                    max="1000"
                  />
                  <span className="text-[#8f97b0]">/hr</span>
                  <button
                    type="button"
                    onClick={handleSaveRate}
                    aria-label="Save Hourly Rate"
                    className="p-1 rounded bg-[#4de1dc] text-black font-bold hover:bg-[#38cac5] transition-colors"
                  >
                    <Check size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[#8f97b0]">
                    Rate: <strong className="text-white font-mono">${rate}/hr</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingRate(true)}
                    className="text-[11px] text-[#4de1dc] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Breakdown Categories List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8f97b0]">
              Category Breakdown
            </h3>

            {categories.map((cat) => (
              <div
                key={cat.key}
                className="p-4 rounded-2xl bg-[#000000] border border-white/10 transition-all"
                style={{ backgroundColor: '#000000' }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{cat.icon}</span>
                    <div>
                      <h4 className="font-display text-sm text-white font-bold">{cat.title}</h4>
                      <p className="text-xs text-[#a0a0a0] mt-0.5">{cat.display}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-base font-display font-bold ${cat.accent}`}>
                      {cat.hours} hours
                    </span>
                    <span className="text-[10px] text-[#a0a0a0] block">
                      ~${Math.round(cat.hours * rate).toLocaleString()} value
                    </span>
                  </div>
                </div>

                <p className="mt-2.5 pt-2.5 border-t border-white/5 text-[11px] text-[#a0a0a0] leading-relaxed">
                  {cat.detail}
                </p>
              </div>
            ))}

            {/* Human Moments Protected Row */}
            <div
              className="p-4 rounded-2xl bg-[#000000] border border-white/15 flex items-center justify-between gap-3"
              style={{ backgroundColor: '#000000' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🤍</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display text-sm text-white font-bold">Human moments protected</h4>
                    <Chip variant="outline" className="text-[10px] text-white">Priceless</Chip>
                  </div>
                  <p className="text-xs text-white/80 mt-0.5">{humanMoments.display}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-[#8f97b0] italic">Not automated</span>
              </div>
            </div>
          </div>

          {/* Share & Digest Previews Grid */}
          <div className="grid gap-3 sm:grid-cols-2 pt-2">
            <div className="p-4 rounded-2xl border border-white/5 bg-[#121522] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Mail size={14} className="text-[#4de1dc]" /> Email Digests
                </span>
                <Chip variant="guardian" className="text-[10px]">Automated</Chip>
              </div>
              <p className="text-[11px] text-[#8f97b0] leading-relaxed">
                Preview your weekly time-saved breakdown or monthly executive report email.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={onOpenWeeklyEmail} className="text-xs gap-1.5 flex-1">
                  Weekly Email
                </Button>
                <Button size="sm" variant="outline" onClick={onOpenMonthlyReport} className="text-xs gap-1.5 flex-1">
                  Monthly Deep-Dive
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-white/5 bg-[#121522] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Share2 size={14} className="text-[#34d399]" /> Social Sharing
                </span>
                <Chip variant="positive" className="text-[10px]">Viral Metric</Chip>
              </div>
              <p className="text-[11px] text-[#8f97b0] leading-relaxed">
                Share your protected creator hours on Twitter/X or LinkedIn with one click.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowShareModal(true);
                    setShareTab('twitter');
                  }}
                  className="text-xs gap-1.5 flex-1"
                >
                  <TwitterIcon size={12} className="text-[#38bdf8]" /> Twitter/X
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowShareModal(true);
                    setShareTab('linkedin');
                  }}
                  className="text-xs gap-1.5 flex-1"
                >
                  <LinkedinIcon size={12} className="text-[#0a66c2]" /> LinkedIn
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 sm:px-8 py-4 border-t border-white/10 bg-[#141829] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#8f97b0]">
            <span>Total:</span>
            <strong className="text-white">{hours} hours</strong>
            <span>·</span>
            <strong className="text-[#34d399]">${value.toLocaleString()} value</strong>
          </div>

          <div className="flex items-center gap-2.5">
            <Button size="sm" variant="outline" onClick={handleExportReport} className="gap-1.5">
              <FileDown size={14} /> Export Report
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setShowShareModal(true);
                setShareTab('twitter');
              }}
              className="gap-1.5"
            >
              <Share2 size={14} /> Share on Twitter
            </Button>
          </div>
        </div>

        {/* Embedded Social Share Modal */}
        {showShareModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
            <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#121625] p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Share2 size={16} className="text-[#4de1dc]" />
                  <h3 className="font-display text-sm text-white font-bold">Share Creator Savings</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="p-1 rounded text-[#8f97b0] hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Platform Switcher */}
              <div className="flex rounded-xl bg-[#0a0d14] p-1 border border-white/5">
                <button
                  type="button"
                  onClick={() => setShareTab('twitter')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    shareTab === 'twitter'
                      ? 'bg-[#1e2235] text-[#38bdf8] shadow'
                      : 'text-[#8f97b0] hover:text-white'
                  }`}
                >
                  <TwitterIcon size={14} /> Twitter / X
                </button>
                <button
                  type="button"
                  onClick={() => setShareTab('linkedin')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    shareTab === 'linkedin'
                      ? 'bg-[#1e2235] text-[#0a66c2] shadow'
                      : 'text-[#8f97b0] hover:text-white'
                  }`}
                >
                  <LinkedinIcon size={14} /> LinkedIn
                </button>
              </div>

              {/* Template Content */}
              <div className="p-4 rounded-xl border border-white/10 bg-[#0a0d14] text-xs text-white font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {shareTab === 'twitter' ? shareTemplates.twitter : shareTemplates.linkedin}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-[#8f97b0]">Ready to paste anywhere</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyShare(shareTab)}
                    className="gap-1.5"
                  >
                    {copiedKey === shareTab ? <Check size={14} className="text-[#34d399]" /> : <Copy size={14} />}
                    {copiedKey === shareTab ? 'Copied!' : 'Copy to Clipboard'}
                  </Button>
                  {shareTab === 'twitter' && (
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTemplates.twitter)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#38bdf8] text-black hover:bg-[#22aef0] transition-colors"
                    >
                      <TwitterIcon size={13} /> Post on X
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
