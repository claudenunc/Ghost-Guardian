import React, { useState } from 'react';
import {
  Heart,
  Sparkles,
  MessageCircle,
  Bookmark,
  StickyNote,
  CheckCircle2,
  Lock,
  RefreshCw,
  X,
  Send,
} from 'lucide-react';
import { Button, Chip, Textarea } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';
import CommentHeader from './CommentHeader';
import CommentReasoning from './CommentReasoning';

const tones = ['warm', 'calm', 'direct'];

export default function HumanMomentCard({ comment, commenter, video }) {
  const guardian = useGuardian();
  const state = guardian.stateFor(comment.id);

  const [mode, setMode] = useState('none'); // 'none' | 'personal' | 'draft' | 'note'
  const [personalText, setPersonalText] = useState(state.responseText || '');
  const [privateNote, setPrivateNote] = useState('');
  const [savedForLater, setSavedForLater] = useState(false);

  const handlePersonalReply = () => {
    if (!personalText.trim()) return;
    guardian.setResponse(comment.id, personalText);
    guardian.approve(comment.id);
    guardian.showToast('Personal reply sent with care.', 'success');
  };

  const handleApproveDraft = () => {
    guardian.approve(comment.id);
  };

  const handleMarkHandled = () => {
    guardian.setStatus(
      comment.id,
      'handled',
      'Human Moment held & marked handled',
      'Creator reviewed personal disclosure without public response.'
    );
    guardian.showToast('Marked as handled.', 'info');
  };

  const handleSaveForLater = () => {
    setSavedForLater(true);
    guardian.showToast('Saved to your personal reflections queue.', 'info');
  };

  return (
    <article className="ghost-panel p-5 sm:p-6 transition-all duration-200 border-[#c084fc]/30 bg-gradient-to-b from-[#181a2e]/80 to-[#121422]/95 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <CommentHeader comment={comment} commenter={commenter} video={video} />

      {/* Human Moment Quiet Spotlight Banner */}
      <div className="mt-4 rounded-xl border border-[#c084fc]/25 bg-[#c084fc]/10 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Heart size={16} className="text-[#c084fc]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#c084fc]">
            Human Moment Detected
          </span>
        </div>
        <p className="text-xs text-[#e4e7f1] leading-relaxed">
          {comment.humanMomentContext ||
            'This person may be sharing something personally meaningful, vulnerable, or transformative.'}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-[#c084fc]/90">
          <span>✨ <strong>Consider replying personally.</strong></span>
          <span className="italic text-[#8f97b0]">
            Ghost Guardian will not speak for you here unless you ask.
          </span>
        </div>
      </div>

      {/* Comment Body */}
      <div className="mt-4 pl-3 border-l-2 border-[#c084fc]/50">
        <p className="text-sm sm:text-base text-white leading-relaxed font-normal">
          "{comment.text}"
        </p>
      </div>

      {/* Collapsible Guardian Reasoning */}
      <CommentReasoning comment={comment} />

      {/* Private Note Display if added */}
      {privateNote && (
        <div className="mt-3 rounded-xl border border-white/10 bg-[#0d0f17]/90 p-3 text-xs text-[#e4e7f1] flex items-start gap-2">
          <StickyNote size={14} className="text-[#fbbf24] shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] uppercase font-bold text-[#fbbf24] block">
              Private Creator Note:
            </span>
            <p className="mt-0.5">{privateNote}</p>
          </div>
        </div>
      )}

      {/* Status Badges if Handled */}
      {state.status !== 'pending' && (
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-white/5">
          <Chip variant={state.status === 'rejected' ? 'outline' : 'positive'}>
            Status: {state.status}
          </Chip>
          {state.savedAsExample && <Chip variant="guardian">✨ Saved as Voice Example</Chip>}
          <span className="text-xs text-[#8f97b0]">
            Handled at {new Date(state.updatedAt).toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Action Modes */}
      {state.status === 'pending' && (
        <div className="mt-5 pt-3 border-t border-white/10 space-y-3">
          {/* Primary Human Choices */}
          {mode === 'none' && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                onClick={() => setMode('personal')}
                className="bg-[#c084fc] hover:bg-[#a855f7] text-[#0d0f17] font-semibold"
              >
                <MessageCircle size={14} /> Reply Personally
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMode('draft')}
              >
                <Sparkles size={14} /> Draft something for me
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleSaveForLater}
                disabled={savedForLater}
              >
                <Bookmark size={14} /> {savedForLater ? 'Saved for Later' : 'Save for later'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setMode('note')}
              >
                <StickyNote size={14} /> Add private note
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleMarkHandled}
              >
                <CheckCircle2 size={14} /> Mark handled
              </Button>
            </div>
          )}

          {/* Mode: Personal Reply Workspace */}
          {mode === 'personal' && (
            <div className="space-y-3 rounded-xl border border-[#c084fc]/30 bg-[#0d0f17]/90 p-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <MessageCircle size={14} className="text-[#c084fc]" />
                  Your Personal Human Response
                </span>
                <button
                  onClick={() => setMode('none')}
                  className="text-xs text-[#8f97b0] hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
              <Textarea
                rows={3}
                value={personalText}
                onChange={(e) => setPersonalText(e.target.value)}
                placeholder="Write your genuine personal message..."
                autoFocus
              />
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[11px] text-[#8f97b0]">
                  This reply comes directly from you.
                </span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setMode('none')}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handlePersonalReply}
                    disabled={!personalText.trim()}
                    className="bg-[#c084fc] hover:bg-[#a855f7] text-[#0d0f17]"
                  >
                    <Send size={14} /> Send Personal Reply
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Mode: Draft on Demand */}
          {mode === 'draft' && (
            <div className="space-y-3 rounded-xl border border-white/10 bg-[#0d0f17]/90 p-4 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#4de1dc]" />
                  Calibrated Guardian Draft (On-Demand)
                </span>
                <div className="flex items-center gap-1">
                  {tones.map((tone) => (
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
                    onClick={() => setMode('none')}
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
                placeholder="Adjust draft..."
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleApproveDraft}
                  >
                    <CheckCircle2 size={14} /> Approve Draft
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => guardian.regenerate(comment.id)}
                  >
                    <RefreshCw size={13} /> Regenerate Tone
                  </Button>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setMode('none')}>
                  Close Draft
                </Button>
              </div>
            </div>
          )}

          {/* Mode: Private Note */}
          {mode === 'note' && (
            <div className="space-y-3 rounded-xl border border-white/10 bg-[#0d0f17]/90 p-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <StickyNote size={14} className="text-[#fbbf24]" />
                  Add Private Note for Yourself
                </span>
                <button
                  onClick={() => setMode('none')}
                  className="text-xs text-[#8f97b0] hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
              <Textarea
                rows={2}
                value={privateNote}
                onChange={(e) => setPrivateNote(e.target.value)}
                placeholder="Private context or follow-up reminder..."
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setMode('none')}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
