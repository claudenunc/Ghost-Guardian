import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  X,
  ArrowRight,
  Shield,
  ShieldCheck,
  Zap,
  Sparkles,
  Calculator,
  HelpCircle,
  ChevronDown,
  DollarSign,
  TrendingUp,
  Clock,
  Crown,
  Users,
  Building,
  HeartHandshake,
  Lock,
} from 'lucide-react';
import { GhostMark, Chip, Button } from '../components/guardian/atoms';

const tiers = [
  {
    id: 'starter',
    name: 'Starter Defense',
    badge: null,
    target: 'For emerging creators (1K–10K subscribers)',
    monthlyPrice: 49,
    annualPrice: 39,
    commentLimit: 500,
    features: [
      '1 active platform connection',
      '500 comments/month processed',
      'Copilot mode (creator signs off every reply)',
      'Deterministic voice calibration',
      'Direct support channel',
    ],
    cta: 'Deploy Starter Trial',
    featured: false,
    color: 'border-white/[0.08] hover:border-white/20 bg-[#0a0a0a]',
  },
  {
    id: 'creator',
    name: 'Creator Core',
    badge: 'REACTOR CORE ACTIVE',
    target: 'For growing creators (10K–100K subscribers)',
    monthlyPrice: 99,
    annualPrice: 79,
    commentLimit: 2000,
    features: [
      '3 platform connections (YouTube + upcoming)',
      '2,000 comments/month processed',
      'Copilot + Autopilot defense modes',
      'Dynamic voice matrix calibration',
      'Audience intelligence dashboard',
      'Weekly attention signal digest',
      'Priority telemetry support',
    ],
    cta: 'Engage Creator Core',
    featured: true,
    color: 'border-[#0A00FF] shadow-[0_0_35px_rgba(10,0,255,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] bg-[#0a0a0a]',
  },
  {
    id: 'pro',
    name: 'Pro Sovereign',
    badge: null,
    target: 'For established creators (100K–1M subscribers)',
    monthlyPrice: 199,
    annualPrice: 159,
    commentLimit: 10000,
    features: [
      'Unlimited platform connections',
      '10,000 comments/month processed',
      'All 3 modes (Copilot, Autopilot, Guardian)',
      'Deep transcript voice training',
      'Audience signals & topic clustering',
      'Real-time hostile spike alerting',
      'Full API & webhook access',
      'Direct line priority support',
    ],
    cta: 'Deploy Sovereign Shield',
    featured: false,
    color: 'border-white/[0.08] hover:border-[#7A00FF]/50 bg-[#0a0a0a]',
  },
  {
    id: 'studio',
    name: 'Studio Monolith',
    badge: 'ENTERPRISE ARCHITECTURE',
    target: 'For media studios, creator teams, and podcast networks',
    monthlyPrice: 499,
    annualPrice: 399,
    commentLimit: 50000,
    features: [
      'Everything in Pro Sovereign',
      'Multi-seat operations (up to 10 managers)',
      'White-label portal option',
      'Dedicated security engineer',
      'Custom LLM inference endpoints',
      'Strict 99.9% uptime SLA',
      'Quarterly defense calibrations',
    ],
    cta: 'Consult Engineering',
    featured: false,
    color: 'border-white/[0.08] hover:border-[#FF007A]/50 bg-[#0a0a0a]',
  },
];

const comparisonRows = [
  { feature: 'Monthly Price (Annual)', starter: '$39/mo', creator: '$79/mo', pro: '$159/mo', studio: '$399/mo' },
  { feature: 'Monthly Price (Monthly)', starter: '$49/mo', creator: '$99/mo', pro: '$199/mo', studio: '$499/mo' },
  { feature: 'Platform Connections', starter: '1', creator: '3', pro: 'Unlimited', studio: 'Unlimited' },
  { feature: 'Monthly Comment Throughput', starter: '500', creator: '2,000', pro: '10,000', studio: 'Unlimited' },
  { feature: 'Copilot Mode', starter: true, creator: true, pro: true, studio: true },
  { feature: 'Autopilot Mode', starter: false, creator: true, pro: true, studio: true },
  { feature: 'Guardian Shield Mode', starter: false, creator: false, pro: true, studio: true },
  { feature: 'Voice Matrix Tuning', starter: 'Basic', creator: 'Advanced 4-Axis', pro: 'Custom Model', studio: 'Dedicated Engine' },
  { feature: 'Audience Signal Extraction', starter: false, creator: true, pro: 'Advanced', studio: 'Advanced' },
  { feature: 'Hostile Quarantine Vault', starter: true, creator: true, pro: true, studio: true },
  { feature: 'Evidentiary Audit Logs', starter: false, creator: false, pro: true, studio: true },
  { feature: 'API & Webhooks', starter: false, creator: false, pro: true, studio: true },
  { feature: 'Multi-Seat Team Access', starter: false, creator: false, pro: false, studio: 'Up to 10 Seats' },
  { feature: 'White-Label Portal', starter: false, creator: false, pro: false, studio: true },
  { feature: 'Support Level', starter: 'Standard', creator: 'Priority Defense', creatorHighlight: true, pro: 'Direct Channel', studio: 'Dedicated Engineer' },
  { feature: 'SLA Guarantee', starter: false, creator: false, pro: false, studio: '99.9% Monitored' },
];

const faqs = [
  {
    q: 'Can I change plans or cancel at any time?',
    a: 'Yes. Upgrades and downgrades take effect immediately with pro-rated billing. You can cancel with zero friction or penalty at any moment.',
  },
  {
    q: 'What counts toward my monthly comment quota?',
    a: 'Only comments fetched and actively processed through our Guardian intelligence triage engine count toward your allocation. Shielded or silently ignored items use minimal quota.',
  },
  {
    q: 'How does the 14-day free trial work?',
    a: 'You get unrestricted access to the full platform capabilities for 14 days without inputting credit card credentials. If you choose not to subscribe, your workspace gracefully pauses.',
  },
  {
    q: 'Is my audience conversation data kept strictly private?',
    a: 'Absolutely. We do not sell creator data, nor do we train public AI models on your private communications. Data is secured with AES-256 encryption at rest.',
  },
];

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState('annual');
  const [weeklyComments, setWeeklyComments] = useState(600);
  const [hourlyRate, setHourlyRate] = useState(65);
  const [openFaq, setOpenFaq] = useState(null);

  const roiResults = useMemo(() => {
    // 600 comments ≈ 6 hours/wk manual processing
    const hoursSavedPerWeek = Math.max(1, Math.round((weeklyComments / 90) * 10) / 10);
    const monthlyHoursSaved = Math.round(hoursSavedPerWeek * 4.33);
    const monthlyValue = Math.round(monthlyHoursSaved * hourlyRate);

    let recommendedPlan = tiers[1]; // default Creator
    if (weeklyComments <= 200) recommendedPlan = tiers[0];
    else if (weeklyComments > 2500) recommendedPlan = tiers[2];

    const planCost = billingCycle === 'annual' ? recommendedPlan.annualPrice : recommendedPlan.monthlyPrice;
    const netSavings = Math.max(0, monthlyValue - planCost);
    const roiMultiplier = Math.max(1, Math.round((monthlyValue / Math.max(1, planCost)) * 10) / 10);

    return {
      hoursSavedPerWeek,
      monthlyHoursSaved,
      monthlyValue,
      recommendedPlan,
      planCost,
      netSavings,
      roiMultiplier,
    };
  }, [weeklyComments, hourlyRate, billingCycle]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#0A00FF] selection:text-white">
      {/* Tactical Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#000000] shadow-[0_4px_25px_rgba(0,0,0,0.95)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-3 group">
            <GhostMark className="transition-transform group-hover:scale-105" />
            <div>
              <span className="font-display text-sm tracking-[0.25em] uppercase text-white font-black block">
                Ghost Guardian
              </span>
              <span className="text-[9px] font-mono tracking-[0.3em] text-[#a0a0a0] block uppercase">
                Access Tiers & Valuation
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/app"
              className="text-xs font-display font-bold uppercase tracking-widest text-[#a0a0a0] hover:text-white transition-colors px-2 py-1"
            >
              Live Demo
            </Link>
            <Button asChild size="sm">
              <Link to="/app">Launch App</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
      {/* MONUMENTAL HERO SECTION */}
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-16 sm:pt-24 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0A00FF]/15 border border-[#0A00FF]/40 text-xs font-mono font-bold text-[#0A00FF] shadow-[0_0_15px_rgba(10,0,255,0.25)]">
          <Sparkles size={13} /> Transparent Sovereignty · 14-Day Free Trial
        </div>

        <h1 className="monumental-text text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight">
          Precision pricing. <span className="text-gradient-guardian">Guaranteed ROI.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#a0a0a0] leading-relaxed font-normal">
          Ghost Guardian pays for itself in the first 72 hours. Reclaim 5+ hours of intense cognitive attention every single week while safeguarding your peace of mind.
        </p>

        {/* Tactical Billing Switch */}
        <div className="pt-4 flex items-center justify-center">
          <div className="inline-flex items-center p-1.5 rounded-xl bg-[#0a0a0a] border border-white/[0.12] shadow-xl font-display font-bold text-xs uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-lg transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-[#161616] text-white border border-white/20 shadow'
                  : 'text-[#a0a0a0] hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-[#0A00FF] text-white shadow-[0_0_18px_#0A00FF]'
                  : 'text-[#a0a0a0] hover:text-white'
              }`}
            >
              <span>Annual</span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  billingCycle === 'annual'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#00FF66]/20 text-[#00FF66]'
                }`}
              >
                SAVE 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* PRICING TIERS GRID */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => {
            const price = billingCycle === 'annual' ? tier.annualPrice : tier.monthlyPrice;
            const isFeatured = tier.featured;

            return (
              <div
                key={tier.id}
                className={`ghost-panel p-6 sm:p-7 flex flex-col justify-between space-y-6 transition-all relative ${
                  tier.color
                } ${isFeatured ? 'scale-[1.02] z-10' : ''}`}
              >
                {/* Popular Reactor Badge */}
                {tier.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span
                      className={`px-3 py-1 rounded-md text-[10px] font-mono font-extrabold uppercase tracking-widest ${
                        isFeatured
                          ? 'bg-[#0A00FF] text-white shadow-[0_0_15px_#0A00FF] border border-white/30'
                          : 'bg-[#0a0a0a] text-[#FF007A] border border-[#FF007A]/40'
                      }`}
                    >
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-display text-xl text-white font-black tracking-wide">{tier.name}</h3>
                    <p className="text-xs text-[#a0a0a0] mt-1.5 min-h-[34px] leading-relaxed">
                      {tier.target}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/[0.08]">
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-4xl sm:text-5xl font-black text-white">
                        ${price}
                      </span>
                      <span className="text-xs font-mono text-[#a0a0a0]">/mo</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#a0a0a0] block mt-1">
                      {billingCycle === 'annual'
                        ? `Billed annually ($${price * 12}/yr)`
                        : 'Billed on 30-day cycle'}
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="pt-4 border-t border-white/[0.08] space-y-2.5 text-xs text-white">
                    {tier.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <Check
                          size={14}
                          className="text-[#00FF66] shrink-0 mt-0.5"
                          strokeWidth={2.5}
                        />
                        <span className="leading-snug text-[#a0a0a0] font-medium">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.08]">
                  <Button
                    asChild
                    size="md"
                    variant={isFeatured ? 'primary' : 'default'}
                    className="w-full justify-center"
                  >
                    <Link to="/auth" className="gap-2">
                      <span>{tier.cta}</span>
                      <ArrowRight size={14} />
                    </Link>
                  </Button>
                  <span className="text-[10px] font-mono text-center text-[#a0a0a0] block mt-2">
                    14-day defense trial · Zero card required
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* INTERACTIVE ATTENTION ROI CALCULATOR */}
      <section className="mx-auto max-w-5xl px-5 py-20 border-t border-white/[0.08]">
        <div className="ghost-panel p-8 sm:p-12 border-[#0A00FF]/40 bg-[#0a0a0a] space-y-8 shadow-[0_0_40px_rgba(10,0,255,0.2)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#0A00FF]/15 text-[#0A00FF] border border-[#0A00FF]/30">
                  <Calculator size={18} />
                </span>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0A00FF]">
                  Interactive Attention Valuation
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl text-white font-black mt-1">
                Calculate Your Return on Attention
              </h2>
            </div>
            <Chip variant="positive" className="text-xs font-mono">
              ⚡ {roiResults.roiMultiplier}x Capitalized Return
            </Chip>
          </div>

          <div className="grid gap-8 lg:grid-cols-12 items-center">
            {/* Sliders Column */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex justify-between items-center text-xs font-mono font-bold uppercase text-[#a0a0a0] mb-2">
                  <span>Weekly Comment Volume</span>
                  <span className="text-base font-display font-bold text-white">
                    {weeklyComments.toLocaleString()} comments/wk
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="5000"
                  step="50"
                  value={weeklyComments}
                  aria-label="Weekly Comment Volume"
                  onChange={(e) => setWeeklyComments(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-black accent-[#0A00FF] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#a0a0a0] mt-1">
                  <span>50</span>
                  <span>1,000</span>
                  <span>2,500</span>
                  <span>5,000+</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-mono font-bold uppercase text-[#a0a0a0] mb-2">
                  <span>Creator Hourly Attention Value</span>
                  <span className="text-base font-display font-bold text-[#00FF66]">
                    ${hourlyRate}/hr
                  </span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="200"
                  step="5"
                  value={hourlyRate}
                  aria-label="Creator Hourly Attention Value"
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-black accent-[#00FF66] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#a0a0a0] mt-1">
                  <span>$25/hr</span>
                  <span>$50/hr</span>
                  <span>$100/hr</span>
                  <span>$200/hr</span>
                </div>
              </div>
            </div>

            {/* Results Card */}
            <div className="lg:col-span-6">
              <div className="p-6 rounded-xl bg-black border border-white/10 space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                <div className="grid grid-cols-2 gap-3 pb-4 border-b border-white/[0.08]">
                  <div className="p-3.5 rounded-lg bg-[#0a0a0a] border border-white/10">
                    <span className="text-[10px] uppercase font-mono font-bold text-[#a0a0a0] block">
                      Time Reclaimed
                    </span>
                    <span className="text-xl font-display font-black text-white mt-1 block">
                      {roiResults.hoursSavedPerWeek} hrs/wk
                    </span>
                    <span className="text-[10px] font-mono text-[#a0a0a0]">
                      ~{roiResults.monthlyHoursSaved} hrs/mo
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#0a0a0a] border border-white/10">
                    <span className="text-[10px] uppercase font-mono font-bold text-[#a0a0a0] block">
                      Monthly Attention Value
                    </span>
                    <span className="text-xl font-display font-black text-[#00FF66] mt-1 block">
                      ${roiResults.monthlyValue.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-mono text-[#a0a0a0]">at ${hourlyRate}/hr value</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-[#a0a0a0] leading-relaxed">
                  <p>
                    Optimal Tier:{' '}
                    <strong className="text-[#0A00FF] font-bold">
                      {roiResults.recommendedPlan.name} (${roiResults.planCost}/mo)
                    </strong>
                  </p>
                  <p className="text-white font-medium">
                    "At ~{roiResults.hoursSavedPerWeek} hours/week on community moderation priced at ${hourlyRate}/hr, that is ${roiResults.monthlyValue.toLocaleString()}/month in recovered creator output. The {roiResults.recommendedPlan.name} plan yields a net positive return of ${roiResults.netSavings.toLocaleString()}/month ({roiResults.roiMultiplier}x ROI)."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="mx-auto max-w-6xl px-5 py-20 border-t border-white/[0.08]">
        <div className="space-y-3 mb-10 text-center">
          <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#0A00FF] uppercase">
            Matrix Specification
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-white font-black">
            Compare Defense Capabilities
          </h2>
          <p className="text-sm text-[#a0a0a0]">
            Complete breakdown across all four Ghost Guardian operating tiers.
          </p>
        </div>

        <div className="ghost-panel overflow-hidden border-white/[0.08] shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white min-w-[650px]">
              <thead>
                <tr className="border-b border-white/[0.08] bg-black">
                  <th className="p-4 font-display text-sm font-bold text-white w-1/3">Feature Capability</th>
                  <th className="p-4 font-display text-sm font-bold text-white text-center">Starter</th>
                  <th className="p-4 font-display text-sm font-bold text-[#0A00FF] text-center bg-[#0A00FF]/10">
                    Creator Core
                  </th>
                  <th className="p-4 font-display text-sm font-bold text-white text-center">Pro Sovereign</th>
                  <th className="p-4 font-display text-sm font-bold text-white text-center">Studio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {comparisonRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-white/[0.02] transition-colors ${
                      idx % 2 === 0 ? 'bg-black/60' : 'bg-transparent'
                    }`}
                  >
                    <td className="p-4 font-medium text-white">{row.feature}</td>

                    {/* Starter */}
                    <td className="p-4 text-center text-[#a0a0a0] font-mono">
                      {typeof row.starter === 'boolean' ? (
                        row.starter ? (
                          <Check size={16} className="text-[#00FF66] mx-auto" />
                        ) : (
                          <span className="text-white/20">—</span>
                        )
                      ) : (
                        row.starter
                      )}
                    </td>

                    {/* Creator Highlight */}
                    <td className="p-4 text-center font-bold text-white bg-[#0A00FF]/10 font-mono">
                      {typeof row.creator === 'boolean' ? (
                        row.creator ? (
                          <Check size={16} className="text-[#00FF66] mx-auto" />
                        ) : (
                          <span className="text-white/20">—</span>
                        )
                      ) : (
                        row.creator
                      )}
                    </td>

                    {/* Pro */}
                    <td className="p-4 text-center text-[#a0a0a0] font-mono">
                      {typeof row.pro === 'boolean' ? (
                        row.pro ? (
                          <Check size={16} className="text-[#00FF66] mx-auto" />
                        ) : (
                          <span className="text-white/20">—</span>
                        )
                      ) : (
                        row.pro
                      )}
                    </td>

                    {/* Studio */}
                    <td className="p-4 text-center text-[#a0a0a0] font-mono">
                      {typeof row.studio === 'boolean' ? (
                        row.studio ? (
                          <Check size={16} className="text-[#00FF66] mx-auto" />
                        ) : (
                          <span className="text-white/20">—</span>
                        )
                      ) : (
                        row.studio
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 30-DAY GUARANTEE BANNER */}
      <section className="mx-auto max-w-4xl px-5 py-12">
        <div className="ghost-panel p-8 sm:p-10 border-[#00FF66]/40 bg-[#0a0a0a] flex flex-col sm:flex-row items-center gap-6 shadow-[0_0_30px_rgba(0,255,102,0.15)]">
          <div className="size-16 rounded-xl bg-[#00FF66]/15 text-[#00FF66] flex items-center justify-center shrink-0 border border-[#00FF66]/30">
            <ShieldCheck size={32} />
          </div>
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="font-display text-xl sm:text-2xl text-white font-black">
              30-Day Attention Restitution Guarantee
            </h3>
            <p className="text-xs sm:text-sm text-[#a0a0a0] leading-relaxed font-normal">
              Test Ghost Guardian in your active workflow risk-free. If it fails to measurably reclaim your creative time and buffer your mental stamina during the first 30 days, we will refund 100% of your investment immediately.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="mx-auto max-w-4xl px-5 py-16 border-t border-white/[0.08]">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#a0a0a0] uppercase">
            Billing Protocol
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-white font-black">
            Frequently Asked Questions
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
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-display text-sm sm:text-base text-white font-bold cursor-pointer"
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

      {/* FINAL MONUMENTAL CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="ghost-panel ghost-glow p-8 text-center sm:p-16 space-y-6 border-[#0A00FF]/50 bg-[#0a0a0a]">
          <h2 className="font-display text-3xl sm:text-5xl text-white font-black tracking-tight">
            Deploy your 14-day defense trial
          </h2>
          <p className="text-sm sm:text-base text-[#a0a0a0] max-w-lg mx-auto leading-relaxed">
            Zero credit card entry required. Full access to intelligence and triage engines. Cancel with one click.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/auth">Initialize Sovereign Trial</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link to="/app">Launch Interactive Demo</Link>
            </Button>
          </div>

          <p className="text-xs font-mono text-[#a0a0a0] pt-2">
            Autonomous protection built for creators who value their nervous systems.
          </p>
        </div>
      </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.08] bg-[#000000] px-5 py-8 text-center text-xs text-[#a0a0a0] font-mono">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Ghost Guardian © 2026. Forged Void Architecture.</span>
          <span>14-day sovereign trial on all tiers. Zero credit card lock-in.</span>
        </div>
      </footer>
    </div>
  );
}
