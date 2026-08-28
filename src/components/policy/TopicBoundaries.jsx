import React, { useState } from 'react';
import {
  Ban,
  Plus,
  Trash2,
  Lock,
  AlertOctagon,
  BookOpen,
} from 'lucide-react';
import { Button, Chip, Input, Switch } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';
import { PolicyAction } from '../../domain/policy/guardianPolicy';

export default function TopicBoundaries() {
  const { policy, updatePolicy, showToast } = useGuardian();

  const [newTopic, setNewTopic] = useState('');
  const [newReason, setNewReason] = useState('');

  const boundaries = policy.topicBoundaries || [];

  const handleToggle = (id) => {
    const updated = boundaries.map((tb) => (tb.id === id ? { ...tb, enabled: !tb.enabled } : tb));
    updatePolicy({ topicBoundaries: updated }, 'Toggled topic boundary');
  };

  const handleDelete = (id) => {
    const updated = boundaries.filter((tb) => tb.id !== id);
    updatePolicy({ topicBoundaries: updated }, 'Removed topic boundary');
    showToast('Topic boundary removed.', 'info');
  };

  const handleAdd = () => {
    if (!newTopic.trim()) return;
    const newBoundary = {
      id: `tb-${Date.now()}`,
      topic: newTopic.trim(),
      reason: newReason.trim() || 'Creator privacy boundary',
      action: PolicyAction.HUMAN_REVIEW,
      enabled: true,
    };
    updatePolicy(
      { topicBoundaries: [...boundaries, newBoundary] },
      `Added topic boundary for "${newTopic.trim()}"`
    );
    setNewTopic('');
    setNewReason('');
    showToast('Topic boundary added.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Introduction banner */}
      <div className="ghost-panel p-6 space-y-4 border-[#fbbf24]/25 bg-gradient-to-r from-[#1c1822]/80 to-[#121422]/90">
        <div className="flex items-center gap-2">
          <Ban size={18} className="text-[#fbbf24]" />
          <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">
            Topics Guardian Should Never Discuss Autonomously
          </h4>
        </div>
        <p className="text-xs text-[#8f97b0] leading-relaxed">
          If an audience comment requests opinions or statements on these subjects, Ghost Guardian is strictly barred from auto-answering and must route directly to Creator Review.
        </p>

        {/* Add new boundary form */}
        <div className="grid gap-3 pt-2 sm:grid-cols-[1fr_1fr_auto]">
          <Input
            placeholder="e.g. 'Medical advice', 'Personal family matters'"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
          />
          <Input
            placeholder="Reason (e.g. 'Professional compliance boundary')"
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
          />
          <Button size="sm" onClick={handleAdd} disabled={!newTopic.trim()}>
            <Plus size={14} /> Add Topic Boundary
          </Button>
        </div>
      </div>

      {/* Active Topic Boundaries List */}
      <div className="space-y-3">
        {boundaries.map((tb) => (
          <div
            key={tb.id}
            className={`ghost-panel p-4 flex items-center justify-between gap-4 transition-all ${
              tb.enabled ? 'border-white/10' : 'border-white/5 opacity-50'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Switch checked={tb.enabled} onChange={() => handleToggle(tb.id)} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{tb.topic}</span>
                  <Chip variant="attention">Forces Creator Review</Chip>
                </div>
                <p className="text-xs text-[#8f97b0] mt-0.5">{tb.reason}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleDelete(tb.id)}
              className="text-[#8f97b0] hover:text-[#f87171] p-1.5 transition-colors cursor-pointer"
              title="Delete boundary"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
