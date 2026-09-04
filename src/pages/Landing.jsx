import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  Zap,
  Lock,
  HeartHandshake,
  MessageSquare,
  Brain,
  Scale,
  Ear,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Check,
  CheckCircle2,
  ChevronDown,
  Pause,
  Sliders,
  Eye,
  ShieldAlert,
  Flame,
  Users,
} from 'lucide-react';
import { GhostMark, Chip, Button } from '../components/guardian/atoms';
import { demoQuestionClusters } from '../fixtures/demoWorkspace';

const modes = [
  {
    id: 'copilot',
    title: 'Mode 1: Copilot',
    tagline: 'You approve every reply.',
    desc: 'Ghost Guardian drafts responses in your calibrated voice. You review, edit, or reject. Nothing reaches the community without your explicit sign-off.',
    icon: ShieldCheck,
    color: 'text-[#0A00FF]',
    bg: 'bg-[#0A00FF]/15',
    border: 'border-[#0A00FF]/40',
  },
  {
    id: 'autopilot',
    title: 'Mode 2: Autopilot',
    tagline: 'AI handles the routine. You handle what matters.',
    desc: 'Ghost Guardian auto-responds to praise, simple questions, and routine comments. Hostility, edge-case criticism, and human moments always escalate directly to you.',
    icon: Zap,
    color: 'text-[#FF6A00]',
    bg: 'bg-[#FF6A00]/15',
    border: 'border-[#FF6A00]/40',
  },
  {
    id: 'guardian',
    title: 'Mode 3: Guardian',
    tagline: 'Maximum safety. Minimum cognitive noise.',
    desc: 'Engineered for high-stakes moments. Ghost Guardian automatically shields you from coordinated harassment, conceals hostile provocations, and preserves your attention.',
    icon: Lock,
    color: 'text-[#7A00FF]',
    bg: 'bg-[#7A00FF]/15',
    border: 'border-[#7A00FF]/40',
  },
];

const commentCategories = [
  {
    category: 'Praise & Support',
    response: 'Acknowledged personally in your authentic voice at the calibrated length.',
    icon: HeartHandshake,
    badge: 'Appreciate',
    tone: 'text-[#00FF66]',
  },
  {
    category: 'Questions',
    response: 'Answered accurately from your transcripts, FAQs, and approved knowledge vault.',
    icon: MessageSquare,
    badge: 'Answer',
    tone: 'text-[#0A00FF]',
  },
  {
    category: 'Disagreement',
    response: 'Engaged on the factual argument instead of deflected or defensively dismissed.',
    icon: Brain,
    badge: 'Explore',
    tone: 'text-[#7A00FF]',
  },
  {
    category: 'Constructive Criticism',
    response: 'Extracted as valuable creator intelligence, never mislabeled as abuse.',
    icon: Scale,
    badge: 'Feedback',
    tone: 'text-[#FF6A00]',
  },
  {
    category: 'Trolling & Bait',
    response: 'De-escalated with razor precision, or neutralized through strategic silence.',
    icon: Ear,
    badge: 'Strategic Silence',
    tone: 'text-[#FF8500]',
  },
  {
    category: 'Hostility & Harassment',
    response: 'Quarantined into the Shield Vault and logged for security without retaliation.',
    icon: Shield,
    badge: 'Quarantine',
    tone: 'text-[#FF1400]',
  },
  {
    category: 'Direct Threats',
    response: 'Fail-closed protocol. Never auto-answered. Preserved in evidentiary audit log.',
    icon: AlertTriangle,
    badge: 'Instant Escalation',
    tone: 'text-[#FF2A00]',
  },
];

const faqs = [
  {
    q: 'Will it sound authentically like me?',
    a: 'Ghost Guardian calibrates to your voice across four core dimensions: Directness, Warmth, Formality, and Humor. You approve the style and knowledge bounds before it ever touches a real comment.',
  },
  {
    q: 'What if I disagree with an AI recommendation?',
    a: 'You have absolute sovereignty. You can regenerate in alternate tones, edit replies freely, reject recommendations, or enact custom topic boundaries.',
  },
  {
    q: 'How does YouTube connection work?',
    a: 'Ghost Guardian supports official Google OAuth 2.0 and direct YouTube Data API v3 comment thread ingestion. You can pull real comments from any video in seconds.',
  },
  {
    q: 'Is creator data secure?',
    a: 'Tokens are encrypted using AES-256-GCM. We never sell your data, use your comments for public training without consent, or compromise creator sovereignty.',
  },
  {
    q: 'Can I test without a credit card?',
    a: 'Yes. Ghost Guardian provides an interactive live workspace demo and 14-day trial without requiring payment details.',
  },
];

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#0A00FF] selection:text-white">
      {/* Tactical Void Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#000000] shadow-[0_4px_25px_rgba(0,0,0,0.95)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-3 group">
            <GhostMark className="transition-transform group-hover:scale-105" />
            <div>
              <span className="font-display text-sm tracking-[0.25em] uppercase text-white font-black block">
                Ghost Guardian
              </span>
              <span className="text-[9px] font-mono tracking-[0.3em] text-[#a0a0a0] block uppercase">
                Forged Void Architecture
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/pricing"
              className="text-xs font-display font-bold uppercase tracking-widest text-[#a0a0a0] hover:text-white transition-colors px-2 py-1"
            >
              Pricing
            </Link>
            <Button asChild size="sm">
              <Link to="/app">Launch Demo</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
      {/* MONUMENTAL HERO SECTION */}
      <section className="relative mx-auto max-w-6xl px-5 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div className="max-w-4xl space-y-6">
          <Chip variant="guardian" className="gap-2">
            <Sparkles size={13} className="text-[#0A00FF]" /> Sovereign Attention Defense · Interactive Environment
          </Chip>

          <h1 className="monumental-text text-4xl leading-[1.04] sm:text-6xl lg:text-7xl font-black tracking-tight">
            Your audience is talking.{' '}
            <span className="text-gradient-guardian block mt-2">We've got your back.</span>
          </h1>

          <p className="text-base sm:text-xl text-[#a0a0a0] leading-relaxed max-w-2xl font-normal">
            Ghost Guardian is the forged intelligence system that buffers your comments so you can create without hesitation. Not a generic filter. Not an impersonator. A sovereign shield that knows your voice, protects your nervous system, and never claims to be you.
          </p>

          <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto gap-2.5">
              <Link to="/app">
                Engage Guardian Defense <ArrowRight size={16} />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link to="/auth">Initialize Creator Access</Link>
            </Button>
          </div>

          <p className="text-xs font-mono text-[#a0a0a0] pt-1">
            Zero credit card required · 14-day defense trial · Deterministic safety guardrails
          </p>
        </div>
      </section>

      {/* SECTION 1: THE REALITY OF ATTENTION DRAIN */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24 border-t border-white/[0.08]">
        <div className="grid gap-10 lg:grid-cols-12 items-start">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold font-mono tracking-[0.25em] text-[#FF2A00] uppercase">
              The Reality
            </span>
            <h2 className="font-display text-2xl sm:text-4xl text-white font-black leading-tight">
              The internet is loud. Creators should not personally absorb every spike of digital venom to stay close to their community.
            </h2>
          </div>

          <div className="lg:col-span-6 space-y-4 text-sm sm:text-base text-[#a0a0a0] leading-relaxed">
            <p>
              Every creator understands the weight. You hit publish on something that took weeks of thought, and within minutes the notification queue begins to swell. Some comments are profound insights. Some are sincere questions. Some are deliberate hostility meant to derail your day.
            </p>
            <p className="text-white font-medium">
              You cannot reply to all of them. You cannot ignore all of them. And you must never let bad-faith actors dictate your creative momentum.
            </p>
            <div className="p-4 rounded-xl border border-[#0A00FF]/40 bg-[#0a0a0a] text-white font-medium text-sm shadow-[0_0_24px_rgba(10,0,255,0.2)]">
              🛡️ Ghost Guardian stands in the breach between raw public noise and your creative attention — calculating, unyielding, and completely on your side.
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ADAPTIVE PROTECTION MODES */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24 border-t border-white/[0.08]">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold font-mono tracking-[0.25em] text-[#0A00FF] uppercase">
            Adaptive Protection Architecture
          </span>
          <h2 className="font-display text-3xl sm:text-5xl text-white font-black tracking-tight">
            Three Modes. One Sovereign Promise.
          </h2>
          <p className="text-sm sm:text-base text-[#a0a0a0]">
            Autonomous calibration tuned to the creator's emotional bandwidth and operational posture.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.id}
                className={`ghost-panel p-6 sm:p-8 space-y-5 border ${mode.border} transition-all hover:scale-[1.02]`}
              >
                <div className={`size-12 rounded-xl ${mode.bg} ${mode.color} flex items-center justify-center font-bold border ${mode.border}`}>
                  <Icon size={24} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-display text-lg text-white font-bold">{mode.title}</h3>
                  <p className={`text-xs font-mono font-bold uppercase tracking-wider ${mode.color}`}>
                    {mode.tagline}
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-[#a0a0a0] leading-relaxed">
                  {mode.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: INTELLIGENT TRIAGE MATRIX */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24 border-t border-white/[0.08]">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-bold font-mono tracking-[0.25em] text-[#0A00FF] uppercase">
            Semantic Intelligence
          </span>
          <h2 className="font-display text-3xl sm:text-5xl text-white font-black tracking-tight">
            Not every comment deserves the same posture.
          </h2>
          <p className="text-sm sm:text-base text-[#a0a0a0]">
            Ghost Guardian classifies linguistic subtext, extracts intent, and enforces constitutional defense rules.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {commentCategories.map(({ category, response, icon: Icon, badge, tone }) => (
            <div
              key={category}
              className="ghost-panel p-5 sm:p-6 space-y-3 border-white/[0.08] hover:border-white/20 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className={`size-10 rounded-xl bg-[#000000] border border-white/10 ${tone} flex items-center justify-center`}>
                  <Icon size={20} strokeWidth={2} />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-1 rounded bg-[#0a0a0a] text-[#a0a0a0] border border-white/10">
                  {badge}
                </span>
              </div>
              <div>
                <h4 className="font-display text-base text-white font-bold tracking-wide">{category}</h4>
                <p className="mt-1.5 text-xs sm:text-sm text-[#a0a0a0] leading-relaxed">{response}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: CALIBRATED CREATOR VOICE */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24 border-t border-white/[0.08]">
        <div className="grid gap-10 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-bold font-mono tracking-[0.25em] text-[#FF007A] uppercase">
              Creator Authenticity
            </span>
            <h2 className="font-display text-3xl sm:text-5xl text-white font-black leading-tight">
              Your voice. Your boundaries. Zero hallucinations.
            </h2>
            <p className="text-sm sm:text-base text-[#a0a0a0] leading-relaxed">
              Ghost Guardian never fabricates personal claims or pretends to be a human behind your back. It generates drafts calibrated to your exact tone parameters and approved knowledge vault — your vocabulary, your humor threshold, your topic boundaries.
            </p>

            <div className="space-y-3 pt-2">
              {[
                'Review, edit, or reject every draft before publication',
                'Hard-lock forbidden topics requiring immediate human review',
                'Identify trusted contributors and recurring supporters',
                'Instant single-click defense pause from the topbar',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-xs sm:text-sm text-white font-medium">
                  <div className="p-1 rounded-md bg-[#00FF66]/15 text-[#00FF66] shrink-0 border border-[#00FF66]/30">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="ghost-panel p-6 sm:p-8 border-[#FF007A]/30 bg-[#0a0a0a] space-y-5 shadow-[0_0_30px_rgba(255,0,122,0.1)]">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <span className="text-xs font-display font-bold text-[#FF007A] uppercase tracking-wider flex items-center gap-2">
                  <Sliders size={14} /> Voice Calibration Matrix
                </span>
                <Chip variant="human">Calibrated Active</Chip>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between text-[#a0a0a0] mb-1.5 font-mono">
                    <span>Directness</span>
                    <span className="text-white font-bold">75%</span>
                  </div>
                  <div className="h-2 rounded-full bg-black border border-white/10 overflow-hidden">
                    <div className="h-full bg-[#0A00FF] w-3/4 rounded-full shadow-[0_0_8px_#0A00FF]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[#a0a0a0] mb-1.5 font-mono">
                    <span>Warmth</span>
                    <span className="text-white font-bold">85%</span>
                  </div>
                  <div className="h-2 rounded-full bg-black border border-white/10 overflow-hidden">
                    <div className="h-full bg-[#FF007A] w-[85%] rounded-full shadow-[0_0_8px_#FF007A]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[#a0a0a0] mb-1.5 font-mono">
                    <span>Humor & Wit</span>
                    <span className="text-white font-bold">45%</span>
                  </div>
                  <div className="h-2 rounded-full bg-black border border-white/10 overflow-hidden">
                    <div className="h-full bg-[#FF6A00] w-[45%] rounded-full shadow-[0_0_8px_#FF6A00]" />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-black border border-white/10 text-[11px] text-[#a0a0a0] font-mono leading-relaxed">
                "Next-token prediction is the training objective, not a complete description of the learned model."
                <span className="block text-[#0A00FF] mt-1.5 font-bold">— Verified Anchor: Episode 145 Knowledge Base</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: AUDIENCE SIGNALS */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24 border-t border-white/[0.08]">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-bold font-mono tracking-[0.25em] text-[#FF6A00] uppercase">
            Audience Intelligence
          </span>
          <h2 className="font-display text-3xl sm:text-5xl text-white font-black tracking-tight">
            Real patterns. Real signals. Real content leverage.
          </h2>
          <p className="text-sm sm:text-base text-[#a0a0a0]">
            Recurring questions, emergent debate clusters, and audience demand curves distilled straight from raw conversation threads.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {demoQuestionClusters.map((cluster) => (
            <div key={cluster.id} className="ghost-panel p-6 space-y-3 border-white/[0.08]">
              <div className="flex items-center justify-between">
                <Chip variant="attention" className="text-[11px]">
                  <Sparkles size={11} /> {cluster.mentions} creators inquired
                </Chip>
                <span className="text-xs font-mono text-[#00FF66] font-bold">{cluster.trend}</span>
              </div>
              <p className="text-sm text-white font-semibold leading-relaxed">"{cluster.question}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6: FAQ SECTION */}
      <section className="mx-auto max-w-4xl px-5 py-16 sm:py-24 border-t border-white/[0.08]">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold font-mono tracking-[0.25em] text-[#a0a0a0] uppercase">
            System Directives
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-white font-black">
            Frequently Answered Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="ghost-panel border-white/[0.08] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-display text-sm sm:text-base text-white font-bold cursor-pointer tracking-wide"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-[#a0a0a0] transition-transform duration-200 shrink-0 ml-3 ${
                      isOpen ? 'rotate-180 text-[#0A00FF]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-[#a0a0a0] leading-relaxed border-t border-white/[0.08] pt-3 font-normal">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 7: FINAL MONUMENTAL CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="ghost-panel ghost-glow p-8 text-center sm:p-16 space-y-6 border-[#0A00FF]/50 bg-[#0a0a0a]">
          <h2 className="font-display text-3xl sm:text-5xl text-white font-black tracking-tight">
            You create. Ghost Guardian holds the boundary.
          </h2>
          <p className="text-sm sm:text-base text-[#a0a0a0] max-w-lg mx-auto leading-relaxed">
            Test the live AI community guardian with full YouTube comment ingestion, relationship intelligence, and calibrated safety rules.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/app">Deploy Workspace Demo</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link to="/pricing">Review Access Tiers</Link>
            </Button>
          </div>
        </div>
      </section>

      </main>

      {/* Void Footer */}
      <footer className="border-t border-white/[0.08] bg-[#000000] px-5 py-12 text-xs text-[#a0a0a0]">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="grid gap-8 grid-cols-2 sm:grid-cols-4 font-mono">
            <div className="space-y-3">
              <h4 className="text-white font-bold uppercase tracking-widest text-[11px]">System</h4>
              <ul className="space-y-2">
                <li><Link to="/app" className="hover:text-white transition-colors">Triage Inbox</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/app/voice" className="hover:text-white transition-colors">Voice Studio</Link></li>
                <li><Link to="/app/rules" className="hover:text-white transition-colors">Safety Matrix</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-white font-bold uppercase tracking-widest text-[11px]">Protocols</h4>
              <ul className="space-y-2">
                <li><Link to="/app/audience" className="hover:text-white transition-colors">Audience Signals</Link></li>
                <li><Link to="/app/analytics" className="hover:text-white transition-colors">Impact Analytics</Link></li>
                <li><Link to="/app/settings" className="hover:text-white transition-colors">OAuth Platform</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-white font-bold uppercase tracking-widest text-[11px]">Integrity</h4>
              <ul className="space-y-2">
                <li><Link to="/app/settings" className="hover:text-white transition-colors">Data Portability</Link></li>
                <li><Link to="/app/activity" className="hover:text-white transition-colors">Audit Trail</Link></li>
                <li><Link to="/app/settings" className="hover:text-white transition-colors">Security Rules</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-white font-bold uppercase tracking-widest text-[11px]">Network</h4>
              <ul className="space-y-2">
                <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter / X</a></li>
                <li><a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">YouTube</a></li>
                <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left font-mono">
            <p className="text-xs text-white">
              "Curiosity before judgment. Connection before correction. Compassion without submission."
            </p>
            <p className="text-[11px] text-[#a0a0a0]">
              Ghost Guardian © 2026. Forged Void Architecture.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
