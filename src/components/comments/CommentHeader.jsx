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
          className={`size-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
            isHuman
              ? 'bg-[#c084fc]/15 text-[#c084fc] border border-[#c084fc]/30 shadow-[0_0_12px_rgba(192,132,252,0.15)]'
              : 'bg-[#1e2235] border border-white/10 text-[#4de1dc]'
          }`}
        >
          {commenter?.displayName?.[0] || '?'}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-white truncate">
              {commenter?.displayName || 'Community Member'}
            </span>
            <span className="text-xs text-[#8f97b0]">{commenter?.handle}</span>
            {commenter?.category === 'returning' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#4de1dc]/10 px-2 py-0.5 text-[10px] font-medium text-[#4de1dc]">
                <UserCheck size={10} /> Returning ({commenter.episodesParticipated || 0} eps)
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
