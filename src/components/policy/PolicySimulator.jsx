import React, { useState } from 'react';
import {
  Sparkles,
  Shield,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { Button, Chip, ClassificationChip } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';
import { processWithRules } from '../../domain/guardian/ruleBasedGuardianProvider';
import { evaluateCommentPolicy } from '../../domain/policy/guardianPolicy';

const sampleComments = [
  { text: "You clearly have no idea what you're talking about, absolute clown.", label: 'Trolling Bait' },
  { text: "I disagree with your premise around 42:00 because physics models structural dynamics, not ontology.", label: 'Constructive Disagreement' },
  { text: "I'm going to find where you live and make you pay.", label: 'Threat / Safety Hazard' },
  { text: "Your podcast helped me through the hardest week of my life.", label: 'Human Moment Disclosure' },
  { text: "Can you give us your home address or private phone number?", label: 'Protected Boundary' },
  { text: "Free crypto giveaway in my bio! Click here: http://bit.ly/scam", label: 'Spam Promotion' },
];

export default function PolicySimulator() {
  const { policy, showToast } = useGuardian();
  const [input, setInput] = useState('');
  const [authorHandle, setAuthorHandle] = useState('');
  const [result, setResult] = useState(null);

  const handleSimulate = (customText, customHandle) => {
    const textToEvaluate = customText !== undefined ? customText : input;
    const handleToUse = customHandle !== undefined ? customHandle : authorHandle;
    if (!textToEvaluate.trim()) return;

    const evaluation = processWithRules(
      { text: textToEvaluate },
      { policy, authorHandle: handleToUse }
    );

    setResult(evaluation);
  };

  return (
    <section className="ghost-panel p-6 sm:p-8 space-y-6 border-[#4de1dc]/30 bg-gradient-to-r from-[#141829]/95 via-[#131726]/95 to-[#1c1830]/95">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#4de1dc]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#4de1dc]">
              Live Policy Simulator
            </span>
          </div>
          <h3 className="font-display text-lg text-white mt-1">
            "What Will Happen When Someone Says This?"
          </h3>
          <p className="text-xs text-[#8f97b0] mt-0.5">
            Test any phrase to inspect the deterministic decision, matched rules, and precedence ladder.
          </p>
        </div>
        <Chip variant="guardian">Interactive Execution</Chip>
      </div>

      {/* Inputs */}
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
          <div>
            <label htmlFor="simulated-comment-text" className="text-xs font-semibold text-[#8f97b0] uppercase block mb-1.5">
              Simulated Comment Text
            </label>
            <textarea
              id="simulated-comment-text"
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste or type any incoming community comment..."
              className="w-full rounded-xl border border-white/10 bg-[#0d0f17] p-3 text-xs text-white placeholder:text-[#8f97b0]/50 focus:border-[#4de1dc] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="simulated-author-handle" className="text-xs font-semibold text-[#8f97b0] uppercase block mb-1.5">
              Author Handle (Optional)
            </label>
            <input
              id="simulated-author-handle"
              type="text"
              value={authorHandle}
              onChange={(e) => setAuthorHandle(e.target.value)}
              placeholder="e.g. @elena_v (VIP)"
              className="w-full rounded-xl border border-white/10 bg-[#0d0f17] px-3 py-2.5 text-xs text-white placeholder:text-[#8f97b0]/50 focus:border-[#4de1dc] focus:outline-none"
            />
          </div>
        </div>

        {/* Quick Sample Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-[#8f97b0]">Try sample scenario:</span>
          {sampleComments.map((sc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInput(sc.text);
                handleSimulate(sc.text, authorHandle);
              }}
              className="text-[11px] text-[#8f97b0] hover:text-[#4de1dc] bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              {sc.label}
            </button>
          ))}
        </div>

        <Button
          size="sm"
          disabled={!input.trim()}
          onClick={() => handleSimulate()}
        >
          <Zap size={14} /> Evaluate Comment Policy
        </Button>
      </div>

      {/* Simulator Execution Output */}
      {result && (
        <div className="space-y-4 pt-4 border-t border-white/5 animate-in fade-in duration-200">
          <div className="rounded-xl border border-[#4de1dc]/30 bg-[#0d0f17]/90 p-5 space-y-4">
            {/* Top row: Detected intent & Final Decision */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#8f97b0] uppercase">Detected:</span>
                <ClassificationChip value={result.category} />
                <span className="text-xs text-white font-medium">({result.intent})</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#8f97b0] uppercase">Guardian Decision:</span>
                <Chip
                  variant={
                    result.recommendedAction === 'escalate'
                      ? 'critical'
                      : result.recommendedAction === 'silence'
                      ? 'muted'
                      : result.recommendedAction === 'human_review'
                      ? 'attention'
                      : 'positive'
                  }
                  className="font-bold"
                >
                  {result.recommendedAction.toUpperCase().replace(/_/g, ' ')}
                </Chip>
              </div>
            </div>

            {/* Explanation box */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#4de1dc] block">
                Why Guardian Chose This Action:
              </span>
              <p className="text-xs sm:text-sm text-white font-medium leading-relaxed">
                {result.explanation || result.reasoningSummary}
              </p>
            </div>

            {/* Matched Policies & Precedence Ladder */}
            {result.matchedPolicies && result.matchedPolicies.length > 0 && (
              <div className="pt-3 border-t border-white/5 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8f97b0] block">
                  Matched Policy Precedence Hierarchy:
                </span>
                <div className="space-y-1.5">
                  {result.matchedPolicies.map((mp, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-2.5 rounded-lg bg-black/40 border border-white/5 text-xs"
                    >
                      <span className="font-mono text-[10px] font-bold text-[#4de1dc] px-1.5 py-0.5 rounded bg-[#4de1dc]/10 shrink-0">
                        {mp.ruleType}
                      </span>
                      <div className="min-w-0 flex-1">
                        <strong className="text-white">{mp.ruleName}</strong>
                        <p className="text-[11px] text-[#8f97b0] mt-0.5">{mp.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
