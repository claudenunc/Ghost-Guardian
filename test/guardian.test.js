import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { Category, RecommendedAction, RuleSignal } from '../src/domain/guardian/contracts.js';
import { processWithRules } from '../src/domain/guardian/ruleBasedGuardianProvider.js';
import { findDuplicateDrafts, similarityScore } from '../src/domain/guardian/duplicateDetection.js';
import { createDemoRepositories, createUnavailableProductionRepositories } from '../src/data/repositories/demoRepositories.js';
import { createDevelopmentAuthAdapter, createProductionAuthAdapter } from '../src/app/authService.js';
import { createDemoWorkspace } from '../src/fixtures/demoWorkspace.js';
import { ApplicationError } from '../src/app/errors.js';
import {
  getCommentPriority,
  isNeedsYou,
  isShieldVault,
  isHumanMoment,
  isSilenceRecommended,
  PriorityRank,
} from '../src/components/comments/CommentPriority.js';
import {
  calibrateDraft,
  deriveLearnedTraits,
  getVoiceCalibrationStatus,
} from '../src/domain/voice/voiceCalibrator.js';
import {
  getGuardianSummary,
  getNeedsYouItems,
  getHandledSummary,
  getCommunityRelationships,
  getAudienceSignals,
  getAnalyticsSummary,
  SignalType,
  OpportunityStatus,
} from '../src/domain/intelligence/intelligenceEngine.js';
import {
  evaluateCommentPolicy,
  defaultGuardianPolicy,
  policyPresets,
  PolicyAction,
} from '../src/domain/policy/guardianPolicy.js';
import {
  WORKSPACE_SCHEMA_VERSION,
  createWorkspaceExportPayload,
  validateWorkspaceImportPayload,
  assertPayloadIsSanitized,
} from '../src/domain/settings/workspaceContracts.js';
import { encrypt, decrypt } from '../server/security/encryption.js';
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from '../server/security/auth.js';
import { Database } from '../server/db/database.js';
import { YouTubeClient } from '../server/youtube/youtubeClient.js';
import { LlmGuardianProvider } from '../server/llm/llmProvider.js';

describe('Ghost Guardian AI Pipeline & Decision Engine', () => {
  describe('Classification Matrix', () => {
    it('classifies praise correctly', () => {
      const result = processWithRules({ text: 'I love your videos, thank you for making this!' });
      assert.equal(result.category, Category.PRAISE);
      assert.equal(result.risk, 'low');
    });

    it('classifies questions correctly', () => {
      const result = processWithRules({ text: 'Can you explain how this works in practice?' });
      assert.equal(result.category, Category.QUESTION);
      assert.equal(result.recommendedAction, RecommendedAction.DRAFT);
    });

    it('classifies constructive criticism correctly', () => {
      const result = processWithRules({ text: 'I usually love the show but you oversimplified this topic.' });
      assert.equal(result.category, Category.CONSTRUCTIVE_CRITICISM);
      assert.equal(result.recommendedAction, RecommendedAction.DRAFT);
    });

    it('classifies disagreement correctly', () => {
      const result = processWithRules({ text: 'I completely disagree with your premise, you are wrong.' });
      assert.equal(result.category, Category.DISAGREEMENT);
      assert.equal(result.recommendedAction, RecommendedAction.DRAFT);
    });

    it('classifies humor correctly', () => {
      const result = processWithRules({ text: 'That joke at the end was hilarious lmao 😂' });
      assert.equal(result.category, Category.HUMOR);
      assert.equal(result.sentiment, 'positive');
    });

    it('classifies trolling correctly', () => {
      const result = processWithRules({ text: 'This is the dumbest trash content on YouTube.' });
      assert.equal(result.category, Category.TROLLING);
      assert.equal(result.recommendedAction, RecommendedAction.SILENCE);
    });

    it('classifies harassment and flags for protection', () => {
      const result = processWithRules({ text: 'You are a piece of shit and worthless.' });
      assert.equal(result.category, Category.HARASSMENT);
      assert.equal(result.risk, 'high');
      assert.equal(result.requiresHumanReview, true);
    });

    it('classifies threats with critical risk and immediate escalation', () => {
      const result = processWithRules({ text: 'Someone will find where you live and hurt you.' });
      assert.equal(result.category, Category.THREAT);
      assert.equal(result.risk, 'critical');
      assert.equal(result.recommendedAction, RecommendedAction.ESCALATE);
      assert.equal(result.requiresHumanReview, true);
      assert.equal(result.draft, null);
    });

    it('classifies spam and recommends silence', () => {
      const result = processWithRules({ text: 'Click my link for free money and giveaway prizes!' });
      assert.equal(result.category, Category.SPAM);
      assert.equal(result.recommendedAction, RecommendedAction.SILENCE);
      assert.equal(result.requiresHumanReview, false);
    });

    it('classifies scams and flags for review', () => {
      const result = processWithRules({ text: 'DM me on telegram for guaranteed returns crypto opportunity' });
      assert.equal(result.category, Category.SCAM);
      assert.equal(result.requiresHumanReview, true);
    });

    it('identifies unknown categories gracefully', () => {
      const result = processWithRules({ text: '12345 abcde' });
      assert.equal(result.category, Category.UNKNOWN);
      assert.equal(result.ruleSignal, RuleSignal.NEEDS_REVIEW);
    });
  });

  describe('Human Moment Foundation', () => {
    it('flags emotionally sensitive comments without auto-response by default', () => {
      const result = processWithRules({ text: 'After years of pain and depression, this helped me find the child inside.' });
      assert.equal(result.category, Category.SENSITIVE);
      assert.equal(result.signals.humanMoment, true);
      assert.equal(result.requiresHumanReview, true);
      assert.equal(result.recommendedAction, RecommendedAction.HUMAN_REVIEW);
      assert.equal(result.policyDecision, 'creator_review_required');
      assert.match(result.reasoningSummary, /personal distress/i);
    });
  });

  describe('Duplicate Detection', () => {
    it('calculates text token similarity accurately', () => {
      const s1 = similarityScore('Thank you for this thoughtful question!', 'Thank you for this great question!');
      assert.ok(s1 > 0.5);

      const s2 = similarityScore('Completely different sentence structure', 'Quantum physics and panpsychism');
      assert.equal(s2, 0);
    });

    it('identifies repeated draft replies', () => {
      const recent = [
        'Glad the explanation landed! What part hit you hardest?',
        'Two years is a long time to stay with the show.',
      ];
      const match = findDuplicateDrafts('Glad the explanation landed! What part hit you hardest?', recent);
      assert.equal(match.isDuplicate, true);
      assert.ok(match.matches.length > 0);
    });
  });

  describe('Data Access Repositories', () => {
    it('serves fixture data cleanly in demo environment', () => {
      const workspace = createDemoWorkspace();
      const repos = createDemoRepositories(workspace);
      assert.equal(repos.environment, 'demo');
      assert.equal(repos.creator.get().id, 'demo-creator');
      assert.ok(repos.comments.list().length > 0);
      assert.ok(repos.videos.list().length > 0);
    });

    it('throws when accessing unconfigured production repositories', () => {
      const repos = createUnavailableProductionRepositories();
      assert.equal(repos.environment, 'production');
      assert.throws(() => repos.creator.get(), /Production repositories are not configured/);
      assert.throws(() => repos.comments.list(), /Production repositories are not configured/);
    });
  });

  describe('Authentication Boundaries', () => {
    it('provides an isolated demo session for development', () => {
      const memoryStorage = {
        data: {},
        getItem(k) { return this.data[k] || null; },
        setItem(k, v) { this.data[k] = v; },
        removeItem(k) { delete this.data[k]; },
      };
      const auth = createDevelopmentAuthAdapter({ storage: memoryStorage });
      assert.equal(auth.getSession(), null);
      
      const session = auth.signIn();
      assert.equal(session.user.id, 'demo-creator');
      assert.equal(auth.getCurrentUser().name, 'Alex Chen');

      auth.signOut();
      assert.equal(auth.getSession(), null);
    });

    it('strictly denies unauthorized access in production adapter', () => {
      const auth = createProductionAuthAdapter();
      assert.equal(auth.getSession(), null);
      assert.throws(() => auth.signIn(), (err) => err instanceof ApplicationError);
      assert.throws(() => auth.requireAuth(), (err) => err instanceof ApplicationError);
    });
  });

  describe('Pass 2: The Guardian Experience & Inbox Intelligence', () => {
    it('identifies Human Moments and isolates them from automated publishing', () => {
      const humanComment = {
        id: 'm11',
        text: 'I have been through years of pain and watching this made me feel something.',
        classification: Category.SENSITIVE,
        signals: { humanMoment: true },
        requiresHumanReview: true,
      };

      assert.equal(isHumanMoment(humanComment), true);
      assert.equal(getCommentPriority(humanComment), PriorityRank.HUMAN_MOMENT);
      assert.equal(isNeedsYou(humanComment, { status: 'pending' }), true);
      assert.equal(humanComment.requiresHumanReview, true);
    });

    it('identifies Shield Vault hostile material requiring emotional buffer', () => {
      const threatComment = {
        id: 'm10',
        text: 'Someone needs to find where this guy lives',
        classification: Category.THREAT,
        risk: 'critical',
      };
      const harassmentComment = {
        id: 'm9',
        text: 'You are a piece of shit',
        classification: Category.HARASSMENT,
        risk: 'high',
      };

      assert.equal(isShieldVault(threatComment), true);
      assert.equal(isShieldVault(harassmentComment), true);
      assert.equal(getCommentPriority(threatComment), PriorityRank.CRITICAL_SAFETY);
    });

    it('identifies strategic silence for low-value trolling and spam', () => {
      const trollComment = {
        id: 'm8',
        text: 'This is dumb trash content',
        classification: Category.TROLLING,
        recommendedAction: RecommendedAction.SILENCE,
        strategy: 'silence',
      };
      const spamComment = {
        id: 'm12',
        text: 'FREE CRYPTO MONEY',
        classification: Category.SPAM,
        recommendedAction: RecommendedAction.SILENCE,
        strategy: 'silence',
      };

      assert.equal(isSilenceRecommended(trollComment), true);
      assert.equal(isSilenceRecommended(spamComment), true);
      assert.equal(getCommentPriority(trollComment), PriorityRank.TROLLING_BAIT);
      assert.equal(getCommentPriority(spamComment), PriorityRank.SPAM_ABUSE);
    });

    it('prioritizes Human Moments and Safety above routine conversation', () => {
      const humanMoment = { id: '1', classification: Category.SENSITIVE, signals: { humanMoment: true } };
      const safetyIssue = { id: '2', classification: Category.THREAT, risk: 'critical' };
      const question = { id: '3', classification: Category.QUESTION };
      const praise = { id: '4', classification: Category.PRAISE };

      const p1 = getCommentPriority(humanMoment);
      const p2 = getCommentPriority(safetyIssue);
      const p3 = getCommentPriority(question);
      const p4 = getCommentPriority(praise);

      assert.ok(p1 < p3, 'Human Moment has higher priority than question');
      assert.ok(p2 < p3, 'Critical safety has higher priority than question');
      assert.ok(p3 < p4, 'Question has higher priority than routine praise');
    });

    it('verifies demo workspace fixture contains all Pass 2 archetypes', () => {
      const workspace = createDemoWorkspace();
      const comments = workspace.comments;

      const hasHumanMoment = comments.some((c) => c.signals?.humanMoment);
      const hasThreat = comments.some((c) => c.classification === Category.THREAT);
      const hasHarassment = comments.some((c) => c.classification === Category.HARASSMENT);
      const hasTrolling = comments.some((c) => c.classification === Category.TROLLING);
      const hasSpam = comments.some((c) => c.classification === Category.SPAM);
      const hasScam = comments.some((c) => c.classification === Category.SCAM);
      const hasConstructive = comments.some((c) => c.classification === Category.CONSTRUCTIVE_CRITICISM);
      const hasPreHandled = Object.values(workspace.commentStates).some((s) => s.status !== 'pending');

      assert.ok(hasHumanMoment, 'Fixture must include Human Moment');
      assert.ok(hasThreat, 'Fixture must include Threat');
      assert.ok(hasHarassment, 'Fixture must include Harassment');
      assert.ok(hasTrolling, 'Fixture must include Trolling');
      assert.ok(hasSpam, 'Fixture must include Spam');
      assert.ok(hasScam, 'Fixture must include Scam');
      assert.ok(hasConstructive, 'Fixture must include Constructive Criticism');
      assert.ok(hasPreHandled, 'Fixture must include pre-handled comments for Handled Lane');
    });
  });

  describe('Pass 3: Creator Voice Calibration & Sentinel Command Center', () => {
    const comment = 'Can you explain what you meant about where explanation bottoms out?';

    it('modifies phrasing when Warmth is calibrated', () => {
      const highWarmth = calibrateDraft({
        commentText: comment,
        voice: { warmth: 90, directness: 50, formality: 40, humor: 30 },
        activeTone: 'warm',
      });
      const lowWarmth = calibrateDraft({
        commentText: comment,
        voice: { warmth: 20, directness: 50, formality: 40, humor: 30 },
        activeTone: 'warm',
      });

      assert.notEqual(highWarmth, lowWarmth);
      assert.match(highWarmth, /glad you asked/i);
    });

    it('modifies phrasing when Directness is calibrated', () => {
      const highDirectness = calibrateDraft({
        commentText: comment,
        voice: { warmth: 50, directness: 95, formality: 40, humor: 30 },
        activeTone: 'direct',
      });
      const lowDirectness = calibrateDraft({
        commentText: comment,
        voice: { warmth: 50, directness: 30, formality: 40, humor: 30 },
        activeTone: 'direct',
      });

      assert.notEqual(highDirectness, lowDirectness);
      assert.match(highDirectness, /Direct answer/i);
    });

    it('modifies vocabulary and syntax when Formality is calibrated', () => {
      const highFormality = calibrateDraft({
        commentText: comment,
        voice: { warmth: 50, directness: 50, formality: 90, humor: 30 },
        activeTone: 'calm',
      });
      const lowFormality = calibrateDraft({
        commentText: comment,
        voice: { warmth: 50, directness: 50, formality: 20, humor: 30 },
        activeTone: 'calm',
      });

      assert.notEqual(highFormality, lowFormality);
      assert.match(highFormality, /Regarding this specific distinction|structural dynamics|ontological/i);
    });

    it('modifies phrasing when Humor is calibrated', () => {
      const highHumor = calibrateDraft({
        commentText: comment,
        voice: { warmth: 50, directness: 50, formality: 40, humor: 90 },
        activeTone: 'humorous',
      });

      assert.match(highHumor, /Great question, mildly dangerous topic|rabbit hole|Two years of this/i);
    });

    it('respects response length preferences', () => {
      const conciseDraft = calibrateDraft({
        commentText: comment,
        voice: { warmth: 70, directness: 70, responseLength: 'concise', preferShort: true },
        activeTone: 'warm',
      });
      const detailedDraft = calibrateDraft({
        commentText: comment,
        voice: { warmth: 70, directness: 70, responseLength: 'detailed', preferShort: false },
        activeTone: 'warm',
      });

      assert.ok(detailedDraft.length > conciseDraft.length, 'Detailed draft should contain follow-up context');
    });

    it('respects emoji preference', () => {
      const withEmoji = calibrateDraft({
        commentText: comment,
        voice: { usesEmojis: true },
        activeTone: 'warm',
      });
      const withoutEmoji = calibrateDraft({
        commentText: comment,
        voice: { usesEmojis: false },
        activeTone: 'warm',
      });

      assert.ok(/✨|☕|🎯|😂/.test(withEmoji));
      assert.ok(!/✨|☕|🎯|😂/.test(withoutEmoji));
    });

    it('derives qualitative calibration status honestly without fake percentages', () => {
      assert.equal(getVoiceCalibrationStatus(0, 0), 'Calibrating');
      assert.equal(getVoiceCalibrationStatus(1, 2), 'Established');
      assert.equal(getVoiceCalibrationStatus(3, 3), 'Well calibrated');
    });

    it('derives learned traits truthfully from creator configuration', () => {
      const traits = deriveLearnedTraits({
        formality: 30,
        warmth: 85,
        directness: 80,
        asksQuestions: true,
        forbiddenPhrases: 'Thanks for sharing!',
        usesEmojis: false,
      }, 2);

      assert.ok(traits.length >= 5);
      assert.ok(traits.some((t) => t.title.includes('conversational')));
      assert.ok(traits.some((t) => t.title.includes('warmth')));
      assert.ok(traits.some((t) => t.title.includes('punchy')));
      assert.ok(traits.some((t) => t.title.includes('custom voice examples')));
    });
  });

  describe('Pass 5: Creator Intelligence Layer & Impact Analytics', () => {
    const workspace = createDemoWorkspace();

    it('generates dynamic Guardian summary narrative from actual state', () => {
      const summary = getGuardianSummary(workspace.comments, workspace.commentStates);

      assert.equal(summary.totalArrived, workspace.comments.length);
      assert.ok(summary.handledCount >= 2, 'Should count pre-handled comments in demo');
      assert.ok(summary.narrative.includes('While you were away'));
      assert.ok(summary.narrative.includes(`${summary.totalArrived} comments arrived`));
      assert.ok(summary.narrative.includes(`${summary.handledCount} routine interactions`));
    });

    it('ranks and filters Needs You items according to hierarchy', () => {
      const items = getNeedsYouItems(workspace.comments, workspace.commentStates);
      assert.ok(items.length > 0);

      // Verify that Human Moments or Threats appear at the top
      const firstItem = items[0];
      assert.ok(
        firstItem.signals?.humanMoment ||
        firstItem.classification === Category.THREAT ||
        firstItem.risk === 'critical' ||
        firstItem.risk === 'high',
        'Top item should be high priority'
      );
    });

    it('calculates Handled metrics and attention protected accurately', () => {
      const handled = getHandledSummary(workspace.comments, workspace.commentStates);

      assert.ok(handled.totalHandled >= 2);
      assert.ok(handled.estimatedMinutesSaved >= 6);
      assert.ok(handled.spamCount >= 1);
    });

    it('categorizes community members into privacy-first relationship intelligence', () => {
      const relationships = getCommunityRelationships(workspace.commenters, workspace.comments);

      assert.ok(relationships.supporters.length >= 1, 'Should have supporters');
      assert.ok(relationships.returning.length >= 1, 'Should have returning voices');
      assert.ok(relationships.constructiveCritics.length >= 1, 'Should have constructive critics');
      assert.ok(relationships.humanConnections.length >= 1, 'Should have human connections');
      assert.ok(relationships.boundaryRisks.length >= 1, 'Should have boundary risks');

      // Verify privacy principle: no psychological speculation
      relationships.boundaryRisks.forEach((member) => {
        assert.ok(!member.evidenceNote.includes('unstable'), 'Must avoid speculative psychological claims');
      });
    });

    it('extracts audience signals, question clusters, and constructive feedback', () => {
      const signals = getAudienceSignals(workspace.comments, workspace.questionClusters, workspace.topics);

      assert.ok(signals.topQuestions.length >= 2, 'Should cluster top questions');
      assert.ok(signals.humanSignals.length >= 1, 'Should extract human emotional signals');
      assert.ok(signals.constructiveSignals.length >= 1, 'Should extract constructive critique');
      assert.ok(signals.emergingTopics.length >= 2, 'Should extract emerging topics');
    });

    it('calculates analytics summary without fabricated metrics', () => {
      const analytics = getAnalyticsSummary(workspace.comments, workspace.commentStates, workspace.activity);

      assert.equal(analytics.commentsAnalyzed, workspace.comments.length);
      assert.ok(analytics.estimatedMinutesSaved > 0);
      assert.ok(analytics.voiceAlignmentRate >= 0 && analytics.voiceAlignmentRate <= 100);
      assert.ok(analytics.decisions.length >= 4);
    });

    it('validates Content Opportunity domain enum constants', () => {
      assert.equal(SignalType.QUESTION, 'QUESTION');
      assert.equal(SignalType.CONSTRUCTIVE_CRITICISM, 'CONSTRUCTIVE_CRITICISM');
      assert.equal(SignalType.HUMAN_SIGNAL, 'HUMAN_SIGNAL');
      assert.equal(OpportunityStatus.SAVED, 'saved');
      assert.equal(OpportunityStatus.EXPLORING, 'exploring');
      assert.equal(OpportunityStatus.PLANNED, 'planned');
    });
  });

  describe('Pass 6: Guardian Policy Engine & Boundary Precedence', () => {
    it('evaluates category policy correctly (Trolling -> Silence by default)', () => {
      const evaluation = evaluateCommentPolicy(
        "You clearly have no idea what you're talking about, absolute clown.",
        Category.TROLLING
      );

      assert.equal(evaluation.finalAction, RecommendedAction.SILENCE);
      assert.equal(evaluation.strategy, 'silence');
      assert.match(evaluation.explanation, /silence/i);
    });

    it('enforces absolute safety precedence over VIP/trusted contributor status', () => {
      // Scenario: A trusted VIP commenter posts a physical safety threat
      const threatFromVIP = evaluateCommentPolicy(
        "I'm going to find where you live and hurt you.",
        Category.THREAT,
        {
          authorHandle: '@elena_v', // Trusted contributor
          policy: defaultGuardianPolicy,
        }
      );

      assert.equal(threatFromVIP.finalAction, RecommendedAction.ESCALATE);
      assert.equal(threatFromVIP.requiresHumanReview, true);
      assert.equal(threatFromVIP.precedence[0], 'SAFETY');
      assert.match(threatFromVIP.explanation, /Safety override/i);
    });

    it('enforces creator topic boundaries requiring human review', () => {
      const topicViolation = evaluateCommentPolicy(
        'Can you share details about your medical history and prescription?',
        Category.QUESTION,
        { policy: defaultGuardianPolicy }
      );

      assert.equal(topicViolation.finalAction, RecommendedAction.HUMAN_REVIEW);
      assert.equal(topicViolation.requiresHumanReview, true);
      assert.equal(topicViolation.precedence[0], 'TOPIC_BOUNDARY');
      assert.match(topicViolation.explanation, /protected creator topic boundary/i);
    });

    it('enforces custom keyword shields', () => {
      const customPolicy = {
        ...defaultGuardianPolicy,
        keywordShields: [
          { id: 'ks-test', phrase: 'secret project beta', caseSensitive: false, wholeWord: false, action: PolicyAction.SHIELD, reason: 'Confidential code name', enabled: true },
        ],
      };

      const matchedShield = evaluateCommentPolicy(
        'Is the secret project beta releasing tomorrow?',
        Category.QUESTION,
        { policy: customPolicy }
      );

      assert.equal(matchedShield.finalAction, RecommendedAction.HUMAN_REVIEW);
      assert.equal(matchedShield.precedence[0], 'KEYWORD_SHIELD');
      assert.match(matchedShield.explanation, /secret project beta/i);
    });

    it('updates decisions dynamically when category policy changes (Simulator consistency)', () => {
      const trollComment = "This is the dumbest video on the internet.";

      // 1. Under default policy: Silence
      const defaultEval = processWithRules({ text: trollComment }, { policy: defaultGuardianPolicy });
      assert.equal(defaultEval.recommendedAction, RecommendedAction.SILENCE);

      // 2. Under custom policy where Trolling -> Human Review
      const reviewTrollingPolicy = {
        ...defaultGuardianPolicy,
        categoryPolicies: {
          ...defaultGuardianPolicy.categoryPolicies,
          [Category.TROLLING]: { action: PolicyAction.HUMAN_REVIEW, condition: 'Review all', uncertainAction: PolicyAction.HUMAN_REVIEW },
        },
      };
      const customEval = processWithRules({ text: trollComment }, { policy: reviewTrollingPolicy });
      assert.equal(customEval.recommendedAction, RecommendedAction.HUMAN_REVIEW);
      assert.equal(customEval.requiresHumanReview, true);
    });

    it('validates policy presets populate valid structured configurations', () => {
      assert.ok(policyPresets.gentle);
      assert.ok(policyPresets.balanced);
      assert.ok(policyPresets.strong_shield);

      assert.equal(policyPresets.strong_shield.settings.mode, 'guardian');
      assert.equal(policyPresets.strong_shield.settings.categoryPolicies[Category.TROLLING].action, PolicyAction.SILENCE);
      assert.equal(policyPresets.gentle.settings.categoryPolicies[Category.QUESTION].action, PolicyAction.HUMAN_REVIEW);
    });

    it('guarantees Human Moments cannot be auto-published by default', () => {
      const humanMoment = evaluateCommentPolicy(
        'Your video saved me during a deeply dark depression.',
        Category.SENSITIVE
      );

      assert.equal(humanMoment.finalAction, RecommendedAction.HUMAN_REVIEW);
      assert.equal(humanMoment.requiresHumanReview, true);
    });
  });

  describe('Pass 7: Workspace Portability, Export/Import & Operational Contracts', () => {
    it('creates a schema-compliant export payload without transient state or credentials', () => {
      const workspace = createDemoWorkspace();
      const stateWithTransient = {
        ...workspace,
        session: { authenticated: true, mode: 'demo' },
        toast: { message: 'Hello', type: 'info' },
      };

      const payload = createWorkspaceExportPayload(stateWithTransient);

      assert.equal(payload.schemaVersion, WORKSPACE_SCHEMA_VERSION);
      assert.ok(payload.exportedAt);
      assert.ok(payload.workspace.creator);
      assert.ok(payload.workspace.settings);
      assert.ok(payload.workspace.voice);
      assert.ok(payload.workspace.policy);

      // Verify transient UI state is excluded
      assert.equal(payload.session, undefined);
      assert.equal(payload.toast, undefined);

      // Security check
      assert.doesNotThrow(() => assertPayloadIsSanitized(payload));
    });

    it('rejects forbidden credentials in export payloads', () => {
      const dirtyPayload = {
        schemaVersion: '1.0',
        workspace: {
          apiKey: 'AIzaSySecretKey12345',
        },
      };

      assert.throws(
        () => assertPayloadIsSanitized(dirtyPayload),
        /Security Violation/i
      );
    });

    it('validates a correct workspace import payload and generates accurate preview', () => {
      const workspace = createDemoWorkspace();
      const payload = createWorkspaceExportPayload(workspace);
      const jsonStr = JSON.stringify(payload);

      const validation = validateWorkspaceImportPayload(jsonStr);

      assert.equal(validation.valid, true);
      assert.ok(validation.preview);
      assert.equal(validation.preview.creatorName, workspace.creator.displayName);
      assert.equal(validation.preview.voiceIncluded, true);
      assert.equal(validation.preview.policyIncluded, true);
      assert.equal(validation.preview.activityCount, workspace.activity.length);
      assert.equal(validation.preview.opportunitiesCount, workspace.contentOpportunities.length);
    });

    it('rejects malformed, empty, or incompatible import files', () => {
      // Empty input
      const emptyCheck = validateWorkspaceImportPayload('');
      assert.equal(emptyCheck.valid, false);
      assert.match(emptyCheck.error, /Empty backup/i);

      // Malformed JSON string
      const malformedCheck = validateWorkspaceImportPayload('{ broken json:');
      assert.equal(malformedCheck.valid, false);
      assert.match(malformedCheck.error, /Malformed JSON/i);

      // Incompatible schema version
      const incompatibleCheck = validateWorkspaceImportPayload(
        JSON.stringify({ schemaVersion: '99.0', workspace: {} })
      );
      assert.equal(incompatibleCheck.valid, false);
      assert.match(incompatibleCheck.error, /Unsupported schema version/i);

      // Missing required workspace blocks
      const missingBlocksCheck = validateWorkspaceImportPayload(
        JSON.stringify({ schemaVersion: '1.0', workspace: {} })
      );
      assert.equal(missingBlocksCheck.valid, false);
      assert.match(missingBlocksCheck.error, /Incomplete backup/i);
    });
  });

  describe('Pass 8: Production Activation Infrastructure & Security Boundaries', () => {
    it('encrypts and decrypts OAuth tokens and sensitive credentials accurately (AES-256-GCM)', () => {
      const secretToken = 'ya29.a0AfH6SMA-super-confidential-google-token';
      const encrypted = encrypt(secretToken);

      assert.notEqual(encrypted, secretToken);
      assert.ok(encrypted.includes(':'));

      const decrypted = decrypt(encrypted);
      assert.equal(decrypted, secretToken);

      // Tampered ciphertext returns null
      const tampered = encrypted.slice(0, -4) + 'abcd';
      assert.equal(decrypt(tampered), null);
    });

    it('hashes passwords and creates/verifies HMAC-SHA256 signed session tokens', () => {
      const password = 'CreatorSecretPassword2026!';
      const hash = hashPassword(password);

      assert.ok(hash.includes(':'));
      assert.equal(verifyPassword(password, hash), true);
      assert.equal(verifyPassword('WrongPassword', hash), false);

      const session = createSessionToken({ userId: 'u-123', workspaceId: 'ws-456' });
      assert.ok(session.includes('.'));

      const verified = verifySessionToken(session);
      assert.equal(verified.userId, 'u-123');
      assert.equal(verified.workspaceId, 'ws-456');

      // Tampered signature fails
      const tamperedSession = session.slice(0, -4) + 'xxxx';
      assert.equal(verifySessionToken(tamperedSession), null);
    });

    it('manages persistent relational data models with strict workspace isolation', () => {
      const testDb = new Database(':memory:');
      const user = testDb.createUser({ email: 'alex@example.com', passwordHash: 'hash', name: 'Alex' });
      const ws = testDb.createWorkspace({ userId: user.id, name: 'Alex Workspace' });

      // Save creator profile
      const profile = testDb.saveCreatorProfile(ws.id, {
        displayName: 'Alex Chen',
        channelName: 'The Long Signal',
      });
      assert.equal(profile.displayName, 'Alex Chen');

      // Save platform connection
      testDb.savePlatformConnection(ws.id, {
        platform: 'youtube',
        status: 'connected',
        channelTitle: 'The Long Signal',
      });
      const conn = testDb.getPlatformConnection(ws.id, 'youtube');
      assert.equal(conn.status, 'connected');

      // Verify workspace isolation: Another workspace cannot see this connection
      const otherConn = testDb.getPlatformConnection('other-ws-id', 'youtube');
      assert.equal(otherConn, null);
    });

    it('normalizes raw YouTube CommentThread API objects into standard Comment models', () => {
      const client = new YouTubeClient({ clientId: 'test-id', clientSecret: 'test-secret' });
      const rawThread = {
        id: 'UgyXYZ12345',
        snippet: {
          videoId: 'v123',
          totalReplyCount: 3,
          canReply: true,
          topLevelComment: {
            snippet: {
              authorDisplayName: 'Marcus Brody',
              authorChannelUrl: 'http://youtube.com/user/marcus',
              authorProfileImageUrl: 'https://avatar.url/1.png',
              textDisplay: 'Great discussion on panpsychism!',
              publishedAt: '2026-08-28T04:00:00.000Z',
              likeCount: 42,
            },
          },
        },
      };

      const normalized = client.normalizeYouTubeCommentThread(rawThread);
      assert.equal(normalized.id, 'yt-UgyXYZ12345');
      assert.equal(normalized.platform, 'youtube');
      assert.equal(normalized.author, 'Marcus Brody');
      assert.equal(normalized.text, 'Great discussion on panpsychism!');
      assert.equal(normalized.likeCount, 42);
    });

    it('executes hybrid Guardian intelligence pipeline: pre-checks safety before calling LLM', async () => {
      const provider = new LlmGuardianProvider({ apiKey: 'test-key' });

      // Threat scenario: Must be intercepted by deterministic safety pre-check
      const threatDecision = await provider.processComment({
        comment: { text: "I'm coming to find where you live.", authorHandle: '@hostile' },
        policy: defaultGuardianPolicy,
      });

      assert.equal(threatDecision.recommendedAction, RecommendedAction.ESCALATE);
      assert.equal(threatDecision.requiresHumanReview, true);
      assert.equal(threatDecision.draft, null);
      assert.match(threatDecision.reasoningSummary, /physical safety threat/i);
    });

    it('falls back gracefully to deterministic policy when LLM credentials are not configured', async () => {
      const unconfiguredProvider = new LlmGuardianProvider({ apiKey: '' });
      assert.equal(unconfiguredProvider.isConfigured(), false);

      const decision = await unconfiguredProvider.processComment({
        comment: { text: 'Love this video, keep it up!', draft: 'Thanks for tuning in!' },
        policy: defaultGuardianPolicy,
      });

      assert.equal(decision.category, Category.PRAISE);
      assert.equal(decision.recommendedAction, RecommendedAction.DRAFT);
      assert.equal(decision.llmStatus, 'fallback_deterministic_mode');
    });

    it('enforces fail-closed validation on publishing', () => {
      const policy = defaultGuardianPolicy;

      // Safe draft passes pre-check
      const safeCheck = evaluateCommentPolicy('Thank you for the thoughtful feedback!', Category.PRAISE, { policy });
      assert.equal(safeCheck.finalAction, RecommendedAction.DRAFT);
      assert.equal(safeCheck.policyDecision, 'draft_permitted');

      // Threatening or violating draft is blocked
      const unsafeCheck = evaluateCommentPolicy('I will find you and hurt you', Category.UNKNOWN, { policy });
      assert.equal(unsafeCheck.requiresHumanReview, true);
      assert.equal(unsafeCheck.finalAction, RecommendedAction.ESCALATE);
    });
  });
});

