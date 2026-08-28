import React, { useState } from 'react';
import {
  ShieldAlert,
  Eye,
  EyeOff,
  AlertTriangle,
  Flag,
  Lock,
  CheckCircle,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { Button, Chip, Textarea } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';
import CommentHeader from './CommentHeader';
import CommentReasoning from './CommentReasoning';

export default function ShieldedComment({ comment, commenter, video }) {
  const guardian = useGuardian();
  const state = guardian.stateFor(comment.id);
  const [revealed, setRevealed] = useState(false);
  const [overrideMode, setOverrideMode] = useState(false);
  const [overrideText, setOverrideText] = useState(state.responseText || '');

  const isThreat = comment.classification === 'THREAT' || comment.risk === 'critical';
  const categoryLabel = comment.classification.replace(/_/g, ' ');

  const handleEscalate = () => {
    guardian.setStatus(
      comment.id,
      'escalated',
      'Escalated for safety & evidence preservation',
      'Thread locked and logged in security archive.'
    );
    guardian.showToast('Escalated. Incident preserved in safety logs.', 'warning');
  };

  const handleReport = () => {
    guardian.setStatus(
      comment.id,
      'reported',
      'Reported to YouTube platform',
      'Platform abuse ticket logged.'
    );
    guardian.showToast('Reported and queued for platform removal.', 'success');
  };

  const handleHide = () => {
    guardian.setStatus(
      comment.id,
      'hidden',
      'Hidden from public feed',
      'Autonomous concealment from community viewers.'
    );
    guardian.showToast('Comment hidden from community view.', 'info');
  };

  const handleOverridePublish = () => {
    if (!overrideText.trim()) return;
    guardian.setResponse(comment.id, overrideText);
    guardian.approve(comment.id);
    guardian.showToast('Boundary response recorded.', 'info');
  };

  return (
    <article className="ghost-panel p-5 sm:p-6 transition-all duration-200 border-[#f87171]/30 bg-gradient-to-b from-[#1c131a]/80 to-[#121422]/95 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <CommentHeader comment={comment} commenter={commenter} video={video} />

      {/* Protective Shield Banner */}
      <div className="mt-4 rounded-xl border border-[#f87171]/30 bg-[#f87171]/10 p-4 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="text-[#f87171]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#f87171]">
              Shielded Comment · {categoryLabel} Detected
            </span>
          </div>
          <span className="text-[11px] text-[#f87171]/90 uppercase font-bold tracking-wide">
            {comment.risk.toUpperCase()} RISK
          </span>
        </div>

        <p className="text-xs text-white leading-relaxed">
          {comment.escalationReason ||
            `${categoryLabel} signal detected. Ghost Guardian recommends no response to preserve creator focus and safety.`}
        </p>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-[11px] text-[#8f97b0]">
            Content is buffered to protect attention. You retain full access.
          </span>
          <button
            type="button"
            onClick={() => setRevealed(!revealed)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-[#4de1dc] bg-white/5 hover:bg-white/10 px-3 py-1 rounded-lg transition-colors cursor-pointer"
          >
            {revealed ? (
              <>
                <EyeOff size={13} /> Re-shield content
              </>
            ) : (
              <>
                <Eye size={13} /> Reveal comment
              </>
            )}
          </button>
        </div>
      </div>

      {/* Revealed Comment Body or Shield Placeholder */}
      {revealed ? (
        <div className="mt-4 pl-3 border-l-2 border-[#f87171]/60 animate-in fade-in duration-150">
          <p className="text-sm sm:text-base text-white leading-relaxed font-normal">
            "{comment.text}"
          </p>
        </div>
      ) : (
        <div className="mt-3 py-2 px-3 rounded-lg bg-black/30 border border-white/5 text-xs text-[#8f97b0] italic flex items-center gap-2">
          <Lock size={12} className="text-[#8f97b0]" />
          <span>Comment text concealed behind protective buffer. Click "Reveal comment" above to inspect.</span>
        </div>
      )}

      {/* Expandable Reasoning */}
      <CommentReasoning comment={comment} />

      {/* Status Badges if Handled */}
      {state.status !== 'pending' && (
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-white/5">
          <Chip variant="critical">Status: {state.status}</Chip>
          <span className="text-xs text-[#8f97b0]">
            Shield action executed at {new Date(state.updatedAt).toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Protective Action Controls */}
      {state.status === 'pending' && (
        <div className="mt-5 pt-3 border-t border-white/10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {isThreat ? (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleEscalate}
              >
                <AlertTriangle size={14} /> Escalate & Archive
              </Button>
            ) : (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleHide}
              >
                <EyeOff size={14} /> Hide & Shield
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={handleReport}
            >
              <Flag size={14} /> Report Abuse
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                guardian.setStatus(comment.id, 'silenced', 'Silenced without response');
                guardian.showToast('Silenced in Vault.', 'info');
              }}
            >
              Keep Silent
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setOverrideMode(!overrideMode)}
            >
              <MessageSquare size={14} /> Override & Reply
            </Button>
          </div>

          {/* Override Boundary Reply Composer */}
          {overrideMode && (
            <div className="space-y-3 rounded-xl border border-white/10 bg-[#0d0f17]/95 p-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  Override Guardian: Custom Boundary Response
                </span>
                <button
                  onClick={() => setOverrideMode(false)}
                  className="text-xs text-[#8f97b0] hover:text-white"
                >
                  Cancel
                </button>
              </div>
              <Textarea
                rows={2}
                value={overrideText}
                onChange={(e) => setOverrideText(e.target.value)}
                placeholder="Write official boundary reply..."
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" onClick={handleOverridePublish} disabled={!overrideText.trim()}>
                  Publish Boundary
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
