import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Clock,
  MessageSquare,
  Video,
  Loader2,
} from 'lucide-react';
import { GhostMark, Chip, Button } from '../components/guardian/atoms';
import { useGuardian } from '../lib/store';
import { extractYouTubeVideoId } from '../lib/youtubeUtils';

const STORAGE_KEY = 'ghost-guardian-onboarding-step';

export default function Onboarding() {
  const navigate = useNavigate();
  const {
    completeOnboarding,
    showToast,
    addLearningExample,
    fetchYouTubeComments,
    ingestComments,
    session,
    creator,
  } = useGuardian();

  // Load initial step from localStorage or default to 1
  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = Number(saved);
    return parsed >= 1 && parsed <= 4 ? parsed : 1;
  });

  // Creator identity state
  const [displayName, setDisplayName] = useState(
    session?.user?.user_metadata?.name || creator?.displayName || ''
  );
  const [channelName, setChannelName] = useState(creator?.channelName || '');

  // Step 2 state: Voice examples
  const [examples, setExamples] = useState({
    ex1: "Thanks for watching! Glad that explanation clicked for you.",
    ex2: "That's a fair point. We had to compress that section, but I appreciate the thoughtful feedback.",
    ex3: "Disagreement is always welcome here when there's an actual argument attached. Thanks for tuning in!",
    ex4: '',
    ex5: '',
  });

  // Step 4 state: First video URL import
  const [videoUrl, setVideoUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState('');

  // Save step to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, step.toString());
  }, [step]);

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleSkipToStep = (targetStep) => {
    setStep(targetStep);
  };

  const handleFinish = async (skipImport = false) => {
    const validExamples = [examples.ex1, examples.ex2, examples.ex3, examples.ex4, examples.ex5].filter(Boolean);
    validExamples.forEach((ex) => {
      addLearningExample?.({
        id: `onboarding-ex-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        before: 'Default boilerplate response',
        after: ex,
        source: 'onboarding_calibration',
      });
    });

    const finalName = displayName.trim() || session?.user?.user_metadata?.name || 'Creator';
    const finalChannel = channelName.trim() || 'My YouTube Channel';
    const finalHandle = `@${finalName.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'creator'}`;

    if (!skipImport && videoUrl.trim()) {
      const videoId = extractYouTubeVideoId(videoUrl);
      if (!videoId) {
        setImportError('Please enter a valid YouTube video URL or 11-character video ID.');
        return;
      }

      setIsImporting(true);
      setImportError('');

      try {
        const data = await fetchYouTubeComments({ videoId });
        if (data.error) {
          setImportError(data.error);
          setIsImporting(false);
          return;
        }

        if (Array.isArray(data.comments) && data.comments.length > 0) {
          ingestComments({ comments: data.comments, video: data.video });
          showToast(`Imported ${data.comments.length} comments from YouTube!`, 'success');
        }
      } catch (err) {
        console.warn('Onboarding comment import failed:', err);
      } finally {
        setIsImporting(false);
      }
    }

    completeOnboarding({
      creator: {
        displayName: finalName,
        channelName: finalChannel,
        handle: finalHandle,
      },
      voice: { approvedExamples: validExamples },
      mode: 'copilot',
    });

    localStorage.removeItem(STORAGE_KEY);
    showToast('Guardian activated! Welcome to your protected inbox.', 'success');
    navigate('/app/inbox');
  };

  const handleSkipAll = () => {
    const finalName = session?.user?.user_metadata?.name || creator?.displayName || 'Creator';
    completeOnboarding({
      creator: {
        displayName: finalName,
        channelName: 'My YouTube Channel',
        handle: `@${finalName.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'creator'}`,
      },
      voice: {},
      mode: 'copilot',
    });
    localStorage.removeItem(STORAGE_KEY);
    showToast('Onboarding complete — welcome to your workspace.', 'info');
    navigate('/app');
  };

  return (
    <main className="min-h-screen ghost-aurora text-[#f4f6fb] flex flex-col justify-between selection:bg-[#0200F1]/30 selection:text-white">
      {/* Top Header & Progress Indicator */}
      <header className="px-6 py-5 border-b border-white/5 bg-[#0a0d14]/70 backdrop-blur-md">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <GhostMark className="transition-transform group-hover:scale-105" />
            <span className="font-display text-sm tracking-[0.2em] uppercase text-white font-bold">
              Ghost Guardian
            </span>
          </Link>

          {/* Progress Pill */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-[#8f97b0] hidden sm:inline">
              Step {step} of 4
            </span>
            <div className="w-24 sm:w-36 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[#0200F1] transition-all duration-300 rounded-full"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
            <button
              type="button"
              onClick={handleSkipAll}
              className="text-xs text-[#8f97b0] hover:text-white transition-colors cursor-pointer pl-2"
            >
              Skip to Dashboard →
            </button>
          </div>
        </div>
      </header>

      {/* Main Multi-Step Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl ghost-panel ghost-glow p-6 sm:p-10 border-white/10 bg-gradient-to-br from-[#0a0a0a] via-[#050505] to-[#000000] shadow-2xl relative animate-in fade-in duration-300">
          {/* STEP 1: WELCOME */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Chip variant="guardian" className="gap-1.5">
                  <Clock size={13} /> 60-Second Onboarding
                </Chip>
                <h1 className="font-display text-3xl sm:text-4xl text-white font-bold tracking-tight">
                  Welcome to Ghost Guardian
                </h1>
                <p className="text-sm sm:text-base text-[#8f97b0] leading-relaxed">
                  Let's get your authentic creator voice and community protection configured.
                </p>
              </div>

              {/* Creator Identity Quick Capture */}
              <div className="p-6 rounded-2xl bg-[#050505] border border-white/10 space-y-4 font-sans">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8f97b0]">
                  Your Creator Identity
                </span>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8f97b0] block mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Nathan Michel"
                      className="w-full rounded-xl border border-white/10 bg-[#0d0f17] p-3 text-xs text-white focus:border-[#0200F1] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8f97b0] block mb-1">
                      Channel / Podcast Name
                    </label>
                    <input
                      type="text"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                      placeholder="e.g. My Channel"
                      className="w-full rounded-xl border border-white/10 bg-[#0d0f17] p-3 text-xs text-white focus:border-[#0200F1] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3-Step Overview Card */}
              <div className="p-6 rounded-2xl bg-[#050505] border border-white/10 space-y-4 font-sans">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8f97b0]">
                  How Ghost Guardian Works:
                </span>

                <div className="space-y-3.5">
                  <div className="flex items-center gap-3.5">
                    <div className="size-7 rounded-lg bg-[#0200F1]/20 text-[#0200F1] font-bold text-xs flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div className="text-xs sm:text-sm">
                      <strong className="text-white">Learn your authentic voice</strong>
                      <span className="text-[#8f97b0]"> — calibrates drafts so AI sounds like you</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <div className="size-7 rounded-lg bg-[#00FF66]/20 text-[#00FF66] font-bold text-xs flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div className="text-xs sm:text-sm">
                      <strong className="text-white">Verify platform connection</strong>
                      <span className="text-[#8f97b0]"> — public YouTube comment access ready</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <div className="size-7 rounded-lg bg-[#FF007A]/20 text-[#FF007A] font-bold text-xs flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div className="text-xs sm:text-sm">
                      <strong className="text-white">Paste your first video URL</strong>
                      <span className="text-[#8f97b0]"> — ingest real comments into your inbox</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <Button
                  size="lg"
                  onClick={handleNext}
                  className="w-full sm:w-auto gap-2 justify-center"
                >
                  <span>Let's Begin</span>
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: VOICE CALIBRATION */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0200F1]">
                    Step 2 of 4 · Voice Calibration
                  </span>
                  <span className="text-xs text-[#8f97b0]">~30 seconds</span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl text-white font-bold">
                  Help Ghost Guardian learn your voice
                </h1>
                <p className="text-xs sm:text-sm text-[#8f97b0]">
                  Provide a few sample replies representing how you talk with your audience.
                </p>
              </div>

              {/* Textarea Inputs Grid */}
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#8f97b0] block mb-1">
                    Example 1 (Required)
                  </label>
                  <textarea
                    rows={2}
                    value={examples.ex1}
                    onChange={(e) => setExamples({ ...examples, ex1: e.target.value })}
                    placeholder="A reply showing your natural conversational voice"
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f17] p-3 text-xs text-white focus:border-[#0200F1] focus:outline-none leading-relaxed resize-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#8f97b0] block mb-1">
                    Example 2 (Required)
                  </label>
                  <textarea
                    rows={2}
                    value={examples.ex2}
                    onChange={(e) => setExamples({ ...examples, ex2: e.target.value })}
                    placeholder="How you handle questions or constructive critique"
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f17] p-3 text-xs text-white focus:border-[#0200F1] focus:outline-none leading-relaxed resize-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#8f97b0] block mb-1">
                    Example 3 (Required)
                  </label>
                  <textarea
                    rows={2}
                    value={examples.ex3}
                    onChange={(e) => setExamples({ ...examples, ex3: e.target.value })}
                    placeholder="How you respond to disagreement or welcome a returning viewer"
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f17] p-3 text-xs text-white focus:border-[#0200F1] focus:outline-none leading-relaxed resize-none"
                  />
                </div>
              </div>

              {/* Helper Text */}
              <div className="p-3.5 rounded-xl bg-[#050505] border border-white/10 text-xs text-[#8f97b0] leading-relaxed">
                💡 <strong className="text-white">Don't overthink it.</strong> Ghost Guardian uses these to calibrate warmth, directness, and phrasing so responses never sound corporate.
              </div>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleSkipToStep(3)}
                  className="text-xs text-[#8f97b0] hover:text-white underline cursor-pointer"
                >
                  I'll do this later
                </button>

                <Button size="lg" onClick={handleNext} className="w-full sm:w-auto gap-2 justify-center">
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: PLATFORM CONNECTION */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0200F1]">
                    Step 3 of 4 · Platform Connection
                  </span>
                  <span className="text-xs text-[#8f97b0]">~20 seconds</span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl text-white font-bold">
                  Connect your platform
                </h1>
                <p className="text-xs sm:text-sm text-[#8f97b0]">
                  Ghost Guardian connects with YouTube to protect your attention and draft replies.
                </p>
              </div>

              {/* Connection Cards */}
              <div className="space-y-3">
                <div
                  className="w-full p-4 rounded-2xl border border-[#0200F1] bg-[#0200F1]/10 shadow-[0_0_20px_rgba(2,0,241,0.15)] text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="size-11 rounded-xl bg-[#FF1400]/15 text-[#FF1400] flex items-center justify-center shrink-0 border border-[#FF1400]/30">
                      <Video size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display text-sm font-bold text-white">YouTube Public Access</h4>
                        <Chip variant="positive" className="text-[10px]">Active</Chip>
                      </div>
                      <p className="text-xs text-[#8f97b0] mt-0.5">
                        Import comments from any public video instantly using video URLs.
                      </p>
                    </div>
                  </div>

                  <div className="size-5 rounded-full border border-[#00FF66] bg-[#00FF66] text-black flex items-center justify-center">
                    <CheckCircle2 size={14} />
                  </div>
                </div>

                <div
                  className="w-full p-4 rounded-2xl border border-white/10 bg-[#050505] text-left flex items-center justify-between opacity-80"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="size-11 rounded-xl bg-[#1e2235] text-[#8f97b0] flex items-center justify-center shrink-0">
                      <GhostMark className="size-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display text-sm font-bold text-white">Channel OAuth Connection</h4>
                        <Chip variant="outline" className="text-[10px] text-[#8f97b0]">Coming Soon</Chip>
                      </div>
                      <p className="text-xs text-[#8f97b0] mt-0.5">
                        Direct automated publishing via channel OAuth will be available with the publish release.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Helper note */}
              <p className="text-xs text-[#8f97b0]">
                In the next step, you can paste any public video URL to import comments immediately.
              </p>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleSkipToStep(4)}
                  className="text-xs text-[#8f97b0] hover:text-white underline cursor-pointer"
                >
                  Skip to Next Step
                </button>

                <Button
                  size="lg"
                  onClick={handleNext}
                  className="w-full sm:w-auto gap-2 justify-center"
                >
                  <span>Continue to First Video</span>
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: REAL FIRST VIDEO IMPORT */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00FF66]/15 text-[#00FF66] text-xs font-bold">
                  <ShieldCheck size={14} /> Step 4 of 4 · First Video Import
                </div>
                <h1 className="font-display text-3xl sm:text-4xl text-white font-bold tracking-tight">
                  Paste your first video URL
                </h1>
                <p className="text-sm text-[#8f97b0] leading-relaxed">
                  Enter a YouTube video URL or ID to pull in your comments and preview your first AI-drafted responses.
                </p>
              </div>

              {/* Video URL Input Card */}
              <div className="p-6 rounded-2xl bg-[#050505] border border-white/10 space-y-4 font-sans">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#8f97b0] block mb-1.5">
                    YouTube Video URL or Video ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => {
                        setVideoUrl(e.target.value);
                        setImportError('');
                      }}
                      placeholder="https://www.youtube.com/watch?v=... or 11-char ID"
                      className="flex-1 rounded-xl border border-white/10 bg-[#0d0f17] p-3 text-xs text-white focus:border-[#0200F1] focus:outline-none font-mono"
                    />
                  </div>
                  {importError && (
                    <p className="text-xs text-[#FF1400] mt-1.5 font-medium">
                      {importError}
                    </p>
                  )}
                  <p className="text-[11px] text-[#8f97b0] mt-1.5">
                    Paste any public video link to test Ghost Guardian's classification, human moment detection, and voice drafting.
                  </p>
                </div>
              </div>

              {/* What Happens When You Import */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#050505] border border-white/10 space-y-3">
                <span className="text-[11px] font-mono font-bold tracking-widest text-[#0200F1] uppercase block">
                  How Ghost Guardian Triages
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#0d0f17] border border-white/5 space-y-1">
                    <strong className="text-white block font-display">1. Needs You Lane</strong>
                    <p className="text-[#8f97b0] text-[11px]">Surfaces questions, constructive debate, and comments needing your voice.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0d0f17] border border-white/5 space-y-1">
                    <strong className="text-[#FF007A] block font-display">2. Human Moments</strong>
                    <p className="text-[#8f97b0] text-[11px]">Isolates deep disclosures and gratitude for direct personal handling.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0d0f17] border border-white/5 space-y-1">
                    <strong className="text-[#7A00FF] block font-display">3. Shield Vault</strong>
                    <p className="text-[#8f97b0] text-[11px]">Silences spam and conceals hostile trolling without cognitive drain.</p>
                  </div>
                </div>
              </div>

              {/* Final CTAs */}
              <div className="pt-2 space-y-3">
                <Button
                  size="lg"
                  onClick={() => handleFinish(false)}
                  disabled={isImporting}
                  className="w-full gap-2 justify-center py-4 text-base"
                >
                  {isImporting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Importing Comments...</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare size={18} />
                      <span>{videoUrl.trim() ? 'Import & Open Inbox' : 'Open Inbox'}</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </Button>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleFinish(true)}
                    className="text-xs text-[#8f97b0] hover:text-white underline cursor-pointer"
                  >
                    Skip video import for now and open empty inbox
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-white/5 text-center text-xs text-[#8f97b0]">
        Founding beta · Copilot mode · Nothing posts without your approval
      </footer>
    </main>
  );
}
