import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  HeartHandshake,
  MessageSquare,
  Brain,
  Scale,
  Ear,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Eye,
  Lock,
} from 'lucide-react';
import { GhostMark, Chip, Button } from '../components/guardian/atoms';
import { demoQuestionClusters } from '../fixtures/demoWorkspace';

const commentTypes = [
  { label: 'Praise', body: 'Acknowledged personally, in your voice, at the right length.', icon: HeartHandshake },
  { label: 'Questions', body: 'Answered from your transcripts, FAQs and approved knowledge.', icon: MessageSquare },
  { label: 'Disagreement', body: 'Engaged on the actual argument instead of deflected.', icon: Brain },
  { label: 'Criticism', body: 'Treated as feedback, never auto-labelled as abuse.', icon: Scale },
  { label: 'Trolling', body: 'De-escalated with wit, or left alone when silence is smarter.', icon: Ear },
  { label: 'Harassment', body: 'Boundary set, hidden, logged — without becoming the troll.', icon: Shield },
  { label: 'Threats', body: 'Never auto-answered. Escalated to you immediately.', icon: AlertTriangle },
];

export default function Landing() {
  return (
    <div className="min-h-screen ghost-aurora text-[#f4f6fb]">
      {/* Top Navbar */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <Link to="/" className="flex items-center gap-3 group">
          <GhostMark className="transition-transform group-hover:scale-105" />
          <span className="font-display text-sm tracking-[0.2em] uppercase text-white font-bold">
            Ghost Guardian
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/pricing" className="text-xs font-semibold text-[#8f97b0] hover:text-white transition-colors px-3 py-1.5">
            Pricing
          </Link>
          <Button asChild size="sm">
            <Link to="/app">Meet your Guardian</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-5 pt-10 pb-20 sm:pt-20">
        <Chip variant="guardian" className="gap-1.5">
          <Sparkles size={13} /> Demo mode included
        </Chip>

        <h1 className="mt-6 font-display text-4xl leading-[1.08] sm:text-6xl lg:text-7xl text-white font-bold">
          <span className="text-gradient-guardian">Your audience is talking.</span>
          <br />
          We've got your back.
        </h1>

        <p className="mt-6 max-w-2xl text-base text-[#8f97b0] sm:text-lg leading-relaxed">
          Ghost Guardian is an AI community guardian for creators who want to stay connected to
          their audience without giving the internet unlimited access to their time and energy.
        </p>

        <div className="mt-8 flex flex-wrap gap-3.5">
          <Button asChild size="lg">
            <Link to="/app" className="gap-2">
              Meet Your Guardian <ArrowRight size={16} />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/app/inbox">Watch the Demo</Link>
          </Button>
        </div>

        {/* 3 Key Pillars */}
        <div className="mt-14 grid gap-3 sm:grid-cols-3">
          {[
            { k: 'Every comment read', v: "So you don't have to absorb all of them." },
            { k: 'Nothing published blind', v: 'You approve, edit, or reject each reply.' },
            { k: 'Threats never auto-answered', v: 'Serious situations go straight to you.' },
          ].map((item) => (
            <div key={item.k} className="ghost-panel p-6">
              <p className="font-display text-sm text-white font-bold">{item.k}</p>
              <p className="mt-2 text-xs sm:text-sm text-[#8f97b0] leading-relaxed">{item.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The Internet Is Loud */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-display text-2xl sm:text-4xl text-white font-bold">The internet is loud.</h2>
        <p className="mt-4 max-w-2xl text-sm sm:text-base text-[#8f97b0] leading-relaxed">
          Creators shouldn't have to personally absorb every comment to stay close to the
          people who show up. Ghost Guardian sits between the noise and your attention — quiet,
          present, and on your side.
        </p>
      </section>

      {/* Not Every Comment Deserves The Same Response */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-display text-2xl sm:text-4xl text-white font-bold">
          Not every comment deserves the same response.
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#8f97b0]">Ghost Guardian classifies, understands intent, and applies the right response posture.</p>
        <div className="mt-8 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {commentTypes.map(({ label, body, icon: Icon }) => (
            <div key={label} className="ghost-panel p-5 sm:p-6 space-y-3">
              <div className="size-10 rounded-xl bg-[#1e2235] text-[#4de1dc] flex items-center justify-center">
                <Icon size={20} strokeWidth={1.8} />
              </div>
              <p className="font-display text-base text-white font-bold">{label}</p>
              <p className="text-xs sm:text-sm text-[#8f97b0] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Your Voice & Defend Without Becoming Troll */}
      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-16 lg:grid-cols-2">
        <div className="ghost-panel p-8 space-y-3">
          <h2 className="font-display text-2xl text-white font-bold">Your voice. Your rules.</h2>
          <p className="text-sm text-[#8f97b0] leading-relaxed">
            Ghost Guardian never claims to be you. It generates responses consistent with the
            communication style you approve — your vocabulary, your length, your humour, your
            boundaries. Subjects you never want discussed simply aren't.
          </p>
        </div>
        <div className="ghost-panel p-8 space-y-3">
          <h2 className="font-display text-2xl text-white font-bold">Defend without becoming the troll.</h2>
          <p className="text-sm text-[#8f97b0] leading-relaxed">
            Compassion without submission. Boundaries without cruelty. Humour without humiliation.
            The goal isn't winning internet arguments — it's the best possible interaction for you
            and the community who showed up.
          </p>
        </div>
      </section>

      {/* Audience Intelligence Section */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-display text-2xl sm:text-4xl text-white font-bold">
          Your audience is trying to tell you something.
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {demoQuestionClusters.map((cluster) => (
            <div key={cluster.id} className="ghost-panel p-6 space-y-3">
              <Chip variant="attention">
                <Sparkles size={12} /> {cluster.mentions} people asked
              </Chip>
              <p className="text-sm text-white font-semibold leading-relaxed">"{cluster.question}"</p>
              <p className="text-xs font-mono text-[#34d399] font-bold">{cluster.trend}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs sm:text-sm text-[#8f97b0]">
          Recurring questions, emerging topics, content opportunities, and community health — drawn
          from real comment data, never invented.
        </p>
      </section>

      {/* You Should Create */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="ghost-panel p-8 sm:p-12 space-y-4">
          <Eye size={28} className="text-[#4de1dc]" strokeWidth={1.8} />
          <h2 className="font-display text-2xl sm:text-4xl text-white font-bold">You should create.</h2>
          <p className="max-w-2xl text-sm sm:text-base text-[#8f97b0] leading-relaxed">
            There are people with something beautiful to give the world who never give it because
            they're afraid of what strangers will say in the comments. Create Without Fear is where Ghost
            Guardian is going: helping people publish without handing their nervous system to the
            comment section.
          </p>
          <Chip variant="outline" className="mt-2">
            Coming soon — Create Without Fear Mode
          </Chip>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="ghost-panel ghost-glow p-8 text-center sm:p-16 space-y-6">
          <h2 className="font-display text-3xl sm:text-5xl text-white font-bold">
            You create. Ghost Guardian has your back.
          </h2>
          <p className="text-sm text-[#8f97b0] max-w-lg mx-auto">
            Experience the full AI community guardian with pre-loaded demo episodes, comments, and intelligence.
          </p>
          <div className="flex flex-wrap justify-center gap-3.5">
            <Button asChild size="lg">
              <Link to="/app">Meet Your Guardian</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/app/settings">See Plans & Controls</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-5 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 text-xs text-[#8f97b0]">
          <span>Ghost Guardian — an AI community guardian authorised by the creator. Never an impersonation.</span>
          <span>Demo data only. Live YouTube connection requires OAuth authorization.</span>
        </div>
      </footer>
    </div>
  );
}
