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
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
      {/* Left: Author identity & context */}
      <div className="flex items-center gap-3 min-w-0 flex-1 w-full">
        <div
          className={`size-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden transition-colors ${
            isHuman
              ? 'bg-white/10 text-white border border-white/20'
              : 'bg-[#0a0a0a] border border-white/10 text-white'
          }`}
        >
          {comment.authorAvatar ? (
            <img src={comment.authorAvatar} alt="" className="size-full object-cover" />
          ) : (
            (commenter?.displayName?.[0] || comment.author?.[0] || '?').toUpperCase()
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0 w-full">
            <span className="text-sm font-bold text-white truncate max-w-[110px] sm:max-w-[200px]">
              {commenter?.displayName || comment.author || 'Community Member'}
            </span>
            <span className="text-xs text-[#a0a0a0] font-mono truncate max-w-[85px] sm:max-w-[150px]">
              {commenter?.handle || comment.authorHandle || (comment.platform === 'youtube' ? 'YouTube' : '')}
            </span>
            {commenter?.category === 'returning' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white border border-white/20 shrink-0">
                <UserCheck size={10} /> Returning ({commenter.episodesParticipated || 0} eps)
              </span>
            )}
            {comment.platform === 'youtube' && !commenter && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FF1400]/10 px-2 py-0.5 text-[10px] font-medium text-[#FF2A00] border border-[#FF1400]/25 shrink-0">
                YouTube Live
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#a0a0a0] mt-0.5 min-w-0 w-full">
            <span className="shrink-0">{timeString}</span>
            {video && (
              <span className="truncate max-w-[110px] sm:max-w-xs" title={video.title}>
                · on <span className="text-white">{video.title}</span>
              </span>
            )}
            {comment.likes > 0 && (
              <span className="inline-flex items-center gap-1 text-white shrink-0">
                · 👍 {comment.likes.toLocaleString()}
              </span>
            )}
            {comment.replies > 0 && (
              <span className="inline-flex items-center gap-1 text-[#a0a0a0] shrink-0">
                · 💬 {comment.replies} replies
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Semantic signals & metadata — wraps below on mobile */}
      <div className="flex flex-wrap items-center gap-1.5 pl-[52px] sm:pl-0 min-w-0">
        {isHuman && <HumanMomentChip />}
        <ClassificationChip value={comment.classification} />
        <RiskChip risk={comment.risk} />
        <RuleSignalChip signal={comment.ruleSignal} />
      </div>
    </div>
  );
}
