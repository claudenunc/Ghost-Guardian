import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  ShieldCheck,
  Star,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { Button, Chip, Input } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';

export default function TrustedCommenters() {
  const { policy, updatePolicy, showToast } = useGuardian();

  const [newHandle, setNewHandle] = useState('');
  const [newName, setNewName] = useState('');
  const [newNote, setNewNote] = useState('');

  const trusted = policy.trustedPeople || [];

  const handleDelete = (handle) => {
    const updated = trusted.filter((tp) => tp.handle !== handle);
    updatePolicy({ trustedPeople: updated }, `Removed ${handle} from trusted contributors`);
    showToast(`Removed ${handle} from trusted contributors.`, 'info');
  };

  const handleAdd = () => {
    if (!newHandle.trim()) return;
    const formattedHandle = newHandle.startsWith('@') ? newHandle.trim() : `@${newHandle.trim()}`;
    const newPerson = {
      handle: formattedHandle,
      displayName: newName.trim() || formattedHandle,
      note: newNote.trim() || 'Designated trusted community contributor',
      alwaysSurface: true,
    };
    updatePolicy(
      { trustedPeople: [...trusted, newPerson] },
      `Added ${formattedHandle} to trusted contributors`
    );
    setNewHandle('');
    setNewName('');
    setNewNote('');
    showToast(`Added ${formattedHandle} to trusted contributors.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Introduction banner */}
      <div className="ghost-panel p-6 space-y-4 border-[#34d399]/25 bg-gradient-to-r from-[#131e1c]/80 to-[#121422]/90">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-[#34d399]" />
          <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">
            Trusted Contributors & VIP Roster
          </h4>
        </div>
        <p className="text-xs text-[#8f97b0] leading-relaxed">
          Designate collaborators, moderators, and frequent thoughtful contributors whose comments are prioritized.
        </p>

        {/* Absolute Safety Guarantee Box */}
        <div className="rounded-xl border border-[#818cf8]/30 bg-black/40 p-3.5 flex items-start gap-2.5 text-xs text-[#e4e7f1]">
          <Lock size={14} className="text-[#818cf8] shrink-0 mt-0.5" />
          <span>
            <strong>Constitutional Precedence:</strong> Safety policies always supersede VIP status. If a trusted contributor's account is compromised or posts a physical threat, Guardian will immediately quarantine and escalate it regardless of VIP standing.
          </span>
        </div>

        {/* Add new trusted person form */}
        <div className="grid gap-3 pt-2 sm:grid-cols-[150px_1fr_1fr_auto]">
          <Input
            placeholder="@handle"
            value={newHandle}
            onChange={(e) => setNewHandle(e.target.value)}
          />
          <Input
            placeholder="Display Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Input
            placeholder="Note (e.g. 'Co-host / Moderator')"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <Button size="sm" onClick={handleAdd} disabled={!newHandle.trim()}>
            <Plus size={14} /> Add Trusted
          </Button>
        </div>
      </div>

      {/* Trusted Roster List */}
      <div className="space-y-3">
        {trusted.map((tp) => (
          <div
            key={tp.handle}
            className="ghost-panel p-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-[#34d399]/15 text-[#34d399] flex items-center justify-center font-bold text-xs">
                {tp.displayName?.[0] || '@'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{tp.displayName}</span>
                  <span className="text-xs font-mono text-[#8f97b0]">{tp.handle}</span>
                  <Chip variant="positive">Always Surface</Chip>
                </div>
                <p className="text-xs text-[#8f97b0] mt-0.5">{tp.note}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleDelete(tp.handle)}
              className="text-[#8f97b0] hover:text-[#f87171] p-1.5 transition-colors cursor-pointer"
              title="Remove trusted status"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
