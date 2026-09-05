import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp, ShieldCheck, Sparkles } from 'lucide-react';
import { RuleSignalChip } from '../guardian/atoms';

export default function CommentReasoning({ comment }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 text-xs text-[#a0a0a0] hover:text-white transition-colors cursor-pointer focus:outline-none"
        aria-expanded={open}
      >
        <Info size={13} className="text-white" />
        <span>Guardian Reasoning & Context</span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {open && (
        <div
          className="mt-2.5 rounded-xl border border-white/15 bg-black p-4 text-xs space-y-3 animate-in fade-in duration-200"
          style={{ backgroundColor: '#000000' }}
        >
          <div>
            <span className="text-[10px] tracking-widest text-[#a0a0a0] uppercase font-bold">
              Detected Underlying Intent:
            </span>
            <p className="text-white mt-0.5 leading-relaxed font-medium">{comment.intent}</p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-widest text-[#a0a0a0] uppercase font-bold">
                Guardian Policy Triggers:
              </span>
              <RuleSignalChip signal={comment.ruleSignal} />
            </div>
            <ul className="mt-1.5 space-y-1.5 text-[#a0a0a0]">
              {comment.reasoning?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-white font-bold shrink-0">•</span>
                  <span className="leading-relaxed text-[#e4e7f1]">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {comment.policyDecision && (
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-[#a0a0a0]">
              <span>Policy Decision:</span>
              <span className="font-mono text-white text-[10px] uppercase">
                {comment.policyDecision.replace(/_/g, ' ')}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
