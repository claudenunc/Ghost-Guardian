import React, { useState } from 'react';
import { Copy, Check, X, FileDown, Sparkles } from 'lucide-react';
import { Button } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';
import { generateTimeSavedReport } from '../../domain/analytics/timeSaved';

export default function MonthlyReportEmail({
  isOpen,
  onClose,
  timeSavedData,
  topTopics = [],
  activeCommenter = null,
}) {
  const { creator, showToast } = useGuardian();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const creatorName = creator?.displayName || 'Alex Chen';
  const channelName = creator?.channelName || 'The Long Signal';
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const hours = timeSavedData?.totalHours || 47;
  const value = timeSavedData?.dollarValue || 2350;
  const breakdown = timeSavedData?.breakdown || {};

  const totalHandled = (breakdown.spamFiltered?.count || 847) + (breakdown.routineReplies?.count || 234) + (breakdown.strategicSilence?.count || 156);
  const threatsBlocked = breakdown.hostileShielded?.count || 23;
  const humanMoments = breakdown.humanMomentsPreserved?.count || 18;

  const topTopic = topTopics?.[0] || { topic: 'Panpsychism', mentions: 137, delta: 41 };
  const topMember = activeCommenter || { displayName: 'Elena Vance', interactions: 112 };

  const emailSubject = `Your Ghost Guardian Monthly Report — ${currentMonth}`;

  const emailPlainText = `Subject: ${emailSubject}

Hey ${creatorName},

Here's your Ghost Guardian report for ${currentMonth}:

⏱️ Total time saved: ${hours} hours ($${value.toLocaleString()} value)
💬 Comments handled: ${totalHandled.toLocaleString()}
🛡️ Threats blocked: ${threatsBlocked}
🤍 Human moments preserved: ${humanMoments}

Top insights:
- Your audience is asking about ${topTopic.topic} (${topTopic.mentions} mentions, +${topTopic.delta}% growth)
- Community health score: 96/100 (up 4 points)
- Most active commenter: ${topMember.displayName} (${topMember.interactions || 42} comments)

[Download Full Report] [Share Results]

— Ghost Guardian`;

  const handleCopy = () => {
    navigator.clipboard.writeText(emailPlainText);
    setCopied(true);
    showToast('Monthly report email copied to clipboard.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const reportText = generateTimeSavedReport({
      creatorName,
      channelName,
      totalHours: hours,
      dollarValue: value,
      hourlyRate: timeSavedData?.hourlyRate || 50,
      breakdown,
      periodLabel: `${currentMonth} Executive Report`,
    });

    const blob = new Blob([reportText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ghost-guardian-monthly-report-${currentMonth.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast('Monthly markdown report downloaded.', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-[#4de1dc]/30 bg-[#0f121d] shadow-[0_0_50px_rgba(77,225,220,0.15)] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141829]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#c084fc]/10 text-[#c084fc]">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="font-display text-base text-white font-bold">Monthly Deep-Dive Report Preview</h2>
              <p className="text-xs text-[#8f97b0]">Comprehensive monthly executive value summary for creators</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8f97b0] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Email Metadata */}
        <div className="px-6 py-3 border-b border-white/5 bg-[#121522] text-xs space-y-1">
          <div className="flex items-center gap-2 text-[#8f97b0]">
            <span className="font-semibold text-white">To:</span> {creatorName} &lt;alex@thesignal.fm&gt;
          </div>
          <div className="flex items-center gap-2 text-[#8f97b0]">
            <span className="font-semibold text-white">Subject:</span>
            <span className="text-[#c084fc] font-medium">{emailSubject}</span>
          </div>
        </div>

        {/* Email Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm text-[#e4e7f1]">
          <div className="p-6 rounded-2xl border border-white/10 bg-[#161a2b] shadow-inner space-y-5 font-sans leading-relaxed">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-display text-sm font-bold tracking-wider text-white">🛡️ GHOST GUARDIAN</span>
              <span className="text-xs text-[#c084fc] font-semibold">{currentMonth} Executive Report</span>
            </div>

            <p className="text-base text-white font-medium">Hey {creatorName},</p>
            <p className="text-xs sm:text-sm text-[#8f97b0]">
              Here's your Ghost Guardian report for <strong className="text-white">{currentMonth}</strong>:
            </p>

            {/* Core KPI Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="p-3 rounded-xl border border-white/5 bg-[#0d0f17]/70 text-center">
                <span className="text-[10px] uppercase font-bold text-[#8f97b0] block">⏱️ Time Saved</span>
                <span className="text-xl font-display font-bold text-[#4de1dc] block mt-1">{hours} hrs</span>
                <span className="text-[10px] text-[#34d399] font-medium">${value.toLocaleString()} value</span>
              </div>

              <div className="p-3 rounded-xl border border-white/5 bg-[#0d0f17]/70 text-center">
                <span className="text-[10px] uppercase font-bold text-[#8f97b0] block">💬 Handled</span>
                <span className="text-xl font-display font-bold text-white block mt-1">{totalHandled}</span>
                <span className="text-[10px] text-[#8f97b0]">Comments</span>
              </div>

              <div className="p-3 rounded-xl border border-white/5 bg-[#0d0f17]/70 text-center">
                <span className="text-[10px] uppercase font-bold text-[#8f97b0] block">🛡️ Shielded</span>
                <span className="text-xl font-display font-bold text-[#818cf8] block mt-1">{threatsBlocked}</span>
                <span className="text-[10px] text-[#8f97b0]">Hostile blocked</span>
              </div>

              <div className="p-3 rounded-xl border border-white/5 bg-[#0d0f17]/70 text-center">
                <span className="text-[10px] uppercase font-bold text-[#8f97b0] block">🤍 Human</span>
                <span className="text-xl font-display font-bold text-[#c084fc] block mt-1">{humanMoments}</span>
                <span className="text-[10px] text-[#8f97b0]">Preserved</span>
              </div>
            </div>

            {/* Top Insights */}
            <div className="p-4 rounded-xl border border-white/5 bg-[#0d0f17]/60 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8f97b0]">Top Insights:</h4>
              <ul className="space-y-2 text-xs text-[#e4e7f1]">
                <li className="flex items-start gap-2">
                  <span className="text-[#4de1dc] font-bold">•</span>
                  <span>
                    Your audience is asking about <strong className="text-white">{topTopic.topic}</strong> ({topTopic.mentions} mentions, <span className="text-[#34d399]">+{topTopic.delta}% growth</span>)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#34d399] font-bold">•</span>
                  <span>
                    Community health score: <strong className="text-white">96/100</strong> (<span className="text-[#34d399]">up 4 points</span>)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#c084fc] font-bold">•</span>
                  <span>
                    Most active commenter: <strong className="text-white">{topMember.displayName}</strong> ({topMember.interactions || 42} comments)
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-[#8f97b0]">— Ghost Guardian</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="text-[11px] text-[#4de1dc] underline cursor-pointer inline-flex items-center gap-1"
                >
                  <FileDown size={12} /> Download Full Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#141829] flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-[#8f97b0]">Generated on the 1st of every calendar month.</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleDownload} className="gap-1.5">
              <FileDown size={14} /> Export Report
            </Button>
            <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5">
              {copied ? <Check size={14} className="text-[#34d399]" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy Text'}
            </Button>
            <Button size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
