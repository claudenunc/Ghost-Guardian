/**
 * Ghost Guardian — Time Saved Analytics & Value Engine
 * Calculates hours and dollar value saved by Ghost Guardian automation,
 * shielding, strategic silence, and routine drafting.
 */

import { isHumanMoment, isShieldVault, isSilenceRecommended } from '../../components/comments/CommentPriority.js';

export const TIME_SAVED_RATES = Object.freeze({
  SPAM_FILTERED_MINUTES: 1,      // Reading + deciding to ignore spam/scam
  ROUTINE_REPLY_MINUTES: 4,      // Reading + drafting in voice + posting
  HOSTILE_SHIELDED_MINUTES: 20,  // Reading + emotional processing + deciding
  STRATEGIC_SILENCE_MINUTES: 5,  // Reading + deciding not to reward troll bait
});

/**
 * Standard baseline aggregate for 30-day monthly creator report
 */
export const DEFAULT_MONTHLY_STATS = Object.freeze({
  spamFilteredCount: 847,
  routineRepliesCount: 234,
  hostileShieldedCount: 23,
  strategicSilenceCount: 156,
  humanMomentsPreservedCount: 18,
  // Direct monthly category hours as specified in design breakdown:
  spamHours: 12,
  routineHours: 15,
  hostileHours: 8,
  silenceHours: 12,
  totalHours: 47,
});

/**
 * Calculates time saved from a list of comments and their triage states.
 * 
 * @param {Array} comments - List of comments
 * @param {Object} commentStates - Dictionary of commentId -> commentState
 * @param {number} hourlyRate - Creator's hourly rate (default $50/hr)
 * @param {Object} [options] - Additional calculation options
 * @param {boolean} [options.useMonthlyProjection=false] - Whether to use 30-day monthly baseline
 * @param {number} [options.monthlyMultiplier=1] - Multiplier for monthly projections
 * @returns {Object} Structured TimeSaved result
 */
export function calculateTimeSaved(comments = [], commentStates = {}, hourlyRate = 50, options = {}) {
  const rate = Math.max(1, Number(hourlyRate) || 50);

  if (options.useMonthlyProjection) {
    const multiplier = Number(options.monthlyMultiplier) || 1;
    const spamCount = Math.round(DEFAULT_MONTHLY_STATS.spamFilteredCount * multiplier);
    const routineCount = Math.round(DEFAULT_MONTHLY_STATS.routineRepliesCount * multiplier);
    const hostileCount = Math.round(DEFAULT_MONTHLY_STATS.hostileShieldedCount * multiplier);
    const silenceCount = Math.round(DEFAULT_MONTHLY_STATS.strategicSilenceCount * multiplier);
    const humanMomentsCount = Math.round(DEFAULT_MONTHLY_STATS.humanMomentsPreservedCount * multiplier);

    const spamHours = Math.round(DEFAULT_MONTHLY_STATS.spamHours * multiplier);
    const routineHours = Math.round(DEFAULT_MONTHLY_STATS.routineHours * multiplier);
    const hostileHours = Math.round(DEFAULT_MONTHLY_STATS.hostileHours * multiplier);
    const silenceHours = Math.round(DEFAULT_MONTHLY_STATS.silenceHours * multiplier);

    const totalHours = Math.round(DEFAULT_MONTHLY_STATS.totalHours * multiplier);
    const totalMinutes = totalHours * 60;
    const dollarValue = Math.round(totalHours * rate);

    return {
      totalHours,
      totalMinutes,
      dollarValue,
      hourlyRate: rate,
      isProjected: true,
      periodLabel: 'this month',
      periodStartDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      periodEndDate: new Date().toISOString(),
      breakdown: {
        spamFiltered: {
          key: 'spamFiltered',
          count: spamCount,
          minutesSavedPerComment: TIME_SAVED_RATES.SPAM_FILTERED_MINUTES,
          minutesSaved: spamHours * 60,
          hoursSaved: spamHours,
          label: 'Spam filtered',
          icon: '🗑️',
          display: `${spamCount} comments isolated from your feed`,
          whatCounts: 'Comments classified as SPAM or SCAM',
        },
        routineReplies: {
          key: 'routineReplies',
          count: routineCount,
          minutesSavedPerComment: TIME_SAVED_RATES.ROUTINE_REPLY_MINUTES,
          minutesSaved: routineHours * 60,
          hoursSaved: routineHours,
          label: 'Routine replies drafted',
          icon: '🤖',
          display: `${routineCount} comments acknowledged in your voice`,
          whatCounts: 'Comments classified as PRAISE, simple QUESTIONS, or HUMOR that were approved',
        },
        hostileShielded: {
          key: 'hostileShielded',
          count: hostileCount,
          minutesSavedPerComment: TIME_SAVED_RATES.HOSTILE_SHIELDED_MINUTES,
          minutesSaved: hostileHours * 60,
          hoursSaved: hostileHours,
          label: 'Hostile shielded',
          icon: '🛡️',
          display: `${hostileCount} comments concealed in Shield Vault`,
          whatCounts: 'Comments classified as TROLLING, HARASSMENT, or HATE',
        },
        strategicSilence: {
          key: 'strategicSilence',
          count: silenceCount,
          minutesSavedPerComment: TIME_SAVED_RATES.STRATEGIC_SILENCE_MINUTES,
          minutesSaved: silenceHours * 60,
          hoursSaved: silenceHours,
          label: 'Strategic silence',
          icon: '🤐',
          display: `${silenceCount} comments left unanswered (smart move)`,
          whatCounts: 'Comments where Ghost Guardian recommended silence (low-value trolling)',
        },
        humanMomentsPreserved: {
          key: 'humanMomentsPreserved',
          count: humanMomentsCount,
          minutesSavedPerComment: 0,
          minutesSaved: 0,
          hoursSaved: 0,
          label: 'Human moments protected',
          icon: '🤍',
          display: `${humanMomentsCount} moments preserved for your authentic voice`,
          whatCounts: 'Comments flagged as HUMAN_MOMENT (emotional disclosures)',
        },
      },
    };
  }

  // Live workspace triage computation
  const breakdown = {
    spamFiltered: {
      key: 'spamFiltered',
      count: 0,
      minutesSavedPerComment: TIME_SAVED_RATES.SPAM_FILTERED_MINUTES,
      label: 'Spam filtered',
      icon: '🗑️',
      whatCounts: 'Comments classified as SPAM or SCAM',
    },
    routineReplies: {
      key: 'routineReplies',
      count: 0,
      minutesSavedPerComment: TIME_SAVED_RATES.ROUTINE_REPLY_MINUTES,
      label: 'Routine replies drafted',
      icon: '🤖',
      whatCounts: 'Comments classified as PRAISE, simple QUESTIONS, or HUMOR that were approved',
    },
    hostileShielded: {
      key: 'hostileShielded',
      count: 0,
      minutesSavedPerComment: TIME_SAVED_RATES.HOSTILE_SHIELDED_MINUTES,
      label: 'Hostile shielded',
      icon: '🛡️',
      whatCounts: 'Comments classified as TROLLING, HARASSMENT, or HATE',
    },
    strategicSilence: {
      key: 'strategicSilence',
      count: 0,
      minutesSavedPerComment: TIME_SAVED_RATES.STRATEGIC_SILENCE_MINUTES,
      label: 'Strategic silence',
      icon: '🤐',
      whatCounts: 'Comments where Ghost Guardian recommended silence (low-value trolling)',
    },
    humanMomentsPreserved: {
      key: 'humanMomentsPreserved',
      count: 0,
      minutesSavedPerComment: 0,
      label: 'Human moments protected',
      icon: '🤍',
      whatCounts: 'Comments flagged as HUMAN_MOMENT (emotional disclosures)',
    },
  };

  comments.forEach((comment) => {
    const state = commentStates[comment.id] || { status: 'pending' };
    const classification = (comment.classification || '').toUpperCase();
    const isProtected = isShieldVault(comment);
    const isSilence = isSilenceRecommended(comment) || state.status === 'silenced';

    if (isHumanMoment(comment) || comment.isHumanMoment) {
      breakdown.humanMomentsPreserved.count++;
    }

    if (classification === 'SPAM' || classification === 'SCAM') {
      breakdown.spamFiltered.count++;
      return;
    }

    if (classification === 'THREAT' || classification === 'HARASSMENT' || classification === 'HATE' || isProtected) {
      breakdown.hostileShielded.count++;
      return;
    }

    if (isSilence || (classification === 'TROLLING' && (state.status === 'ignored' || state.status === 'pending'))) {
      breakdown.strategicSilence.count++;
      return;
    }

    if (
      ['PRAISE', 'HUMOR', 'QUESTION', 'GENERAL_COMMENT', 'CONSTRUCTIVE_CRITICISM'].includes(classification) &&
      (state.status === 'approved' || state.status === 'edited' || state.status === 'handled')
    ) {
      breakdown.routineReplies.count++;
      return;
    }

    // If it's general praise/humor pre-handled or drafted
    if (['PRAISE', 'HUMOR'].includes(classification)) {
      if (state.status === 'approved' || state.status === 'edited') {
        breakdown.routineReplies.count++;
      }
    }
  });

  const spamMinutes = breakdown.spamFiltered.count * TIME_SAVED_RATES.SPAM_FILTERED_MINUTES;
  const routineMinutes = breakdown.routineReplies.count * TIME_SAVED_RATES.ROUTINE_REPLY_MINUTES;
  const hostileMinutes = breakdown.hostileShielded.count * TIME_SAVED_RATES.HOSTILE_SHIELDED_MINUTES;
  const silenceMinutes = breakdown.strategicSilence.count * TIME_SAVED_RATES.STRATEGIC_SILENCE_MINUTES;

  const totalMinutes = spamMinutes + routineMinutes + hostileMinutes + silenceMinutes;
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  const dollarValue = Math.round(totalHours * rate);

  return {
    totalHours,
    totalMinutes,
    dollarValue,
    hourlyRate: rate,
    isProjected: false,
    periodLabel: 'workspace session',
    periodStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    periodEndDate: new Date().toISOString(),
    breakdown: {
      spamFiltered: {
        ...breakdown.spamFiltered,
        minutesSaved: spamMinutes,
        hoursSaved: Math.round((spamMinutes / 60) * 10) / 10,
        display: `${breakdown.spamFiltered.count} comments isolated from your feed`,
      },
      routineReplies: {
        ...breakdown.routineReplies,
        minutesSaved: routineMinutes,
        hoursSaved: Math.round((routineMinutes / 60) * 10) / 10,
        display: `${breakdown.routineReplies.count} comments acknowledged in your voice`,
      },
      hostileShielded: {
        ...breakdown.hostileShielded,
        minutesSaved: hostileMinutes,
        hoursSaved: Math.round((hostileMinutes / 60) * 10) / 10,
        display: `${breakdown.hostileShielded.count} comments concealed in Shield Vault`,
      },
      strategicSilence: {
        ...breakdown.strategicSilence,
        minutesSaved: silenceMinutes,
        hoursSaved: Math.round((silenceMinutes / 60) * 10) / 10,
        display: `${breakdown.strategicSilence.count} comments left unanswered (smart move)`,
      },
      humanMomentsPreserved: {
        ...breakdown.humanMomentsPreserved,
        minutesSaved: 0,
        hoursSaved: 0,
        display: `${breakdown.humanMomentsPreserved.count} moments preserved for your authentic voice`,
      },
    },
  };
}

/**
 * Returns formatted social share templates for Twitter/X and LinkedIn.
 */
export function generateSocialShareTemplates({ totalHours = 47, dollarValue = 2350, breakdown = {} } = {}) {
  const trollCount = (breakdown.hostileShielded?.count || 23) + (breakdown.strategicSilence?.count || 156);
  const meaningfulCount = (breakdown.routineReplies?.count || 234) + (breakdown.humanMomentsPreserved?.count || 18);

  const twitter = `Ghost Guardian saved me ${totalHours} hours this month.\n\nThat's $${dollarValue.toLocaleString()} in my time.\n\nAnd I never had to read a single troll comment.\n\nTry it free: ghostguardian.vercel.app`;

  const linkedin = `I let an AI handle my comments for 30 days.\n\nHere's what happened:\n- ${totalHours} hours saved ($${dollarValue.toLocaleString()} in creator time)\n- ${trollCount} troll interactions avoided\n- ${meaningfulCount} meaningful conversations I actually had time for\n\nGhost Guardian isn't a filter. It's a guardian.\n\nghostguardian.vercel.app`;

  return {
    twitter,
    linkedin,
  };
}

/**
 * Generates markdown report content for download / export.
 */
export function generateTimeSavedReport({
  creatorName = 'Alex Chen',
  channelName = 'The Long Signal',
  totalHours = 47,
  dollarValue = 2350,
  hourlyRate = 50,
  breakdown = {},
  periodLabel = 'This Month',
} = {}) {
  const timestamp = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return `# Ghost Guardian — Creator Time Saved & Attention Report
**Creator:** ${creatorName} (${channelName})  
**Date:** ${timestamp}  
**Period:** ${periodLabel}  
**Creator Hourly Valuation:** $${hourlyRate}/hr  

---

## Executive Summary
- **Total Time Saved:** ${totalHours} hours
- **Estimated Attention Value:** $${dollarValue.toLocaleString()} USD
- **Community Health & Safety Status:** Shielded & Active

---

## Value Breakdown

### 1. 🗑️ Spam Filtered
- **Volume:** ${breakdown.spamFiltered?.count || 0} comments isolated from your feed
- **Time Saved:** ~${breakdown.spamFiltered?.hoursSaved || 0} hours (1 min/comment)
- **Impact:** Phishing links, bot spam, and crypto fraud removed before reaching creator attention.

### 2. 🤖 Routine Replies Drafted
- **Volume:** ${breakdown.routineReplies?.count || 0} comments acknowledged in your authentic voice
- **Time Saved:** ~${breakdown.routineReplies?.hoursSaved || 0} hours (4 min/comment)
- **Impact:** Community members received personalized, prompt engagement without manual typing load.

### 3. 🛡️ Hostile Shielded
- **Volume:** ${breakdown.hostileShielded?.count || 0} comments concealed in Shield Vault
- **Time Saved:** ~${breakdown.hostileShielded?.hoursSaved || 0} hours (20 min/comment)
- **Impact:** Severe harassment and personal attacks quarantined, eliminating emotional friction.

### 4. 🤐 Strategic Silence
- **Volume:** ${breakdown.strategicSilence?.count || 0} comments left unanswered (smart move)
- **Time Saved:** ~${breakdown.strategicSilence?.hoursSaved || 0} hours (5 min/comment)
- **Impact:** Low-effort troll bait de-escalated by withholding creator engagement.

### 5. 🤍 Human Moments Protected
- **Volume:** ${breakdown.humanMomentsPreserved?.count || 0} personal disclosures preserved
- **Impact:** Automation was intentionally withheld so the creator could respond with genuine human empathy.

---
*Generated autonomously by Ghost Guardian Copilot.*
`;
}
