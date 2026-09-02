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
    desc: 'Ghost Guardian drafts responses in your voice. You review, edit, or reject. Nothing goes out without your sign-off.',
    icon: ShieldCheck,
    color: 'text-[#4de1dc]',
    bg: 'bg-[#4de1dc]/10',
    border: 'border-[#4de1dc]/30',
  },
  {
    id: 'autopilot',
    title: 'Mode 2: Autopilot',
    tagline: 'AI handles the routine. You handle what matters.',
    desc: 'Ghost Guardian auto-responds to praise, simple questions, and routine comments. Threats, criticism, and human moments always come to you.',
    icon: Zap,
    color: 'text-[#fbbf24]',
    bg: 'bg-[#fbbf24]/10',
    border: 'border-[#fbbf24]/30',
  },
  {
    id: 'guardian',
    title: 'Mode 3: Guardian',
    tagline: 'Maximum safety. Minimum noise.',
    desc: 'For high-stakes moments. Ghost Guardian shields you from harassment, hides hostile comments, and only surfaces what truly needs you.',
    icon: Lock,
    color: 'text-[#818cf8]',
    bg: 'bg-[#818cf8]/10',
    border: 'border-[#818cf8]/30',
  },
];

const commentCategories = [
  {
    category: 'Praise',
    response: 'Acknowledged personally, in your voice, at the right length.',
    icon: HeartHandshake,
    badge: 'Appreciate',
    tone: 'text-[#34d399]',
  },
  {
    category: 'Questions',
    response: 'Answered from your transcripts, FAQs, and approved knowledge.',
    icon: MessageSquare,
    badge: 'Answer',
    tone: 'text-[#4de1dc]',
  },
  {
    category: 'Disagreement',
    response: 'Engaged on the actual argument instead of deflected.',
    icon: Brain,
    badge: 'Explore',
    tone: 'text-[#818cf8]',
  },
  {
    category: 'Criticism',
    response: 'Treated as feedback, never auto-labelled as abuse.',
    icon: Scale,
    badge: 'Feedback',
    tone: 'text-[#a78bfa]',
  },
  {
    category: 'Trolling',
    response: 'De-escalated with wit, or left alone when silence is smarter.',
    icon: Ear,
    badge: 'Strategic Silence',
    tone: 'text-[#fbbf24]',
  },
  {
    category: 'Harassment',
    response: 'Boundary set, hidden, logged — without becoming the troll.',
    icon: Shield,
    badge: 'Quarantine',
    tone: 'text-[#f87171]',
  },
  {
    category: 'Threats',
    response: 'Never auto-answered. Escalated to you immediately.',
    icon: AlertTriangle,
    badge: 'Instant Escalation',
    tone: 'text-[#ef4444]',
  },
];

const faqs = [
  {
    q: 'Will it sound like me?',
    a: 'Ghost Guardian learns your voice from your existing content. You approve the style before it ever responds to a real comment.',
  },
  {
    q: 'What if I disagree with a response?',
    a: 'You can edit, reject, or regenerate any response before it goes out. Nothing is published without your approval in Copilot mode.',
  },
  {
    q: 'Is my data safe?',
    a: 'Your comments and voice data are stored locally in your browser by default. You can export a full backup anytime. We never sell your data.',
  },
  {
    q: 'What platforms do you support?',
    a: 'YouTube is live now. Instagram, TikTok, X, and Reddit are coming soon.',
  },
  {
    q: 'Can I try it before paying?',
    a: 'Yes. 14-day free trial, no credit card required. Or try the demo right now with no signup.',
  },
];

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen ghost-aurora text-[#f4f6fb] selection:bg-[#4de1dc]/30 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-md border-b border-white/5 bg-[#0a0d14]/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-3 group">
            <GhostMark className="transition-transform group-hover:scale-105" />
            <span className="font-display text-sm tracking-[0.2em] uppercase text-white font-bold">
              Ghost Guardian
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/pricing"
              className="text-xs font-semibold text-[#8f97b0] hover:text-white transition-colors px-2 py-1"
            >
              Pricing
            </Link>
            <Button asChild size="sm">
              <Link to="/app">Try the Demo</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative mx-auto max-w-6xl px-5 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-3xl space-y-6">
          <Chip variant="guardian" className="gap-2">
            <Sparkles size={13} className="text-[#4de1dc]" /> No signup required · Full interactive demo
          </Chip>

          <h1 className="font-display text-4xl leading-[1.08] sm:text-6xl lg:text-7xl text-white font-bold tracking-tight">
            Your audience is talking.{' '}
            <span className="text-gradient-guardian block mt-1">We've got your back.</span>
          </h1>

          <p className="text-base sm:text-xl text-[#8f97b0] leading-relaxed max-w-2xl">
            Ghost Guardian is the AI that handles your comments so you can focus on creating. Not a
            filter. Not a bot. A guardian that knows your voice, protects your attention, and never
            claims to be you.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto gap-2 shadow-[0_0_25px_rgba(77,225,220,0.25)]">
              <Link to="/app">
                Try the Demo (no signup) <ArrowRight size={16} />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link to="/auth">Start Free Trial</Link>
            </Button>
          </div>

          <p className="text-xs text-[#8f97b0] pt-1">
            No credit card required · 14-day free trial · Cancel anytime
          </p>
        </div>
      </section>

      {/* SECTION 1: THE PROBLEM */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20 border-t border-white/5">
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold tracking-[0.2em] text-[#f87171] uppercase">
              The Reality
            </span>
            <h2 className="font-display text-2xl sm:text-4xl text-white font-bold leading-tight">
              The internet is loud. Creators shouldn't have to personally absorb every comment to
              stay close to the people who show up.
            </h2>
          </div>

          <div className="lg:col-span-6 space-y-4 text-sm sm:text-base text-[#8f97b0] leading-relaxed">
            <p>
              Every creator knows the feeling. You publish something you're proud of, and within
              minutes the comments start rolling in. Some are kind. Some are questions. Some are
              cruel. And all of them are sitting in your notifications, waiting for you to decide
              what to do.
            </p>
            <p className="text-white font-medium">
              You can't reply to all of them. You can't ignore all of them. And you definitely
              can't let the cruel ones win.
            </p>
            <div className="p-4 rounded-2xl border border-[#4de1dc]/30 bg-[#4de1dc]/5 text-white font-medium text-sm">
              🛡️ Ghost Guardian sits between the noise and your attention — quiet, present, and on
              your side.
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE SOLUTION (3 MODES) */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold tracking-[0.2em] text-[#4de1dc] uppercase">
            Adaptive Protection
          </span>
          <h2 className="font-display text-3xl sm:text-5xl text-white font-bold">
            Three modes. One promise.
          </h2>
          <p className="text-sm sm:text-base text-[#8f97b0]">
            The best possible interaction for you and your community.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.id}
                className={`ghost-panel p-6 sm:p-8 space-y-5 border transition-all hover:scale-[1.02] ${mode.border}`}
              >
                <div className={`size-12 rounded-2xl ${mode.bg} ${mode.color} flex items-center justify-center font-bold`}>
                  <Icon size={24} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-display text-lg text-white font-bold">{mode.title}</h3>
                  <p className={`text-xs font-bold uppercase tracking-wider ${mode.color}`}>
                    {mode.tagline}
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-[#8f97b0] leading-relaxed">
                  {mode.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: NOT EVERY COMMENT DESERVES THE SAME RESPONSE */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20 border-t border-white/5">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-bold tracking-[0.2em] text-[#4de1dc] uppercase">
            Intelligent Triage
          </span>
          <h2 className="font-display text-3xl sm:text-5xl text-white font-bold">
            Not every comment deserves the same response.
          </h2>
          <p className="text-sm sm:text-base text-[#8f97b0]">
            Ghost Guardian classifies, understands intent, and applies the right response posture.
          </p>
        </div>

        <div className="mt-10 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {commentCategories.map(({ category, response, icon: Icon, badge, tone }) => (
            <div
              key={category}
              className="ghost-panel p-5 sm:p-6 space-y-3 border-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className={`size-10 rounded-xl bg-[#1e2235] ${tone} flex items-center justify-center`}>
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-[#0d0f17] text-[#8f97b0] border border-white/5">
                  {badge}
                </span>
              </div>
              <div>
                <h4 className="font-display text-base text-white font-bold">{category}</h4>
                <p className="mt-1.5 text-xs sm:text-sm text-[#8f97b0] leading-relaxed">{response}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: YOUR VOICE. YOUR RULES. */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20 border-t border-white/5">
        <div className="grid gap-10 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-bold tracking-[0.2em] text-[#c084fc] uppercase">
              Creator Authenticity
            </span>
            <h2 className="font-display text-3xl sm:text-5xl text-white font-bold leading-tight">
              Your voice. Your rules.
            </h2>
            <p className="text-sm sm:text-base text-[#8f97b0] leading-relaxed">
              Ghost Guardian never claims to be you. It generates responses consistent with the
              communication style you approve — your vocabulary, your length, your humor, your
              boundaries. Subjects you never want discussed simply aren't.
            </p>

            <div className="space-y-2.5 pt-2">
              {[
                'Approve or reject every AI-generated response',
                'Edit responses before they go out',
                'Set topics that are off-limits',
                'Define trusted commenters who get faster responses',
                'Pause the entire system with one click',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-xs sm:text-sm text-white font-medium">
                  <div className="p-1 rounded-full bg-[#34d399]/15 text-[#34d399] shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="ghost-panel p-6 sm:p-8 border-[#c084fc]/30 bg-gradient-to-br from-[#19142e]/90 to-[#121422]/95 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-bold text-[#c084fc] uppercase tracking-wider flex items-center gap-2">
                  <Sliders size={14} /> Voice Calibration Matrix
                </span>
                <Chip variant="human">Calibrated</Chip>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-[#8f97b0] mb-1">
                    <span>Directness</span>
                    <span className="text-white font-mono">75%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-[#4de1dc] w-3/4 rounded-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[#8f97b0] mb-1">
                    <span>Warmth</span>
                    <span className="text-white font-mono">75%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-[#c084fc] w-3/4 rounded-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[#8f97b0] mb-1">
                    <span>Humour & Wit</span>
                    <span className="text-white font-mono">45%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-[#fbbf24] w-[45%] rounded-full" />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0d0f17]/70 border border-white/5 text-[11px] text-[#8f97b0]">
                "Next-token prediction is the training objective, not a complete description of the model."
                <span className="block text-[#4de1dc] mt-1 font-semibold">— Grounded from Ep. 145 Knowledge Base</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: DEFEND WITHOUT BECOMING THE TROLL */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20 border-t border-white/5">
        <div className="ghost-panel p-8 sm:p-12 border-white/10 bg-gradient-to-r from-[#141829]/90 to-[#1c1830]/90 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold tracking-[0.2em] text-[#4de1dc] uppercase">
              Principled Defense
            </span>
            <h2 className="font-display text-2xl sm:text-4xl text-white font-bold leading-tight">
              Compassion without submission. Boundaries without cruelty. Humor without humiliation.
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 text-sm text-[#8f97b0] leading-relaxed">
            <p>
              The goal isn't winning internet arguments. It's the best possible interaction for you
              and the community who showed up.
            </p>
            <p>
              Ghost Guardian doesn't fight. It doesn't insult. It doesn't humiliate. It understands
              the difference between disagreement and abuse, between criticism and cruelty. And it
              responds accordingly.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 6: YOUR AUDIENCE IS TRYING TO TELL YOU SOMETHING */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20 border-t border-white/5">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-bold tracking-[0.2em] text-[#fbbf24] uppercase">
            Audience Signals
          </span>
          <h2 className="font-display text-3xl sm:text-5xl text-white font-bold">
            Real patterns. Real questions. Real content opportunities.
          </h2>
          <p className="text-sm sm:text-base text-[#8f97b0]">
            Recurring questions, emerging topics, content opportunities, and community health —
            drawn from real comment data, never invented.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {demoQuestionClusters.map((cluster) => (
            <div key={cluster.id} className="ghost-panel p-6 space-y-3 border-white/10">
              <div className="flex items-center justify-between">
                <Chip variant="attention" className="text-[11px]">
                  <Sparkles size={11} /> {cluster.mentions} people asked
                </Chip>
                <span className="text-xs font-mono text-[#34d399] font-bold">{cluster.trend}</span>
              </div>
              <p className="text-sm text-white font-semibold leading-relaxed">"{cluster.question}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7: CREATE WITHOUT FEAR */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20 border-t border-white/5">
        <div className="ghost-panel p-8 sm:p-14 border-[#4de1dc]/30 bg-gradient-to-br from-[#121b24]/90 via-[#101424]/95 to-[#1c1830]/90 space-y-6">
          <div className="size-12 rounded-2xl bg-[#4de1dc]/15 text-[#4de1dc] flex items-center justify-center">
            <Eye size={24} />
          </div>

          <h2 className="font-display text-2xl sm:text-4xl text-white font-bold max-w-3xl leading-snug">
            There are people with something beautiful to give the world who never give it because
            they're afraid of what strangers will say in the comments.
          </h2>

          <p className="max-w-2xl text-sm sm:text-base text-[#8f97b0] leading-relaxed">
            Create Without Fear is where Ghost Guardian is going: helping people publish without
            handing their nervous system to the comment section.
          </p>

          <div>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#4de1dc]/10 border border-[#4de1dc]/40 text-xs font-semibold text-[#4de1dc]">
              <Sparkles size={13} /> Coming soon: Create Without Fear Mode
            </span>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="mx-auto max-w-4xl px-5 py-16 sm:py-20 border-t border-white/5">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold tracking-[0.2em] text-[#8f97b0] uppercase">
            Questions & Answers
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-white font-bold">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="ghost-panel border-white/10 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-display text-sm sm:text-base text-white font-semibold cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-[#8f97b0] transition-transform duration-200 shrink-0 ml-3 ${
                      isOpen ? 'rotate-180 text-[#4de1dc]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-[#8f97b0] leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 8: FINAL CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="ghost-panel ghost-glow p-8 text-center sm:p-16 space-y-6 border-[#4de1dc]/40 bg-gradient-to-r from-[#141829]/95 via-[#131726]/95 to-[#1c1830]/95">
          <h2 className="font-display text-3xl sm:text-5xl text-white font-bold">
            You create. Ghost Guardian has your back.
          </h2>
          <p className="text-sm sm:text-base text-[#8f97b0] max-w-lg mx-auto leading-relaxed">
            Experience the full AI community guardian with pre-loaded demo episodes, comments, and
            intelligence.
          </p>
          <div className="flex flex-wrap justify-center gap-3.5 pt-2">
            <Button asChild size="lg" className="shadow-[0_0_30px_rgba(77,225,220,0.3)]">
              <Link to="/app">Meet Your Guardian</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/pricing">See Plans & Controls</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#080a10] px-5 py-12 text-xs text-[#8f97b0]">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="grid gap-8 grid-cols-2 sm:grid-cols-4">
            <div className="space-y-3">
              <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/app" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/app" className="hover:text-white transition-colors">Demo</Link></li>
                <li><Link to="/app/audience" className="hover:text-white transition-colors">Roadmap</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/app/settings" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link to="/app/settings" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link to="/app/settings" className="hover:text-white transition-colors">DPA</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Social</h4>
              <ul className="space-y-2">
                <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter / X</a></li>
                <li><a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">YouTube</a></li>
                <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p className="text-xs text-[#e4e7f1] italic font-serif">
              "Curiosity before judgment. Connection before correction. Compassion without submission."
            </p>
            <p className="text-[11px] text-[#8f97b0]">
              Ghost Guardian © 2026. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
