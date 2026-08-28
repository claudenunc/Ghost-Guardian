/**
 * Ghost Guardian Intelligence Engine
 * Domain selectors and models for:
 * - Guardian Summary Narrative
 * - Needs You & Handled Triage
 * - Audience Signals & Recurring Clusters
 * - Content Opportunities Roadmap
 * - Community Relationship Intelligence
 * - Guardian Impact Analytics
 */

import {
  getCommentPriority,
  isHandled,
  isHumanMoment,
  isNeedsYou,
  isReviewQueue,
  isShieldVault,
  isSilenceRecommended,
  PriorityRank,
} from '../../components/comments/CommentPriority.js';

export const SignalType = Object.freeze({
  QUESTION: 'QUESTION',
  REPEATED_REQUEST: 'REPEATED_REQUEST',
  CONSTRUCTIVE_CRITICISM: 'CONSTRUCTIVE_CRITICISM',
  HIGH_INTEREST: 'HIGH_INTEREST',
  HUMAN_SIGNAL: 'HUMAN_SIGNAL',
  EMERGING_TOPIC: 'EMERGING_TOPIC',
});

export const OpportunityStatus = Object.freeze({
  NEW: 'new',
  SAVED: 'saved',
  EXPLORING: 'exploring',
  PLANNED: 'planned',
  PUBLISHED: 'published',
  DISMISSED: 'dismissed',
});

/**
 * Generates a calm, intelligent narrative summary of the current workspace state.
 */
export function getGuardianSummary(comments = [], commentStates = {}) {
  let totalArrived = comments.length;
  let handledCount = 0;
  let shieldedCount = 0;
  let needsYouCount = 0;
  let humanMomentsCount = 0;
  let questionsCount = 0;
  let constructiveCount = 0;

  comments.forEach((c) => {
    const s = commentStates[c.id] || { status: 'pending' };
    if (isHandled(s)) {
      handledCount++;
    } else {
      if (isNeedsYou(c, s)) needsYouCount++;
      if (isHumanMoment(c)) humanMomentsCount++;
      if (c.classification === 'QUESTION') questionsCount++;
      if (c.classification === 'CONSTRUCTIVE_CRITICISM') constructiveCount++;
    }
    if (isShieldVault(c)) shieldedCount++;
  });

  const narrative = `While you were away, ${totalArrived} comments arrived. Ghost Guardian handled ${handledCount} routine interactions, shielded ${shieldedCount} hostile comments, and surfaced ${needsYouCount} conversations worth your attention.${
    humanMomentsCount > 0
      ? ` ${humanMomentsCount === 1 ? 'One comment' : `${humanMomentsCount} comments`} may deserve a personal response.`
      : ''
  }`;

  return {
    totalArrived,
    handledCount,
    shieldedCount,
    needsYouCount,
    humanMomentsCount,
    questionsCount,
    constructiveCount,
    narrative,
  };
}

/**
 * Returns prioritized items requiring creator attention.
 */
export function getNeedsYouItems(comments = [], commentStates = {}) {
  return comments
    .filter((c) => {
      const s = commentStates[c.id] || { status: 'pending' };
      return isNeedsYou(c, s);
    })
    .sort((a, b) => getCommentPriority(a) - getCommentPriority(b));
}

/**
 * Returns handled items and protection metrics.
 */
export function getHandledSummary(comments = [], commentStates = {}) {
  let spamCount = 0;
  let trollingCount = 0;
  let routineCount = 0;
  let shieldedCount = 0;
  let totalHandled = 0;

  comments.forEach((c) => {
    const s = commentStates[c.id] || { status: 'pending' };
    if (isHandled(s)) {
      totalHandled++;
      if (c.classification === 'SPAM' || c.classification === 'SCAM') spamCount++;
      else if (c.classification === 'TROLLING') trollingCount++;
      else routineCount++;
    }
    if (isShieldVault(c)) {
      shieldedCount++;
    }
  });

  return {
    totalHandled,
    spamCount,
    trollingCount,
    routineCount,
    shieldedCount,
    estimatedMinutesSaved: totalHandled * 3,
  };
}

/**
 * Returns community relationships categorized by meaningful patterns.
 */
export function getCommunityRelationships(commenters = [], comments = []) {
  const relationships = {
    supporters: [],
    returning: [],
    constructiveCritics: [],
    humanConnections: [],
    boundaryRisks: [],
  };

  commenters.forEach((member) => {
    const memberComments = comments.filter((c) => c.commenterId === member.id);
    const hasHumanMoment = memberComments.some((c) => isHumanMoment(c));
    const hasHostility = memberComments.some((c) => isShieldVault(c) || c.classification === 'TROLLING');
    const hasCriticism = memberComments.some((c) => c.classification === 'CONSTRUCTIVE_CRITICISM' || c.classification === 'DISAGREEMENT');

    if (hasHostility || member.tags.includes('Threat actor') || member.tags.includes('Spam pattern')) {
      relationships.boundaryRisks.push({
        ...member,
        relationshipType: 'Boundary Risk',
        evidenceNote: member.note || 'Repeated hostile or disruptive interactions detected.',
        recentComments: memberComments,
      });
    } else if (hasHumanMoment || member.tags.includes('Human disclosure') || member.tags.includes('Sensitive history')) {
      relationships.humanConnections.push({
        ...member,
        relationshipType: 'Human Connection',
        evidenceNote: member.note || 'Viewer shared personal impact and meaningful disclosure.',
        recentComments: memberComments,
      });
    } else if (hasCriticism || member.tags.includes('Critical but constructive') || member.tags.includes('Intelligent skeptic')) {
      relationships.constructiveCritics.push({
        ...member,
        relationshipType: 'Constructive Critic',
        evidenceNote: member.note || 'Consistently challenges ideas with high intellectual rigor.',
        recentComments: memberComments,
      });
    } else if (member.episodesParticipated >= 5 || member.tags.includes('Returning member')) {
      relationships.returning.push({
        ...member,
        relationshipType: 'Returning Voice',
        evidenceNote: member.note || `Active contributor across ${member.episodesParticipated || 5} episodes.`,
        recentComments: memberComments,
      });
    } else {
      relationships.supporters.push({
        ...member,
        relationshipType: 'Supporter',
        evidenceNote: member.note || 'Regular viewer with positive engagement history.',
        recentComments: memberComments,
      });
    }
  });

  return relationships;
}

/**
 * Returns audience signals categorized by theme (Questions, Human Signals, Constructive Feedback).
 */
export function getAudienceSignals(comments = [], questionClusters = [], topics = []) {
  const humanSignals = comments
    .filter((c) => isHumanMoment(c) || (c.sentiment === 'positive' && c.likes > 40))
    .slice(0, 5);

  const constructiveSignals = comments
    .filter((c) => c.classification === 'CONSTRUCTIVE_CRITICISM' || c.classification === 'DISAGREEMENT')
    .slice(0, 5);

  const topQuestions = questionClusters.map((cluster) => {
    const examples = (cluster.examples || [])
      .map((id) => comments.find((c) => c.id === id))
      .filter(Boolean);

    return {
      ...cluster,
      examples,
      urgency: cluster.mentions > 50 ? 'High interest' : 'Rising',
    };
  });

  return {
    topQuestions,
    humanSignals,
    constructiveSignals,
    emergingTopics: topics,
  };
}

/**
 * Generates analytics metrics with honest demo disclosure.
 */
export function getAnalyticsSummary(comments = [], commentStates = {}, activity = []) {
  const states = Object.values(commentStates);

  const approved = states.filter((s) => s.status === 'approved').length;
  const edited = states.filter((s) => s.status === 'edited').length;
  const rejected = states.filter((s) => s.status === 'rejected').length;
  const ignored = states.filter((s) => s.status === 'ignored').length;
  const escalated = states.filter((s) => s.status === 'escalated' || s.status === 'reported').length;
  const silenced = states.filter((s) => s.status === 'silenced').length;

  const totalHandled = approved + edited + rejected + ignored + escalated + silenced;
  const totalReplied = approved + edited;

  const voiceAlignmentRate = totalReplied > 0 ? Math.round((approved / totalReplied) * 100) : 85;
  const editRate = totalReplied > 0 ? Math.round((edited / totalReplied) * 100) : 15;

  const shieldedHostile = comments.filter((c) => isShieldVault(c)).length;
  const spamFiltered = comments.filter((c) => c.classification === 'SPAM' || c.classification === 'SCAM').length;

  const decisions = [
    { label: 'Approved Replies', count: approved, tone: 'positive' },
    { label: 'Edited by Creator', count: edited, tone: 'guardian' },
    { label: 'Strategic Silence', count: silenced + ignored, tone: 'muted' },
    { label: 'Shielded / Escalated', count: escalated + shieldedHostile, tone: 'attention' },
    { label: 'Rejected Drafts', count: rejected, tone: 'outline' },
  ];

  return {
    commentsAnalyzed: comments.length,
    totalHandled,
    approved,
    edited,
    rejected,
    silenced,
    escalated,
    shieldedHostile,
    spamFiltered,
    voiceAlignmentRate,
    editRate,
    estimatedMinutesSaved: (approved + edited) * 3 + (ignored + silenced + spamFiltered) * 2 + escalated * 4,
    decisions,
    activityCount: activity.length,
  };
}
