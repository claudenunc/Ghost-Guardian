import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Shield, Crown } from 'lucide-react';
import { GhostMark, Chip, Button } from '../components/guardian/atoms';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/forever',
    desc: 'Demo mode and limited comment processing.',
    features: ['50 comments/month', 'Demo workspace access', 'Heuristic risk classifier', 'Manual approval only', 'Community tracking'],
    cta: 'Explore Free',
    featured: false,
  },
  {
    name: 'Creator',
    price: '$29',
    period: '/mo',
    desc: 'For individual active creators with an active comment section.',
    features: [
      '2,000 comments/month',
      'Full AI classification & intent detection',
      'Voice profile calibration & 4 tone registers',
      'Copilot + Autopilot operating modes',
      'Audience Intelligence & Question Clustering',
      'Analytics dashboard & time saved tracker',
      '1 platform connection (YouTube)',
      'Direct email support',
    ],
    cta: 'Start Creator Plan',
    featured: true,
  },
  {
    name: 'Pro',
    price: '$89',
    period: '/mo',
    desc: 'For high-volume creators, multiple channels, and weekly reports.',
    features: [
      'Unlimited comments',
      'Guardian Wit hostility de-escalation',
      'All 3 operating modes including Guardian Shield',
      'Ghost Guardian Weekly auto-generated digest',
      'Multi-channel monitoring',
      'Advanced Content Opportunity detection',
      'VIP community roster tagging',
      'Priority response SLA',
    ],
    cta: 'Go Pro',
    featured: false,
  },
  {
    name: 'Custom Guardian',
    price: 'Custom',
    period: '',
    desc: 'For podcasts, media companies, agencies, and creator networks.',
    features: [
      'Everything in Pro',
      'Custom LLM fine-tuning on full show transcripts',
      'Dedicated onboarding & safety boundary architect',
      'Custom webhook integrations',
      'Multi-creator team access',
      'Dedicated Slack/Discord channel',
      'SLA guarantee',
    ],
    cta: 'Talk to Us',
    featured: false,
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen ghost-aurora text-[#f4f6fb]">
      {/* Header Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <Link to="/" className="flex items-center gap-3 group">
          <GhostMark className="transition-transform group-hover:scale-105" />
          <span className="font-display text-sm tracking-[0.2em] uppercase text-white font-bold">
            Ghost Guardian
          </span>
        </Link>
        <Button asChild size="sm">
          <Link to="/app">Launch App</Link>
        </Button>
      </header>

      {/* Pricing Section */}
      <section className="mx-auto max-w-6xl px-5 pt-10 pb-20 sm:pt-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <Chip variant="guardian">Simple, Transparent Plans</Chip>
          <h1 className="font-display text-4xl sm:text-6xl text-white font-bold">
            Protect your attention. <br />
            <span className="text-gradient-guardian">Stay connected.</span>
          </h1>
          <p className="text-sm sm:text-base text-[#8f97b0] leading-relaxed">
            Choose the level of automation and protection that matches your channel's scale.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`ghost-panel p-6 flex flex-col justify-between space-y-6 ${
                plan.featured ? 'border-[#4de1dc] ghost-glow' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg text-white font-bold">{plan.name}</h3>
                  {plan.featured && <Chip variant="guardian">Popular</Chip>}
                </div>
                <p className="mt-1 text-xs text-[#8f97b0] leading-relaxed min-h-[36px]">{plan.desc}</p>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-3xl sm:text-4xl text-white font-bold">{plan.price}</span>
                  <span className="text-xs text-[#8f97b0]">{plan.period}</span>
                </div>

                <div className="mt-6 space-y-2.5 pt-4 border-t border-white/10 text-xs text-[#e4e7f1]">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check size={14} className="text-[#34d399] shrink-0 mt-0.5" />
                      <span className="leading-snug">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                asChild
                size="md"
                variant={plan.featured ? 'default' : 'secondary'}
                className="w-full justify-center"
              >
                <Link to="/app" className="gap-2">
                  {plan.cta} <ArrowRight size={14} />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Custom Guardian Enterprise Callout */}
        <div className="mt-16 ghost-panel p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-white/15">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-[#fbbf24]">
              <Crown size={20} />
              <h3 className="font-display text-xl text-white font-bold">We Build Custom Guardians for Creator Teams</h3>
            </div>
            <p className="text-xs sm:text-sm text-[#8f97b0] leading-relaxed">
              For major podcasts, production studios, and creator collectives with high-volume comment sections, we build customized AI assistants trained on your full catalogue of transcripts and private guidelines.
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/app/settings">Inquire About Custom Guardian</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-5 py-8 text-center text-xs text-[#8f97b0]">
        Ghost Guardian © 2026. All rights reserved.
      </footer>
    </div>
  );
}
