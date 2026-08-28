import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Shield,
  ShieldAlert,
  CheckCircle2,
  Lock,
  MessageSquare,
  EyeOff,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { Chip, ClassificationChip, RiskChip } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';
import { Category } from '../../domain/guardian/contracts';
import { PolicyAction } from '../../domain/policy/guardianPolicy';

const categories = [
  {
    category: Category.PRAISE,
    label: 'Praise & Positive Reflections',
    risk: 'low',
    defaultCondition: 'Warm acknowledgement in creator voice',
    allowedActions: [PolicyAction.REPLY, PolicyAction.HUMAN_REVIEW, PolicyAction.SILENCE],
  },
  {
    category: Category.QUESTION,
    label: 'Questions & Inquiries',
    risk: 'low',
    defaultCondition: 'Grounded in approved transcripts & FAQs',
    allowedActions: [PolicyAction.REPLY, PolicyAction.HUMAN_REVIEW],
  },
  {
    category: Category.CONSTRUCTIVE_CRITICISM,
    label: 'Constructive Intellectual Critique',
    risk: 'low',
    defaultCondition: 'Substantive feedback for creator attention',
    allowedActions: [PolicyAction.HUMAN_REVIEW, PolicyAction.REPLY],
  },
  {
    category: Category.DISAGREEMENT,
    label: 'Disagreements & Pushback',
    risk: 'low',
    defaultCondition: 'Engage core argument respectfully without defensiveness',
    allowedActions: [PolicyAction.REPLY, PolicyAction.HUMAN_REVIEW, PolicyAction.SILENCE],
  },
  {
    category: Category.HUMOR,
    label: 'Humor & Playful Observations',
    risk: 'low',
    defaultCondition: 'Playful wit without punching down',
    allowedActions: [PolicyAction.REPLY, PolicyAction.SILENCE, PolicyAction.HUMAN_REVIEW],
  },
  {
    category: Category.TROLLING,
    label: 'Trolling & Bad-Faith Bait',
    risk: 'low',
    defaultCondition: 'Repeated provocation without substantive discussion',
    allowedActions: [PolicyAction.SILENCE, PolicyAction.HIDE, PolicyAction.HUMAN_REVIEW],
  },
  {
    category: Category.HARASSMENT,
    label: 'Harassment & Abuse',
    risk: 'high',
    defaultCondition: 'Personal insults or degradation; buffer in Shield Vault',
    allowedActions: [PolicyAction.SHIELD, PolicyAction.HIDE, PolicyAction.ESCALATE],
  },
  {
    category: Category.THREAT,
    label: 'Threats & Physical Safety Hazards',
    risk: 'critical',
    defaultCondition: 'Physical safety or doxxing threats; immediate quarantine & escalation',
    locked: true,
    lockedAction: PolicyAction.ESCALATE,
    allowedActions: [PolicyAction.ESCALATE],
  },
  {
    category: Category.SPAM,
    label: 'Spam & Commercial Promotion',
    risk: 'low',
    defaultCondition: 'Unsolicited promotional links and scams',
    allowedActions: [PolicyAction.HIDE, PolicyAction.SILENCE, PolicyAction.HUMAN_REVIEW],
  },
  {
    category: Category.SCAM,
    label: 'Financial Scams & Phishing',
    risk: 'medium',
    defaultCondition: 'Crypto signals, telegram recruitment, and phishing links',
    allowedActions: [PolicyAction.SHIELD, PolicyAction.HIDE, PolicyAction.ESCALATE],
  },
  {
    category: Category.SENSITIVE,
    label: 'Human Moments & Emotional Disclosures',
    risk: 'medium',
    defaultCondition: 'Personal trauma or vulnerable disclosure; held for authentic human voice',
    locked: true,
    lockedAction: PolicyAction.HUMAN_REVIEW,
    allowedActions: [PolicyAction.HUMAN_REVIEW],
  },
  {
    category: Category.UNKNOWN,
    label: 'Ambiguous & Unknown Categories',
    risk: 'low',
    defaultCondition: 'Uncertain intent; requires creator review',
    allowedActions: [PolicyAction.HUMAN_REVIEW, PolicyAction.SILENCE],
  },
];

export default function PolicyMatrix() {
  const { policy, updatePolicy, showToast } = useGuardian();
  const [expanded, setExpanded] = useState({ [Category.TROLLING]: true, [Category.CONSTRUCTIVE_CRITICISM]: true });

  const toggleExpand = (cat) => {
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleActionChange = (category, action) => {
    const currentConfig = policy.categoryPolicies?.[category] || {};
    const updatedPolicies = {
      ...policy.categoryPolicies,
      [category]: {
        ...currentConfig,
        action,
      },
    };
    updatePolicy(
      { categoryPolicies: updatedPolicies },
      `Updated ${category} policy to ${action.toUpperCase()}`
    );
    showToast(`Policy for ${category} updated to ${action.toUpperCase()}.`, 'success');
  };

  return (
    <div className="space-y-4">
      <div className="ghost-panel divide-y divide-white/5 overflow-hidden">
        {categories.map((item) => {
          const isExp = Boolean(expanded[item.category]);
          const currentAction =
            policy.categoryPolicies?.[item.category]?.action ||
            item.lockedAction ||
            PolicyAction.HUMAN_REVIEW;

          return (
            <div key={item.category} className="p-4 sm:p-5 space-y-3 transition-colors hover:bg-white/[0.01]">
              {/* Top Row: Category, Risk, Current Action & Expand Trigger */}
              <div
                onClick={() => toggleExpand(item.category)}
                className="flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <ClassificationChip value={item.category} />
                  <RiskChip risk={item.risk} />
                  <span className="font-semibold text-xs sm:text-sm text-white">
                    {item.label}
                  </span>
                  {item.locked && (
                    <span className="flex items-center gap-1 text-[10px] text-[#818cf8] bg-[#818cf8]/10 px-2 py-0.5 rounded-md font-semibold">
                      <Lock size={11} /> Locked Guardrail
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono font-bold text-[#4de1dc] uppercase bg-[#4de1dc]/10 px-2.5 py-1 rounded-lg border border-[#4de1dc]/20">
                    Action: {currentAction.replace(/_/g, ' ')}
                  </span>
                  {isExp ? <ChevronUp size={16} className="text-[#8f97b0]" /> : <ChevronDown size={16} className="text-[#8f97b0]" />}
                </div>
              </div>

              {/* Expandable Policy Details */}
              {isExp && (
                <div className="pt-3 border-t border-white/5 space-y-3 text-xs animate-in fade-in duration-150">
                  <p className="text-[#8f97b0] leading-relaxed">
                    <strong>Standard Rule Condition:</strong> {item.defaultCondition}
                  </p>

                  {/* Action Selector */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#8f97b0] block">
                      What Guardian Should Do When This Arrives:
                    </span>

                    {item.locked ? (
                      <p className="text-xs text-[#818cf8] italic">
                        🔒 Hardcoded policy: Safety threats and human moments cannot be automated to protect creator integrity and legal compliance.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {[
                          { id: PolicyAction.REPLY, label: 'Reply in Voice (Draft)', desc: 'Prepare draft response' },
                          { id: PolicyAction.SILENCE, label: 'Stay Silent', desc: 'Recommend no response' },
                          { id: PolicyAction.HIDE, label: 'Hide / Archive', desc: 'Silently archive comment' },
                          { id: PolicyAction.SHIELD, label: 'Shield Vault', desc: 'Conceal in Shield Vault buffer' },
                          { id: PolicyAction.HUMAN_REVIEW, label: 'Ask Me (Human Review)', desc: 'Hold for creator approval' },
                          { id: PolicyAction.ESCALATE, label: 'Escalate', desc: 'Immediate priority review' },
                        ]
                          .filter((act) => item.allowedActions.includes(act.id))
                          .map((act) => (
                            <button
                              key={act.id}
                              type="button"
                              onClick={() => handleActionChange(item.category, act.id)}
                              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer border text-left ${
                                currentAction === act.id
                                  ? 'border-[#4de1dc] bg-[#4de1dc]/15 text-[#4de1dc] shadow-[0_0_12px_rgba(77,225,220,0.2)]'
                                  : 'border-white/10 bg-[#0d0f17] text-[#8f97b0] hover:text-white hover:border-white/20'
                              }`}
                            >
                              <div className="font-bold">{act.label}</div>
                              <div className="text-[10px] opacity-80 mt-0.5">{act.desc}</div>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
