import React, { useState } from 'react';
import {
  ShieldAlert,
  Plus,
  Trash2,
  Lock,
  CheckCircle2,
  Sliders,
  AlertOctagon,
} from 'lucide-react';
import { Button, Chip, Input, Switch } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';
import { PolicyAction } from '../../domain/policy/guardianPolicy';

export default function KeywordShields() {
  const { policy, updatePolicy, showToast } = useGuardian();

  const [newPhrase, setNewPhrase] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newAction, setNewAction] = useState(PolicyAction.SHIELD);

  const shields = policy.keywordShields || [];

  const handleToggle = (id) => {
    const updated = shields.map((ks) => (ks.id === id ? { ...ks, enabled: !ks.enabled } : ks));
    updatePolicy({ keywordShields: updated }, 'Toggled keyword shield');
  };

  const handleDelete = (id) => {
    const updated = shields.filter((ks) => ks.id !== id);
    updatePolicy({ keywordShields: updated }, 'Removed keyword shield');
    showToast('Keyword shield removed.', 'info');
  };

  const handleAdd = () => {
    if (!newPhrase.trim()) return;
    const newShield = {
      id: `ks-${Date.now()}`,
      phrase: newPhrase.trim(),
      reason: newReason.trim() || 'Custom boundary phrase',
      action: newAction,
      caseSensitive: false,
      wholeWord: false,
      enabled: true,
    };
    updatePolicy(
      { keywordShields: [...shields, newShield] },
      `Added keyword shield for "${newPhrase.trim()}"`
    );
    setNewPhrase('');
    setNewReason('');
    showToast('Keyword shield added.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Introduction banner */}
      <div className="ghost-panel p-6 space-y-4 border-[#818cf8]/25 bg-gradient-to-r from-[#15172b]/80 to-[#121422]/90">
        <div className="flex items-center gap-2">
          <ShieldAlert size={18} className="text-[#818cf8]" />
          <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">
            Explicit Phrase Protection Shields
          </h4>
        </div>
        <p className="text-xs text-[#8f97b0] leading-relaxed">
          Designate exact terms, addresses, or private phrases that automatically trigger protective action before AI response generation. Clearly labeled as explicit keyword matching rather than semantic inference.
        </p>

        {/* Add new shield form */}
        <div className="grid gap-3 pt-2 sm:grid-cols-[1fr_1fr_150px_auto]">
          <Input
            placeholder="e.g. 'home address', 'family name'"
            value={newPhrase}
            onChange={(e) => setNewPhrase(e.target.value)}
          />
          <Input
            placeholder="Reason (e.g. 'Private location boundary')"
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
          />
          <select
            value={newAction}
            onChange={(e) => setNewAction(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#0d0f17] px-3 py-2 text-xs text-white focus:border-[#4de1dc] focus:outline-none"
          >
            <option value={PolicyAction.SHIELD}>Shield Vault</option>
            <option value={PolicyAction.HUMAN_REVIEW}>Human Review</option>
            <option value={PolicyAction.SILENCE}>Silence</option>
            <option value={PolicyAction.ESCALATE}>Escalate</option>
          </select>
          <Button size="sm" onClick={handleAdd} disabled={!newPhrase.trim()}>
            <Plus size={14} /> Add Shield
          </Button>
        </div>
      </div>

      {/* Active Keyword Shields List */}
      <div className="space-y-3">
        {shields.map((ks) => (
          <div
            key={ks.id}
            className={`ghost-panel p-4 flex items-center justify-between gap-4 transition-all ${
              ks.enabled ? 'border-white/10' : 'border-white/5 opacity-50'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Switch checked={ks.enabled} onChange={() => handleToggle(ks.id)} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">"{ks.phrase}"</span>
                  <Chip variant={ks.action === PolicyAction.SHIELD ? 'attention' : 'guardian'}>
                    {ks.action.toUpperCase()}
                  </Chip>
                </div>
                <p className="text-xs text-[#8f97b0] mt-0.5">{ks.reason}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleDelete(ks.id)}
              className="text-[#8f97b0] hover:text-[#f87171] p-1.5 transition-colors cursor-pointer"
              title="Delete shield"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
