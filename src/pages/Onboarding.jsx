import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Play,
  X,
  Clock,
  MessageSquare,
  Bot,
  Video,
  HelpCircle,
  Heart,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { GhostMark, Chip, Button } from '../components/guardian/atoms';
import { useGuardian } from '../lib/store';

const STORAGE_KEY = 'ghost-guardian-onboarding-step';

export default function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding, showToast, addLearningExample, updateVoice } = useGuardian();

  // Load initial step from localStorage or default to 1
  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = Number(saved);
    return parsed >= 1 && parsed <= 4 ? parsed : 1;
  });

  // Step 2 state: Voice examples
  const [examples, setExamples] = useState({
    ex1: "Two years is a long time to stay with the show. Glad the 'bottoming out' section landed — that was the one we argued about most before publishing.",
    ex2: "That's fair criticism. That segment was compressed for time, but which objection do you think deserved more attention?",
    ex3: "Disagreement is always welcome here when there's a real argument attached. Thanks for tuning in!",
    ex4: '',
    ex5: '',
  });

  // Step 3 state: Platform
  const [selectedPlatform, setSelectedPlatform] = useState('youtube'); // 'youtube' | 'demo'
  const [isConnecting, setIsConnecting] = useState(false);

  // Demo video modal state for Step 1
  const [showDemoVideo, setShowDemoVideo] = useState(false);

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

  const handleFinish = () => {
    // Save voice examples into learning store
    const validExamples = [examples.ex1, examples.ex2, examples.ex3, examples.ex4, examples.ex5].filter(Boolean);
    validExamples.forEach((ex) => {
      addLearningExample?.({
        id: `onboarding-ex-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        before: 'Default boilerplate response',
        after: ex,
        source: 'onboarding_calibration',
      });
    });

    completeOnboarding({
      creator: { displayName: 'Alex Chen', channelName: 'The Long Signal' },
      voice: { approvedExamples: validExamples },
      mode: 'copilot',
    });

    localStorage.removeItem(STORAGE_KEY);
    showToast('Guardian activated! Welcome to your protected inbox.', 'success');
    navigate('/app/inbox');
  };

  const handleSkipAll = () => {
    completeOnboarding({
      creator: { displayName: 'Alex Chen', channelName: 'The Long Signal' },
      voice: {},
      mode: 'copilot',
    });
    localStorage.removeItem(STORAGE_KEY);
    showToast('Skipped onboarding — demo workspace ready.', 'info');
    navigate('/app');
  };

  return (
    <main className="min-h-screen ghost-aurora text-[#f4f6fb] flex flex-col justify-between selection:bg-[#4de1dc]/30 selection:text-white">
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
                className="h-full bg-[#4de1dc] transition-all duration-300 rounded-full"
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
        <div className="w-full max-w-2xl ghost-panel ghost-glow p-6 sm:p-10 border-[#4de1dc]/30 bg-gradient-to-br from-[#121929]/95 via-[#131726]/95 to-[#1c1830]/95 shadow-2xl relative animate-in fade-in duration-300">
          {/* STEP 1: WELCOME (5 SECONDS) */}
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
                  Let's get you protected in the next 60 seconds.
                </p>
              </div>

              {/* 3-Step Overview Card */}
              <div className="p-6 rounded-2xl bg-[#0b0e17]/80 border border-white/10 space-y-4 font-sans">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8f97b0]">
                  Ghost Guardian will:
                </span>

                <div className="space-y-3.5">
                  <div className="flex items-center gap-3.5">
                    <div className="size-7 rounded-lg bg-[#4de1dc]/15 text-[#4de1dc] font-bold text-xs flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div className="text-xs sm:text-sm">
                      <strong className="text-white">Learn your voice</strong>
                      <span className="text-[#8f97b0]"> (30 seconds)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <div className="size-7 rounded-lg bg-[#fbbf24]/15 text-[#fbbf24] font-bold text-xs flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div className="text-xs sm:text-sm">
                      <strong className="text-white">Connect to your platform</strong>
                      <span className="text-[#8f97b0]"> (20 seconds)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <div className="size-7 rounded-lg bg-[#34d399]/15 text-[#34d399] font-bold text-xs flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div className="text-xs sm:text-sm">
                      <strong className="text-white">Show you your first AI-drafted response</strong>
                      <span className="text-[#8f97b0]"> (10 seconds)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <Button
                  size="lg"
                  onClick={handleNext}
                  className="w-full sm:w-auto gap-2 justify-center shadow-[0_0_20px_rgba(77,225,220,0.3)]"
                >
                  <span>Let's Go</span>
                  <ArrowRight size={16} />
                </Button>

                <button
                  type="button"
                  onClick={() => setShowDemoVideo(true)}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl border border-white/10 bg-[#1e2235]/60 hover:bg-[#1e2235] text-xs font-semibold text-[#8f97b0] hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play size={14} className="text-[#4de1dc]" /> Watch 30-second demo video
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: VOICE CALIBRATION (30 SECONDS) */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4de1dc]">
                    Step 2 of 4 · Voice Calibration
                  </span>
                  <span className="text-xs text-[#8f97b0]">~30 seconds</span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl text-white font-bold">
                  Help Ghost Guardian learn your voice
                </h1>
                <p className="text-xs sm:text-sm text-[#8f97b0]">
                  Paste 3–5 examples of how you actually talk. We'll do the rest.
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
                    placeholder="A reply you wrote that sounds like you"
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f17] p-3 text-xs text-white focus:border-[#4de1dc] focus:outline-none leading-relaxed resize-none"
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
                    placeholder="Another reply showing how you handle questions or feedback"
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f17] p-3 text-xs text-white focus:border-[#4de1dc] focus:outline-none leading-relaxed resize-none"
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
                    placeholder="A quick sign-off or how you greet a regular viewer"
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f17] p-3 text-xs text-white focus:border-[#4de1dc] focus:outline-none leading-relaxed resize-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#8f97b0] block mb-1">
                    Example 4 <span className="text-white/40">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={examples.ex4}
                    onChange={(e) => setExamples({ ...examples, ex4: e.target.value })}
                    placeholder="Optional: A humorous reply or boundary statement"
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f17] p-3 text-xs text-white focus:border-[#4de1dc] focus:outline-none leading-relaxed resize-none"
                  />
                </div>
              </div>

              {/* Helper Text */}
              <div className="p-3.5 rounded-xl bg-[#0d0f17]/60 border border-white/5 text-xs text-[#8f97b0] leading-relaxed">
                💡 <strong className="text-white">Don't overthink it.</strong> Even short replies help. Ghost Guardian learns your vocabulary, sentence length, and tone.
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

          {/* STEP 3: PLATFORM CONNECTION (20 SECONDS) */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4de1dc]">
                    Step 3 of 4 · Platform Connection
                  </span>
                  <span className="text-xs text-[#8f97b0]">~20 seconds</span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl text-white font-bold">
                  Connect your platform
                </h1>
                <p className="text-xs sm:text-sm text-[#8f97b0]">
                  Ghost Guardian works with YouTube now. More platforms coming soon.
                </p>
              </div>

              {/* Connection Cards */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setSelectedPlatform('youtube')}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    selectedPlatform === 'youtube'
                      ? 'border-[#4de1dc] bg-[#4de1dc]/10 shadow-[0_0_20px_rgba(77,225,220,0.15)]'
                      : 'border-white/10 bg-[#0d0f17] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="size-11 rounded-xl bg-[#ff0000]/15 text-[#ff4444] flex items-center justify-center shrink-0">
                      <Video size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display text-sm font-bold text-white">YouTube</h4>
                        <Chip variant="positive" className="text-[10px]">Recommended</Chip>
                      </div>
                      <p className="text-xs text-[#8f97b0] mt-0.5">
                        One-click Google OAuth synchronization
                      </p>
                    </div>
                  </div>

                  <div className={`size-5 rounded-full border flex items-center justify-center ${
                    selectedPlatform === 'youtube' ? 'border-[#4de1dc] bg-[#4de1dc] text-black' : 'border-white/20'
                  }`}>
                    {selectedPlatform === 'youtube' && <CheckCircle2 size={14} />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPlatform('demo')}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    selectedPlatform === 'demo'
                      ? 'border-[#4de1dc] bg-[#4de1dc]/10 shadow-[0_0_20px_rgba(77,225,220,0.15)]'
                      : 'border-white/10 bg-[#0d0f17] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="size-11 rounded-xl bg-[#1e2235] text-[#4de1dc] flex items-center justify-center shrink-0">
                      <GhostMark className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-bold text-white">Skip for now</h4>
                      <p className="text-xs text-[#8f97b0] mt-0.5">
                        Use simulated demo fixture mode with pre-loaded comments
                      </p>
                    </div>
                  </div>

                  <div className={`size-5 rounded-full border flex items-center justify-center ${
                    selectedPlatform === 'demo' ? 'border-[#4de1dc] bg-[#4de1dc] text-black' : 'border-white/20'
                  }`}>
                    {selectedPlatform === 'demo' && <CheckCircle2 size={14} />}
                  </div>
                </button>
              </div>

              {/* Helper note */}
              <p className="text-xs text-[#8f97b0]">
                You can connect more platforms later in Settings (Instagram, TikTok, X coming soon).
              </p>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleSkipToStep(4)}
                  className="text-xs text-[#8f97b0] hover:text-white underline cursor-pointer"
                >
                  Skip to Demo Mode
                </button>

                <Button
                  size="lg"
                  onClick={() => {
                    if (selectedPlatform === 'youtube') {
                      setIsConnecting(true);
                      setTimeout(() => {
                        setIsConnecting(false);
                        handleNext();
                      }, 600);
                    } else {
                      handleNext();
                    }
                  }}
                  className="w-full sm:w-auto gap-2 justify-center"
                >
                  {isConnecting ? (
                    <span>Connecting...</span>
                  ) : (
                    <>
                      <span>{selectedPlatform === 'youtube' ? 'Connect YouTube' : 'Continue to Demo'}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: THE WOW MOMENT (10 SECONDS) */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#34d399]/15 text-[#34d399] text-xs font-bold">
                  <ShieldCheck size={14} /> Step 4 of 4 · Shield Active
                </div>
                <h1 className="font-display text-3xl sm:text-4xl text-white font-bold tracking-tight">
                  You're protected
                </h1>
                <p className="text-sm sm:text-base text-[#8f97b0] leading-relaxed">
                  Here's what Ghost Guardian just did for you:
                </p>
              </div>

              {/* Real-time Stats Card */}
              <div className="p-6 rounded-2xl bg-[#0b0e17]/90 border border-[#4de1dc]/30 space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center sm:text-left">
                  <div className="p-3 rounded-xl bg-[#141829] border border-white/5">
                    <span className="text-2xl font-display font-bold text-white block">47</span>
                    <span className="text-[11px] text-[#8f97b0]">comments analyzed</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#141829] border border-white/5">
                    <span className="text-2xl font-display font-bold text-[#34d399] block">12</span>
                    <span className="text-[11px] text-[#8f97b0]">spam filtered</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#141829] border border-white/5">
                    <span className="text-2xl font-display font-bold text-[#4de1dc] block">8</span>
                    <span className="text-[11px] text-[#8f97b0]">routine replies drafted</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#141829] border border-white/5">
                    <span className="text-2xl font-display font-bold text-[#818cf8] block">3</span>
                    <span className="text-[11px] text-[#8f97b0]">questions answered</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#141829] border border-white/5">
                    <span className="text-2xl font-display font-bold text-[#c084fc] block">2</span>
                    <span className="text-[11px] text-[#8f97b0]">human moments flagged</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#141829] border border-white/5">
                    <span className="text-2xl font-display font-bold text-[#34d399] block">0</span>
                    <span className="text-[11px] text-[#8f97b0]">threats auto-answered</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-[#8f97b0]">Protected attention value:</span>
                  <span className="text-sm font-display font-bold text-[#34d399]">
                    ~2.5 hours saved this week
                  </span>
                </div>
              </div>

              {/* Final CTA */}
              <div className="pt-2">
                <Button
                  size="lg"
                  onClick={handleFinish}
                  className="w-full gap-2 justify-center shadow-[0_0_30px_rgba(77,225,220,0.35)] py-4 text-base"
                >
                  <MessageSquare size={18} />
                  <span>Open Your Inbox</span>
                  <ArrowRight size={18} />
                </Button>
                <p className="text-[11px] text-center text-[#8f97b0] mt-2">
                  Nothing will be posted without your explicit approval in Copilot mode.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 30-Second Demo Video Modal */}
      {showDemoVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl border border-white/15 bg-[#121625] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Play size={16} className="text-[#4de1dc]" />
                <h3 className="font-display text-sm text-white font-bold">Ghost Guardian in 30 Seconds</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDemoVideo(false)}
                className="p-1 rounded text-[#8f97b0] hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Simulated Animated Video Player */}
            <div className="aspect-video rounded-xl bg-[#0a0d14] border border-white/10 p-6 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
              <div className="size-14 rounded-full bg-[#4de1dc]/20 text-[#4de1dc] flex items-center justify-center animate-pulse">
                <ShieldCheck size={28} />
              </div>
              <div className="space-y-1 z-10">
                <h4 className="font-display text-base text-white font-bold">Autonomous Comment Protection</h4>
                <p className="text-xs text-[#8f97b0] max-w-xs">
                  See how Ghost Guardian analyzes, classifies, and drafts in your voice in real time.
                </p>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#4de1dc]">
                ● Live Demo Ready
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                size="sm"
                onClick={() => {
                  setShowDemoVideo(false);
                  handleNext();
                }}
              >
                Got It, Let's Go →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-white/5 text-center text-xs text-[#8f97b0]">
        Ghost Guardian Onboarding · Free 14-day trial · No credit card required
      </footer>
    </main>
  );
}
