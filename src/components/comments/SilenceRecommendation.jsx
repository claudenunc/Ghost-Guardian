import React, { useState } from 'react';
import {
  VolumeX,
  EyeOff,
  Flag,
  CheckCircle2,
  Edit3,
  RefreshCw,
  X,
  Sparkles,
} from 'lucide-react';
import { Button, Chip, Textarea } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';
import CommentHeader from './CommentHeader';
import CommentReasoning from './CommentReasoning';

const tones = ['calm', 'direct', 'humorous', 'warm'];

export default function SilenceRecommendation({ comment, commenter, video }) {
  const guardian = useGuardian();
  const state = guardian.stateFor(comment.id);
  const [override, setOverride] = useState(false);

  const handleKeepSilent = () => {
    guardian.setStatus(
      comment.id,
      'silenced',
      'Silenced by creator decision',
      'Strategic silence chosen to starve unproductive engagement bait.'
    );
    guardian.showToast('Strategic silence confirmed. Handled.', 'info');
  };

  const handleHide = () => {
    guardian.setStatus(
      comment.id,
      'hidden',
      'Hidden from feed',
      'Low-value comment concealed.'
    );
    guardian.showToast('Comment hidden.', 'info');
  };

  const handleReport = () => {
    guardian.setStatus(
      comment.id,
      'reported',
      'Reported to platform',
      'Spam or trolling pattern logged.'
    );
    guardian.showToast('Reported to platform.', 'success');
  };

  const handleOverridePublish = () => {
    guardian.approve(comment.id);
  };

  return (
    <article className="ghost-panel p-5 sm:p-6 transition-all duration-200">
      {/* Header */}
      <CommentHeader comment={comment} commenter={commenter} video={video} />

      {/* Comment Body */}
      <p className="mt-4 text-sm sm:text-base text-white leading-relaxed font-normal">
        "{comment.text}"
      </p>

      {/* Strategic Silence Card */}
      <div className="mt-4 rounded-xl border border-white/10 bg-[#161a28]/90 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <VolumeX size={16} className="text-[#8f97b0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#e4e7f1]">
            Recommended: Don't Reply
          </span>
        </div>
        <p className="text-xs text-[#8f97b0] leading-relaxed">
          {comment.silenceReason ||
            'This comment appears designed to provoke rather than start a meaningful conversation. Engaging rewards bad-faith behavior and drains creator attention.'}
        </p>
      </div>

      {/* Collapsible Reasoning */}
      <CommentReasoning comment={comment} />

      {/* Status Badges if Handled */}
      {state.status !== 'pending' && (
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-white/5">
          <Chip variant={state.status === 'silenced' ? 'muted' : 'positive'}>
            Status: {state.status}
          </Chip>
          <span className="text-xs text-[#8f97b0]">
            Handled at {new Date(state.updatedAt).toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Silence Actions */}
      {state.status === 'pending' && (
        <div className="mt-5 pt-3 border-t border-white/10 space-y-3">
          {!override ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleKeepSilent}
              >
                <VolumeX size={14} /> Keep Silent
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleHide}
              >
                <EyeOff size={14} /> Hide
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleReport}
              >
                <Flag size={14} /> Report
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setOverride(true)}
              >
                <Edit3 size={14} /> Override Recommendation
              </Button>
            </div>
          ) : (
            <div className="space-y-3 rounded-xl border border-white/10 bg-[#0d0f17]/90 p-4 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#4de1dc]" />
                  Override: Draft Response
                </span>
                <div className="flex items-center gap-1">
                  {tones
                    .filter((t) => comment.drafts?.[t])
                    .map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => guardian.useTone(comment.id, tone)}
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase transition-colors ${
                          state.activeTone === tone
                            ? 'border border-[#4de1dc]/50 bg-[#4de1dc]/20 text-[#4de1dc]'
                            : 'border border-white/10 text-[#8f97b0] hover:text-white'
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  <button
                    onClick={() => setOverride(false)}
                    className="text-xs text-[#8f97b0] hover:text-white ml-2"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              <Textarea
                rows={3}
                value={state.responseText}
                onChange={(e) => guardian.setResponse(comment.id, e.target.value)}
                placeholder="Write or edit reply..."
              />

              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleOverridePublish}>
                    <CheckCircle2 size={14} /> Approve & Send
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => guardian.regenerate(comment.id)}
                  >
                    <RefreshCw size={13} /> Regenerate
                  </Button>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setOverride(false)}>
                  Cancel Override
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
