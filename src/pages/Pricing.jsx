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
    name: 'Starter',
    badge: null,
    target: 'For new creators (1K–10K subscribers)',
    monthlyPrice: 49,
    annualPrice: 39,
    commentLimit: 500,
    features: [
      '1 platform connection',
      '500 comments/month',
      'Copilot mode (you approve every reply)',
      'Basic voice calibration',
      'Email support',
    ],
    cta: 'Start Free Trial',
    featured: false,
    color: 'border-white/10 hover:border-white/20',
  },
  {
    id: 'creator',
    name: 'Creator',
    badge: '⭐ MOST POPULAR',
    target: 'For growing creators (10K–100K subscribers)',
    monthlyPrice: 99,
    annualPrice: 79,
    commentLimit: 2000,
    features: [
      '3 platform connections',
      '2,000 comments/month',
      'Copilot + Autopilot modes',
      'Advanced voice calibration',
      'Audience intelligence dashboard',
      'Weekly insights email',
      'Priority email support',
    ],
    cta: 'Start Free Trial',
    featured: true,
    color: 'border-[#4de1dc]/60 ghost-glow bg-gradient-to-b from-[#141e2e]/95 via-[#121624]/95 to-[#161228]/95',
  },
  {
    id: 'pro',
    name: 'Pro',
    badge: null,
    target: 'For established creators (100K–1M subscribers)',
    monthlyPrice: 199,
    annualPrice: 159,
    commentLimit: 10000,
    features: [
      'Unlimited platform connections',
      '10,000 comments/month',
      'All modes (Copilot, Autopilot, Guardian)',
      'Custom voice training',
      'Advanced audience intelligence',
      'Content opportunity alerts',
      'API access',
      'Priority chat support',
    ],
    cta: 'Start Free Trial',
    featured: false,
    color: 'border-white/10 hover:border-[#818cf8]/40',
  },
  {
    id: 'studio',
    name: 'Studio',
    badge: 'Enterprise / Teams',
    target: 'For creator teams, agencies, podcasts & media companies',
    monthlyPrice: 499,
    annualPrice: 399,
    commentLimit: 50000,
    features: [
      'Everything in Pro',
      'Multi-seat (up to 10 users)',
      'White-label option',
      'Dedicated success manager',
      'Custom integrations',
      'SLA: 99.9% uptime',
      'Quarterly business reviews',
    ],
    cta: 'Talk to Us',
    featured: false,
    color: 'border-white/10 hover:border-[#c084fc]/40',
  },
];

const comparisonRows = [
  { feature: 'Monthly Price (Annual)', starter: '$39/mo', creator: '$79/mo', pro: '$159/mo', studio: '$399/mo' },
  { feature: 'Monthly Price (Monthly)', starter: '$49/mo', creator: '$99/mo', pro: '$199/mo', studio: '$499/mo' },
  { feature: 'Platforms', starter: '1', creator: '3', pro: 'Unlimited', studio: 'Unlimited' },
  { feature: 'Comments/month', starter: '500', creator: '2,000', pro: '10,000', studio: 'Unlimited' },
  { feature: 'Copilot mode', starter: true, creator: true, pro: true, studio: true },
  { feature: 'Autopilot mode', starter: false, creator: true, pro: true, studio: true },
  { feature: 'Guardian mode', starter: false, creator: false, pro: true, studio: true },
  { feature: 'Voice calibration', starter: 'Basic', creator: 'Advanced', pro: 'Custom', studio: 'Custom' },
  { feature: 'Audience intelligence', starter: false, creator: true, pro: 'Advanced', studio: 'Advanced' },
  { feature: 'Weekly insights email', starter: false, creator: true, pro: true, studio: true },
  { feature: 'Content opportunities', starter: false, creator: false, pro: true, studio: true },
  { feature: 'API access', starter: false, creator: false, pro: true, studio: true },
  { feature: 'Multi-seat', starter: false, creator: false, pro: false, studio: 'Up to 10' },
  { feature: 'White-label', starter: false, creator: false, pro: false, studio: true },
  { feature: 'Support', starter: 'Email', creator: 'Priority email', creatorHighlight: true, pro: 'Priority chat', studio: 'Dedicated manager' },
  { feature: 'SLA Guarantee', starter: false, creator: false, pro: false, studio: '99.9% uptime' },
];

const faqs = [
  {
    q: 'Can I switch plans later?',
    a: 'Yes. You can upgrade or downgrade anytime with seamless prorated billing.',
  },
  {
    q: 'What happens if I exceed my comment limit?',
    a: "We'll notify you at 80% usage. You can upgrade or purchase additional comments anytime at $10 per 1,000 comments without service interruption.",
  },
  {
    q: 'Do you offer discounts for annual plans?',
    a: 'Yes. You save 20% when you pay annually, which equals 2 full months free every year.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes. Every tier comes with a 14-day free trial with no credit card required. You get full access to all features in your selected tier.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel anytime with a single click in your workspace settings. There are no cancellation fees or lock-ins.',
  },
  {
    q: 'Do you offer student or non-profit discounts?',
    a: 'Yes! We offer 50% off for verified students, educators, and registered non-profits. Simply reach out to support.',
  },
];

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState('annual'); // 'annual' | 'monthly'
  const [weeklyComments, setWeeklyComments] = useState(400);
  const [hourlyRate, setHourlyRate] = useState(50);
  const [openFaq, setOpenFaq] = useState(null);

  // ROI Calculator Calculations
  const roiResults = useMemo(() => {
    // Average minutes saved per comment across spam, routine replies, and hostile triage ~ 3.5 minutes
    const hoursSavedPerWeek = Math.round(((weeklyComments * 3.5) / 60) * 10) / 10;
    const monthlyHoursSaved = Math.round(hoursSavedPerWeek * 4.33);
    const monthlyValue = Math.round(monthlyHoursSaved * hourlyRate);

    const monthlyComments = weeklyComments * 4.33;
    let recommendedPlan = tiers[1]; // default Creator
    if (monthlyComments <= 500) recommendedPlan = tiers[0];
    else if (monthlyComments <= 2000) recommendedPlan = tiers[1];
    else if (monthlyComments <= 10000) recommendedPlan = tiers[2];
    else recommendedPlan = tiers[3];

    const planCost = billingCycle === 'annual' ? recommendedPlan.annualPrice : recommendedPlan.monthlyPrice;
    const netSavings = Math.max(0, monthlyValue - planCost);
    const roiMultiplier = planCost > 0 ? Math.round((monthlyValue / planCost) * 10) / 10 : 0;

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
              to="/app"
              className="text-xs font-semibold text-[#8f97b0] hover:text-white transition-colors px-2 py-1"
            >
              Interactive Demo
            </Link>
            <Button asChild size="sm">
              <Link to="/app">Launch App</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="mx-auto max-w-6xl px-5 pt-14 pb-16 sm:pt-20 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#4de1dc]/10 border border-[#4de1dc]/30 text-xs text-[#4de1dc] font-semibold">
          <Sparkles size={13} /> Transparent Pricing · 14-Day Free Trial
        </div>

        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl text-white font-bold tracking-tight">
          Simple pricing. <span className="text-gradient-guardian">Real ROI.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#8f97b0] leading-relaxed">
          Ghost Guardian pays for itself in the first week. Most creators save 5+ hours per week while
          protecting their attention and staying genuinely connected.
        </p>

        {/* Billing Toggle (Annual Default) */}
        <div className="pt-4 flex items-center justify-center">
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-[#121624] border border-white/10 shadow-lg">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-[#1e2235] text-white shadow'
                  : 'text-[#8f97b0] hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-[#4de1dc] text-black font-bold shadow-[0_0_15px_rgba(77,225,220,0.3)]'
                  : 'text-[#8f97b0] hover:text-white'
              }`}
            >
              <span>Annual</span>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                  billingCycle === 'annual'
                    ? 'bg-black/20 text-black'
                    : 'bg-[#34d399]/20 text-[#34d399]'
                }`}
              >
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* PRICING TIERS GRID */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => {
            const price = billingCycle === 'annual' ? tier.annualPrice : tier.monthlyPrice;
            const isFeatured = tier.featured;

            return (
              <div
                key={tier.id}
                className={`ghost-panel p-6 sm:p-7 flex flex-col justify-between space-y-6 transition-all relative ${
                  tier.color
                } ${isFeatured ? 'scale-[1.02] shadow-[0_0_40px_rgba(77,225,220,0.15)] z-10' : ''}`}
              >
                {/* Popular Badge */}
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isFeatured
                          ? 'bg-[#4de1dc] text-black shadow-md'
                          : 'bg-[#1e2235] text-[#c084fc] border border-[#c084fc]/30'
                      }`}
                    >
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-display text-xl text-white font-bold">{tier.name}</h3>
                    <p className="text-xs text-[#8f97b0] mt-1 min-h-[32px] leading-relaxed">
                      {tier.target}
                    </p>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-4xl sm:text-5xl font-bold text-white">
                        ${price}
                      </span>
                      <span className="text-xs text-[#8f97b0]">/mo</span>
                    </div>
                    <span className="text-[11px] text-[#8f97b0] block mt-1">
                      {billingCycle === 'annual'
                        ? `Billed annually ($${price * 12}/yr)`
                        : 'Billed monthly'}
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="pt-4 border-t border-white/10 space-y-2.5 text-xs text-[#e4e7f1]">
                    {tier.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <Check
                          size={14}
                          className="text-[#34d399] shrink-0 mt-0.5"
                          strokeWidth={2.5}
                        />
                        <span className="leading-snug">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    asChild
                    size="md"
                    variant={isFeatured ? 'default' : 'outline'}
                    className={`w-full justify-center ${
                      isFeatured ? 'shadow-[0_0_20px_rgba(77,225,220,0.3)]' : ''
                    }`}
                  >
                    <Link to="/auth" className="gap-2">
                      <span>{tier.cta}</span>
                      <ArrowRight size={14} />
                    </Link>
                  </Button>
                  <span className="text-[10px] text-center text-[#8f97b0] block mt-2">
                    14-day free trial · No card required
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* INTERACTIVE ROI CALCULATOR */}
      <section className="mx-auto max-w-5xl px-5 py-16 border-t border-white/5">
        <div className="ghost-panel p-8 sm:p-12 border-[#4de1dc]/30 bg-gradient-to-br from-[#121b24]/90 via-[#101424]/95 to-[#1c1830]/90 space-y-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#4de1dc]/15 text-[#4de1dc]">
                  <Calculator size={18} />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#4de1dc]">
                  Interactive Value Engine
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl text-white font-bold mt-1">
                Calculate Your Return on Investment
              </h2>
            </div>
            <Chip variant="positive" className="text-xs font-mono">
              ⚡ {roiResults.roiMultiplier}x Return
            </Chip>
          </div>

          <div className="grid gap-8 lg:grid-cols-12 items-center">
            {/* Sliders Column */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex justify-between items-center text-xs font-bold uppercase text-[#8f97b0] mb-2">
                  <span>Your Weekly Comments</span>
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
                  onChange={(e) => setWeeklyComments(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-[#0d0f17] accent-[#4de1dc] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#8f97b0] mt-1 font-mono">
                  <span>50</span>
                  <span>1,000</span>
                  <span>2,500</span>
                  <span>5,000+</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-bold uppercase text-[#8f97b0] mb-2">
                  <span>Your Hourly Attention Valuation</span>
                  <span className="text-base font-display font-bold text-[#34d399]">
                    ${hourlyRate}/hr
                  </span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="200"
                  step="5"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-[#0d0f17] accent-[#34d399] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#8f97b0] mt-1 font-mono">
                  <span>$25/hr</span>
                  <span>$50/hr</span>
                  <span>$100/hr</span>
                  <span>$200/hr</span>
                </div>
              </div>
            </div>

            {/* Results Card */}
            <div className="lg:col-span-6">
              <div className="p-6 rounded-2xl bg-[#0b0e17]/90 border border-white/10 space-y-4">
                <div className="grid grid-cols-2 gap-3 pb-4 border-b border-white/10">
                  <div className="p-3 rounded-xl bg-[#141829] border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-[#8f97b0] block">
                      Time Saved
                    </span>
                    <span className="text-xl font-display font-bold text-white mt-0.5 block">
                      {roiResults.hoursSavedPerWeek} hrs/wk
                    </span>
                    <span className="text-[10px] text-[#8f97b0]">
                      ~{roiResults.monthlyHoursSaved} hrs/mo
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#141829] border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-[#8f97b0] block">
                      Monthly Attention Value
                    </span>
                    <span className="text-xl font-display font-bold text-[#34d399] mt-0.5 block">
                      ${roiResults.monthlyValue.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#8f97b0]">at ${hourlyRate}/hr rate</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-[#8f97b0] leading-relaxed">
                  <p>
                    Recommended Tier:{' '}
                    <strong className="text-[#4de1dc] font-bold">
                      {roiResults.recommendedPlan.name} (${roiResults.planCost}/mo)
                    </strong>
                  </p>
                  <p className="text-white font-medium">
                    "If you spend ~{roiResults.hoursSavedPerWeek} hours/week on comments at ${hourlyRate}
                    /hr, that's ${roiResults.monthlyValue.toLocaleString()}/month in attention value.{' '}
                    {roiResults.recommendedPlan.name} plan saves you $
                    {roiResults.netSavings.toLocaleString()}/month. That's a{' '}
                    <strong className="text-[#34d399] font-bold">{roiResults.roiMultiplier}x return</strong>
                    ."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="mx-auto max-w-6xl px-5 py-16 border-t border-white/5">
        <div className="space-y-3 mb-10 text-center">
          <span className="text-xs font-bold tracking-[0.2em] text-[#4de1dc] uppercase">
            Feature Breakdown
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-white font-bold">
            Compare All Tier Features
          </h2>
          <p className="text-sm text-[#8f97b0]">
            Detailed capabilities matrix across all four Ghost Guardian operating tiers.
          </p>
        </div>

        <div className="ghost-panel overflow-hidden border-white/10 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#e4e7f1] min-w-[650px]">
              <thead>
                <tr className="border-b border-white/10 bg-[#121625]">
                  <th className="p-4 font-display text-sm font-bold text-white w-1/3">Feature</th>
                  <th className="p-4 font-display text-sm font-bold text-white text-center">Starter</th>
                  <th className="p-4 font-display text-sm font-bold text-[#4de1dc] text-center bg-[#4de1dc]/5">
                    Creator
                  </th>
                  <th className="p-4 font-display text-sm font-bold text-white text-center">Pro</th>
                  <th className="p-4 font-display text-sm font-bold text-white text-center">Studio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {comparisonRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-white/[0.02] transition-colors ${
                      idx % 2 === 0 ? 'bg-[#0d0f17]/40' : 'bg-transparent'
                    }`}
                  >
                    <td className="p-4 font-medium text-white">{row.feature}</td>

                    {/* Starter Column */}
                    <td className="p-4 text-center text-[#8f97b0]">
                      {typeof row.starter === 'boolean' ? (
                        row.starter ? (
                          <Check size={16} className="text-[#34d399] mx-auto" />
                        ) : (
                          <span className="text-white/20">—</span>
                        )
                      ) : (
                        row.starter
                      )}
                    </td>

                    {/* Creator Column (Highlighted) */}
                    <td className="p-4 text-center font-semibold text-white bg-[#4de1dc]/5">
                      {typeof row.creator === 'boolean' ? (
                        row.creator ? (
                          <Check size={16} className="text-[#34d399] mx-auto" />
                        ) : (
                          <span className="text-white/20">—</span>
                        )
                      ) : (
                        row.creator
                      )}
                    </td>

                    {/* Pro Column */}
                    <td className="p-4 text-center text-[#8f97b0]">
                      {typeof row.pro === 'boolean' ? (
                        row.pro ? (
                          <Check size={16} className="text-[#34d399] mx-auto" />
                        ) : (
                          <span className="text-white/20">—</span>
                        )
                      ) : (
                        row.pro
                      )}
                    </td>

                    {/* Studio Column */}
                    <td className="p-4 text-center text-[#8f97b0]">
                      {typeof row.studio === 'boolean' ? (
                        row.studio ? (
                          <Check size={16} className="text-[#34d399] mx-auto" />
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

      {/* PROMINENT 30-DAY MONEY-BACK GUARANTEE */}
      <section className="mx-auto max-w-4xl px-5 py-12">
        <div className="ghost-panel p-8 sm:p-10 border-[#34d399]/40 bg-gradient-to-r from-[#12221e]/90 via-[#101924]/95 to-[#1c1830]/90 flex flex-col sm:flex-row items-center gap-6 shadow-xl">
          <div className="size-16 rounded-2xl bg-[#34d399]/15 text-[#34d399] flex items-center justify-center shrink-0">
            <ShieldCheck size={32} />
          </div>
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="font-display text-xl sm:text-2xl text-white font-bold">
              30-day money-back guarantee
            </h3>
            <p className="text-xs sm:text-sm text-[#8f97b0] leading-relaxed">
              Try Ghost Guardian risk-free. If you're not saving time and protecting your mental health
              in the first 30 days, we'll refund you in full. No questions asked.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="mx-auto max-w-4xl px-5 py-16 border-t border-white/5">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-bold tracking-[0.2em] text-[#8f97b0] uppercase">
            Billing & Plans
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
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
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

      {/* FINAL CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="ghost-panel ghost-glow p-8 text-center sm:p-16 space-y-6 border-[#4de1dc]/40 bg-gradient-to-r from-[#141829]/95 via-[#131726]/95 to-[#1c1830]/95">
          <h2 className="font-display text-3xl sm:text-5xl text-white font-bold">
            Start your 14-day free trial
          </h2>
          <p className="text-sm sm:text-base text-[#8f97b0] max-w-lg mx-auto leading-relaxed">
            No credit card required. Full access. Cancel anytime.
          </p>

          <div className="flex flex-wrap justify-center gap-3.5 pt-2">
            <Button asChild size="lg" className="shadow-[0_0_30px_rgba(77,225,220,0.3)]">
              <Link to="/auth">Start Free Trial</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/app">Watch the Demo</Link>
            </Button>
          </div>

          <p className="text-xs text-[#8f97b0] pt-2">
            Join 500+ creators who are already creating without fear.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#080a10] px-5 py-8 text-center text-xs text-[#8f97b0]">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Ghost Guardian © 2026. All rights reserved.</span>
          <span>14-day free trial on all plans. No credit card required.</span>
        </div>
      </footer>
    </div>
  );
}
