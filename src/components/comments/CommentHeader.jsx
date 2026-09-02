import React from 'react';
import { Heart, MessageSquare, Flame, Sparkles, UserCheck } from 'lucide-react';
import {
  Chip,
  ClassificationChip,
  HumanMomentChip,
  PriorityChip,
  RiskChip,
  RuleSignalChip,
} from '../guardian/atoms';
import { getCommentPriority, isHumanMoment } from './CommentPriority';

export default function CommentHeader({ comment, commenter, video }) {
  const isHuman = isHumanMoment(comment);
  const priority = getCommentPriority(comment);
  const timeString = new Date(comment.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      {/* Left: Author identity & context */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`size-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden transition-colors ${
            isHuman
              ? 'bg-[#FF007A]/15 text-[#FF007A] border border-[#FF007A]/30 shadow-[0_0_12px_rgba(255,0,122,0.25)]'
              : 'bg-[#0a0a0a] border border-white/10 text-[#0A00FF]'
          }`}
        >
          {comment.authorAvatar ? (
            <img src={comment.authorAvatar} alt="" className="size-full object-cover" />
          ) : (
            (commenter?.displayName?.[0] || comment.author?.[0] || '?').toUpperCase()
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-white truncate">
              {commenter?.displayName || comment.author || 'Community Member'}
            </span>
            <span className="text-xs text-[#a0a0a0] font-mono">
              {commenter?.handle || comment.authorHandle || (comment.platform === 'youtube' ? 'YouTube' : '')}
            </span>
            {commenter?.category === 'returning' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#0A00FF]/10 px-2 py-0.5 text-[10px] font-medium text-[#0A00FF] border border-[#0A00FF]/25">
                <UserCheck size={10} /> Returning ({commenter.episodesParticipated || 0} eps)
              </span>
            )}
            {comment.platform === 'youtube' && !commenter && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FF1400]/10 px-2 py-0.5 text-[10px] font-medium text-[#FF2A00] border border-[#FF1400]/25">
                YouTube Live
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[#8f97b0] mt-0.5">
            <span>{timeString}</span>
            {video && (
              <span className="truncate max-w-[200px] sm:max-w-xs" title={video.title}>
                · on <span className="text-[#e4e7f1]">{video.title}</span>
              </span>
            )}
            {comment.likes > 0 && (
              <span className="inline-flex items-center gap-1 text-[#e4e7f1]">
                · 👍 {comment.likes.toLocaleString()}
              </span>
            )}
            {comment.replies > 0 && (
              <span className="inline-flex items-center gap-1 text-[#8f97b0]">
                · 💬 {comment.replies} replies
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Semantic signals & metadata */}
      <div className="flex flex-wrap items-center gap-1.5">
        {isHuman && <HumanMomentChip />}
        <ClassificationChip value={comment.classification} />
        <RiskChip risk={comment.risk} />
        <RuleSignalChip signal={comment.ruleSignal} />
      </div>
    </div>
  );
}
