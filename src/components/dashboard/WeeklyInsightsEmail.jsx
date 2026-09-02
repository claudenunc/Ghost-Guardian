import React, { useState } from 'react';
import { Mail, Copy, Check, X, Sparkles, TrendingUp, ExternalLink } from 'lucide-react';
import { Button, Chip } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';

export default function WeeklyInsightsEmail({
  isOpen,
  onClose,
  timeSavedData,
  topQuestions = [],
}) {
  const { creator, showToast } = useGuardian();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const creatorName = creator?.displayName || 'Alex Chen';
  const hours = timeSavedData?.totalHours || 47;
  const value = timeSavedData?.dollarValue || 2350;
  const breakdown = timeSavedData?.breakdown || {};

  const spam = breakdown.spamFiltered || { count: 847, hoursSaved: 12 };
  const routine = breakdown.routineReplies || { count: 234, hoursSaved: 15 };
  const hostile = breakdown.hostileShielded || { count: 23, hoursSaved: 8 };
  const silence = breakdown.strategicSilence || { count: 156, hoursSaved: 12 };

  const questions = topQuestions.length > 0 ? topQuestions.slice(0, 3) : [
    { question: 'Will you do a full episode on panpsychism?', mentions: 83, trend: '+41% growth' },
    { question: 'What would count as evidence of understanding in an LLM?', mentions: 42, trend: '+120% growth' },
    { question: 'What did you mean around the 42-minute mark?', mentions: 19, trend: '+18% growth' },
  ];

  const emailSubject = `You saved ${hours} hours this week. Here's how.`;

  const emailPlainText = `Subject: ${emailSubject}

Hey ${creatorName},

Ghost Guardian saved you ${hours} hours this week. That's $${value.toLocaleString()} in your time.

Here's the breakdown:

🗑️ Spam filtered: ${spam.count} comments (~${spam.hoursSaved} hours saved)
🤖 Routine replies: ${routine.count} comments (~${routine.hoursSaved} hours saved)
🛡️ Hostile shielded: ${hostile.count} comments (~${hostile.hoursSaved} hours saved)
🤐 Strategic silence: ${silence.count} comments (~${silence.hoursSaved} hours saved)

Top things your audience asked about:
${questions.map((q, i) => `${i + 1}. "${q.question}" — ${q.mentions} mentions (${q.trend})`).join('\n')}

[View Full Report] [See Content Opportunities]

— Ghost Guardian`;

  const handleCopy = () => {
    navigator.clipboard.writeText(emailPlainText);
    setCopied(true);
    showToast('Weekly email template copied to clipboard.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-[#4de1dc]/30 bg-[#0f121d] shadow-[0_0_50px_rgba(77,225,220,0.15)] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141829]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#4de1dc]/10 text-[#4de1dc]">
              <Mail size={18} />
            </div>
            <div>
              <h2 className="font-display text-base text-white font-bold">Weekly Insights Email Preview</h2>
              <p className="text-xs text-[#8f97b0]">Automated weekly creator digest sent directly to your inbox</p>
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

        {/* Email Header Metadata */}
        <div className="px-6 py-3 border-b border-white/5 bg-[#121522] text-xs space-y-1">
          <div className="flex items-center gap-2 text-[#8f97b0]">
            <span className="font-semibold text-white">To:</span> {creatorName} &lt;alex@thesignal.fm&gt;
          </div>
          <div className="flex items-center gap-2 text-[#8f97b0]">
            <span className="font-semibold text-white">Subject:</span>
            <span className="text-[#4de1dc] font-medium">{emailSubject}</span>
          </div>
        </div>

        {/* Email Body Preview */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm text-[#e4e7f1]">
          <div className="p-6 rounded-2xl border border-white/10 bg-[#161a2b] shadow-inner space-y-5 font-sans leading-relaxed">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-display text-sm font-bold tracking-wider text-white">🛡️ GHOST GUARDIAN</span>
              <span className="text-xs text-[#8f97b0]">Weekly Digest</span>
            </div>

            <p className="text-base text-white font-medium">Hey {creatorName},</p>

            <div className="p-4 rounded-xl border border-[#4de1dc]/30 bg-[#4de1dc]/5 text-white">
              <p className="text-base">
                Ghost Guardian saved you <strong className="text-[#4de1dc] font-bold">{hours} hours</strong> this week.
                That's <strong className="text-[#34d399] font-bold">${value.toLocaleString()}</strong> in your time.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8f97b0]">Here's the breakdown:</h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0d0f17]/60 border border-white/5">
                  <div className="flex items-center gap-2">
                    <span>🗑️</span>
                    <span className="text-white font-medium">Spam filtered:</span>
                    <span className="text-[#8f97b0]">{spam.count} comments</span>
                  </div>
                  <span className="text-[#4de1dc] font-mono font-semibold">~{spam.hoursSaved} hrs saved</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0d0f17]/60 border border-white/5">
                  <div className="flex items-center gap-2">
                    <span>🤖</span>
                    <span className="text-white font-medium">Routine replies:</span>
                    <span className="text-[#8f97b0]">{routine.count} comments</span>
                  </div>
                  <span className="text-[#4de1dc] font-mono font-semibold">~{routine.hoursSaved} hrs saved</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0d0f17]/60 border border-white/5">
                  <div className="flex items-center gap-2">
                    <span>🛡️</span>
                    <span className="text-white font-medium">Hostile shielded:</span>
                    <span className="text-[#8f97b0]">{hostile.count} comments</span>
                  </div>
                  <span className="text-[#818cf8] font-mono font-semibold">~{hostile.hoursSaved} hrs saved</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0d0f17]/60 border border-white/5">
                  <div className="flex items-center gap-2">
                    <span>🤐</span>
                    <span className="text-white font-medium">Strategic silence:</span>
                    <span className="text-[#8f97b0]">{silence.count} comments</span>
                  </div>
                  <span className="text-[#34d399] font-mono font-semibold">~{silence.hoursSaved} hrs saved</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8f97b0]">Top things your audience asked about:</h4>
              <div className="space-y-2">
                {questions.map((q, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-white/5 bg-[#0d0f17]/60 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <strong className="text-white block font-medium">
                        {idx + 1}. "{q.question}"
                      </strong>
                      <span className="text-[#8f97b0]">{q.mentions} mentions this week</span>
                    </div>
                    <Chip variant="positive" className="text-[10px] shrink-0">
                      {q.trend}
                    </Chip>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8f97b0]">— Ghost Guardian</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#4de1dc] underline cursor-pointer">View Full Report</span>
                <span className="text-[#8f97b0]">·</span>
                <span className="text-[11px] text-[#4de1dc] underline cursor-pointer">See Content Opportunities</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#141829] flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-[#8f97b0]">Dispatched weekly every Monday at 9:00 AM.</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5">
              {copied ? <Check size={14} className="text-[#34d399]" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy Email Text'}
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
