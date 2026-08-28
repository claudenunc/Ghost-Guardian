import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  ShieldCheck,
  Ban,
  Lock,
  MessageSquare,
  HelpCircle,
  FileText,
  AlertOctagon,
} from 'lucide-react';
import { Button, Chip, Input, Textarea } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';

const categories = [
  'FAQ',
  'BOUNDARY',
  'PERSONAL_PREFERENCE',
  'CONTENT',
  'EXAMPLE_RESPONSE',
];

export default function VoiceKnowledge() {
  const { voice, updateVoice, knowledge, addKnowledge, removeKnowledge, showToast } =
    useGuardian();

  const [activeTab, setActiveTab] = useState('knowledge'); // 'knowledge' | 'boundaries' | 'phrases'

  const [draft, setDraft] = useState({
    category: 'FAQ',
    title: '',
    body: '',
  });

  const handleAddKnowledge = () => {
    if (!draft.title.trim() || !draft.body.trim()) return;
    addKnowledge({
      category: draft.category,
      title: draft.title,
      body: draft.body,
    });
    setDraft({ category: draft.category, title: '', body: '' });
    showToast('Source material added to Guardian knowledge.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* 3-Way Architectural Tab Switcher */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#141724] border border-white/5 overflow-x-auto">
        {[
          { id: 'knowledge', label: '1. What I Know (Knowledge & Grounding)', icon: BookOpen },
          { id: 'boundaries', label: '2. What I Won’t Say (Hard Boundaries)', icon: Ban },
          { id: 'phrases', label: '3. Phrases & Lexicon (Vocabulary)', icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer border shrink-0 ${
                isActive
                  ? 'bg-[#1e2235] text-[#4de1dc] border-[#4de1dc]/40 shadow-[0_0_15px_rgba(77,225,220,0.15)]'
                  : 'border-transparent text-[#8f97b0] hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: KNOWLEDGE & SOURCE MATERIAL */}
      {activeTab === 'knowledge' && (
        <section className="space-y-4 animate-in fade-in duration-200">
          <div className="ghost-panel p-6 space-y-4">
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">
              Add Grounded Knowledge / Content Transcript
            </h4>

            <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
              <div>
                <label className="text-xs text-[#8f97b0] font-semibold uppercase">Category</label>
                <select
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  className="w-full mt-1.5 rounded-xl border border-white/10 bg-[#0d0f17] px-3 py-2 text-xs text-white focus:border-[#4de1dc] focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-[#8f97b0] font-semibold uppercase">
                  Subject / Topic Key
                </label>
                <Input
                  className="mt-1.5"
                  placeholder="e.g. Ep. 148 position on Panpsychism"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-[#8f97b0] font-semibold uppercase">
                Grounded Excerpt / Approved Policy Phrasing
              </label>
              <Textarea
                rows={3}
                className="mt-1.5"
                placeholder="Paste verbatim transcript excerpt or approved factual answer..."
                value={draft.body}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              />
            </div>

            <Button
              size="sm"
              disabled={!draft.title.trim() || !draft.body.trim()}
              onClick={handleAddKnowledge}
            >
              <Plus size={14} /> Add to Knowledge Library
            </Button>
          </div>

          {/* List of Knowledge Items */}
          <div className="space-y-3">
            {knowledge.map((item) => (
              <div
                key={item.id}
                className="ghost-panel flex items-start justify-between gap-4 p-5"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip variant={item.category === 'BOUNDARY' ? 'attention' : 'guardian'}>
                      {item.category.replace(/_/g, ' ')}
                    </Chip>
                    <span className="text-sm font-semibold text-white">{item.title}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#8f97b0] leading-relaxed pl-1">
                    "{item.body}"
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    removeKnowledge(item.id);
                    showToast('Removed from knowledge base.', 'info');
                  }}
                  className="text-[#8f97b0] hover:text-[#f87171] p-1.5 transition-colors cursor-pointer"
                  title="Delete item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 2: BOUNDARIES & THINGS GUARDIAN WILL NEVER DO */}
      {activeTab === 'boundaries' && (
        <section className="space-y-6 animate-in fade-in duration-200">
          {/* Guardian Commitments Banner */}
          <div className="ghost-panel p-6 border-[#818cf8]/30 bg-gradient-to-r from-[#17192d]/90 to-[#121422]/90 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#818cf8]" />
              <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">
                Things Guardian Will Never Do
              </h4>
            </div>
            <p className="text-xs text-[#8f97b0]">
              Executable constitutional guardrails enforced across all automated and draft generation.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 pt-2 text-xs">
              {[
                'Pretend to be you in deeply personal or vulnerable disclosures',
                'Engage with or validate obvious troll bait and bad-faith comments',
                'Reveal private personal information, location, or contact details',
                'Provide medical, legal, or speculative financial advice',
                'Speak on designated forbidden topics without explicit approval',
                'Override your defined tone boundaries and voice preferences',
              ].map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-3 rounded-xl bg-black/30 border border-white/5"
                >
                  <Lock size={13} className="text-[#818cf8] shrink-0 mt-0.5" />
                  <span className="text-[#e4e7f1]">{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Boundary Inputs */}
          <div className="ghost-panel p-6 space-y-5">
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">
              Configured Topic Boundaries
            </h4>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold tracking-wider text-[#fbbf24] uppercase flex items-center gap-1.5">
                  <AlertOctagon size={14} /> Topics Requiring Human Approval
                </label>
                <p className="text-[11px] text-[#8f97b0] mt-0.5">
                  Guardian will never auto-answer these; always routes to Human Review.
                </p>
                <Input
                  className="mt-2"
                  value={voice.humanApprovalTopics || ''}
                  onChange={(e) => updateVoice({ humanApprovalTopics: e.target.value })}
                  placeholder="e.g. Medical advice, legal questions, specific individuals"
                />
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wider text-[#f87171] uppercase flex items-center gap-1.5">
                  <Ban size={14} /> Never Discuss Under Any Circumstance
                </label>
                <p className="text-[11px] text-[#8f97b0] mt-0.5">
                  Total silence enforced; Guardian will flag and suppress.
                </p>
                <Input
                  className="mt-2"
                  value={voice.neverDiscuss || ''}
                  onChange={(e) => updateVoice({ neverDiscuss: e.target.value })}
                  placeholder="e.g. Home address, personal family matters, financial portfolio"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 3: PHRASES & LEXICON */}
      {activeTab === 'phrases' && (
        <section className="ghost-panel p-6 space-y-6 animate-in fade-in duration-200">
          <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">
            Signature Lexicon & Anti-Cliché Filters
          </h4>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold tracking-wider text-[#4de1dc] uppercase">
                Signature Phrases to Emphasize
              </label>
              <p className="text-[11px] text-[#8f97b0] mt-0.5">
                Authentic conversational idioms that sound like you.
              </p>
              <Input
                className="mt-2"
                value={voice.commonPhrases || ''}
                onChange={(e) => updateVoice({ commonPhrases: e.target.value })}
                placeholder="e.g. 'Fair enough', 'That is the crux', 'The honest answer is'"
              />
            </div>

            <div>
              <label className="text-xs font-semibold tracking-wider text-[#f87171] uppercase">
                Forbidden Corporate Phrases
              </label>
              <p className="text-[11px] text-[#8f97b0] mt-0.5">
                Phrases Guardian is strictly prohibited from uttering.
              </p>
              <Input
                className="mt-2"
                value={voice.forbiddenPhrases || ''}
                onChange={(e) => updateVoice({ forbiddenPhrases: e.target.value })}
                placeholder="e.g. 'Thanks for sharing!', 'Great point!', 'We appreciate your perspective!'"
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
