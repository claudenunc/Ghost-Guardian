import React from 'react';
import { useGuardian } from '../../lib/store';
import { Chip } from '../guardian/atoms';
import CommentHeader from './CommentHeader';
import CommentReasoning from './CommentReasoning';
import ResponseEditor from './ResponseEditor';
import HumanMomentCard from './HumanMomentCard';
import ShieldedComment from './ShieldedComment';
import SilenceRecommendation from './SilenceRecommendation';
import {
  isHumanMoment,
  isShieldVault,
  isSilenceRecommended,
} from './CommentPriority';

export default function CommentCard({ comment }) {
  const guardian = useGuardian();
  const state = guardian.stateFor(comment.id);
  const commenter = guardian.commenters.find((p) => p.id === comment.commenterId);
  const video = guardian.videos.find((v) => v.id === comment.videoId);

  // 1. Signature Human Moment Experience
  if (isHumanMoment(comment)) {
    return <HumanMomentCard comment={comment} commenter={commenter} video={video} />;
  }

  // 2. Signature Shield Vault Experience (Hostile, High-Risk, Threats, Scams)
  if (isShieldVault(comment)) {
    return <ShieldedComment comment={comment} commenter={commenter} video={video} />;
  }

  // 3. Strategic Silence Experience (Trolling, Low-Value Noise)
  if (isSilenceRecommended(comment) && !comment.drafts?.warm) {
    return <SilenceRecommendation comment={comment} commenter={commenter} video={video} />;
  }

  // 4. Standard Progressive Disclosure Card
  return (
    <article className="ghost-panel p-5 sm:p-6 transition-all duration-200">
      {/* 1. Who is speaking? & Why does this matter? */}
      <CommentHeader comment={comment} commenter={commenter} video={video} />

      {/* 2. Comment Body */}
      <p className="mt-4 text-sm sm:text-base text-white leading-relaxed font-normal">
        "{comment.text}"
      </p>

      {/* 3. Why did Guardian make that recommendation? (Collapsible Reasoning) */}
      <CommentReasoning comment={comment} />

      {/* 4. Status Badges if Handled */}
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

      {/* 5. What did Guardian generate & What should creator do? (Response Workspace) */}
      {state.status === 'pending' && (
        <ResponseEditor comment={comment} />
      )}
    </article>
  );
}
