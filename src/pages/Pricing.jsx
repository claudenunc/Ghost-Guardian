import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Ghost, ArrowRight, Zap, Shield, Crown } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: 0,
    period: '',
    desc: 'Explore Ghost Guardian with limited features.',
    features: ['50 comments/month', 'Demo mode access', 'Basic classification', 'Manual approval only'],
    cta: 'Get Started',
    featured: false,
  },
  {
    name: 'Creator',
    price: 29,
    period: '/mo',
    desc: 'For individual active creators.',
    features: ['2,000 comments/month', 'Full AI classification', 'Voice training', 'Copilot + Autopilot modes', 'Audience Intelligence', 'Analytics dashboard', '1 platform connection', 'Email support'],
    cta: 'Start Creating',
    featured: false,
  },
  {
    name: 'Pro',
    price: 79,
    period: '/mo',
    desc: 'For high-volume creators and growing channels.',
    features: ['Unlimited comments', 'Advanced AI responses', 'Guardian Wit', 'All operating modes', 'Full Audience Intelligence', 'Advanced analytics + reports', 'Multiple platforms', 'Community tracking', 'Priority support'],
    cta: 'Go Pro',
    featured: true,
  },
  {
    name: 'Custom Guardian',
    price: null,
    period: '',
    desc: 'For major creators, podcasts, and media companies.',
    features: ['Everything in Pro', 'Custom AI voice training', 'Dedicated onboarding', 'Custom integrations', 'Team access', 'SLA guarantee', 'Personal account manager', 'We\'ll build your Guardian around you'],
    cta: 'Contact Us',
    featured: false,
  },
];

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <div style={{ background: 'var(--bg-void)', minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{ padding: 'var(--space-4) var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-600), var(--primary-400))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ghost size={18} color="white" />
          </div>
          <span style={{ fontWeight: 700 }}>Ghost Guardian</span>
        </div>
        <button onClick={() => navigate('/auth')} className="btn btn-primary btn-sm">Get Started</button>
      </nav>

      <div style={{ padding: 'var(--space-16) var(--space-6)', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 'var(--space-4)' }}>
            Simple, Transparent Pricing
          </h1>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
            Choose the plan that fits your audience. Upgrade, downgrade, or cancel anytime.
          </p>
        </div>

        <div className="pricing-grid">
          {plans.map(plan => (
            <div key={plan.name} className={`card pricing-card ${plan.featured ? 'featured' : ''}`}>
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>{plan.name}</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>{plan.desc}</p>
              <div className="pricing-amount">
                {plan.price !== null ? (
                  <>${plan.price}<span>{plan.period}</span></>
                ) : (
                  <span style={{ fontSize: 'var(--text-2xl)' }}>Custom</span>
                )}
              </div>
              <div className="pricing-features">
                {plan.features.map((f, i) => (
                  <div key={i} className="pricing-feature">
                    <Check size={16} className="check" /> {f}
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/auth')} className={`btn ${plan.featured ? 'btn-primary' : 'btn-secondary'} btn-lg`} style={{ width: '100%' }}>
                {plan.cta} <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Custom Guardian CTA */}
        <div className="card card-glow" style={{ marginTop: 'var(--space-12)', textAlign: 'center', padding: 'var(--space-10)' }}>
          <Crown size={32} style={{ color: 'var(--amber-400)', margin: '0 auto var(--space-4)' }} />
          <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
            We'll Build Your Guardian Around You
          </h3>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto var(--space-6)' }}>
            For larger creators and media companies, Ghost Guardian becomes a customized AI assistant
            trained on your approved content, transcripts, voice, and workflows.
          </p>
          <span className="badge badge-primary badge-lg">Coming Soon — Custom Creator Guardians</span>
        </div>
      </div>
    </div>
  );
}
