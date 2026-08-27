import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, MessageCircle, Brain, Heart, AlertTriangle, Zap, Eye, Ghost, ArrowRight, Check, Sparkles, Lock, Users, ChevronRight, Star, TrendingUp, MessageSquare, Mic } from 'lucide-react';

const commentTypes = [
  { type: 'Praise', color: 'var(--emerald-400)', comment: '"I\'ve followed this show for three years and this episode completely changed how I think."', response: '"Three years! That\'s awesome. Hearing that this shifted something means a lot. What part hit you the hardest?"', icon: Heart },
  { type: 'Question', color: 'var(--sky-400)', comment: '"Can you explain what you meant around the 42-minute mark?"', response: '"Good question. Around that mark, the discussion was about substrate independence — whether consciousness requires biology or can exist in any sufficiently complex system."', icon: MessageCircle },
  { type: 'Criticism', color: 'var(--amber-400)', comment: '"I usually love the show, but I think you oversimplified this."', response: '"That\'s fair criticism. What part do you think got oversimplified? That\'s a much more useful conversation."', icon: Star },
  { type: 'Trolling', color: 'var(--orange-400)', comment: '"This is the dumbest shit I\'ve ever watched."', response: '"You may be right that it\'s not for you. But if you can turn the frustration into an actual argument, we\'re listening."', icon: Zap },
  { type: 'Threat', color: 'var(--rose-400)', comment: '"Someone should find where you live."', response: '⚠️ HUMAN ATTENTION REQUIRED — Escalated to creator immediately. Comment flagged, evidence preserved.', icon: AlertTriangle },
];

export default function Landing() {
  const navigate = useNavigate();
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [activeComment, setActiveComment] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveComment(prev => (prev + 1) % commentTypes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const isVisible = (id) => visibleSections.has(id);

  return (
    <div style={{ background: 'var(--bg-void)', minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: 'var(--space-4) var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(6, 6, 11, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-600), var(--primary-400))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ghost size={18} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>Ghost Guardian</span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button onClick={() => navigate('/pricing')} className="btn btn-ghost btn-sm">Pricing</button>
          <button onClick={() => navigate('/auth')} className="btn btn-secondary btn-sm">Sign In</button>
          <button onClick={() => navigate('/auth?demo=true')} className="btn btn-primary btn-sm">Try Demo</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="animate-fade-in-up" style={{ marginBottom: 'var(--space-4)' }}>
            <span className="badge badge-primary badge-lg" style={{ marginBottom: 'var(--space-6)', display: 'inline-flex' }}>
              <Shield size={14} /> AI Community Guardian
            </span>
          </div>
          <h1 className="hero-title animate-fade-in-up delay-1">GHOST GUARDIAN</h1>
          <p className="hero-tagline animate-fade-in-up delay-2">
            Your audience is talking. We've got your back.
          </p>
          <p className="animate-fade-in-up delay-3" style={{ color: 'var(--text-tertiary)', maxWidth: 520, margin: '0 auto var(--space-8)', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)' }}>
            Ghost Guardian is an AI community guardian for creators who want to stay connected
            to their audience without giving the internet unlimited access to their time and energy.
          </p>
          <div className="hero-cta animate-fade-in-up delay-4">
            <button onClick={() => navigate('/auth?demo=true')} className="btn btn-primary btn-xl" style={{ gap: 'var(--space-3)' }}>
              Meet Your Guardian <ArrowRight size={18} />
            </button>
            <button onClick={() => {
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }} className="btn btn-secondary btn-xl">
              See How It Works
            </button>
          </div>
        </div>
        <div className="ghost-orb" style={{ top: '20%', left: '10%' }} />
        <div className="ghost-orb" style={{ bottom: '20%', right: '10%', animationDelay: '1.5s' }} />
      </section>

      {/* The Internet Is Loud */}
      <section id="loud" data-animate className="landing-section" style={{ textAlign: 'center' }}>
        <div className={isVisible('loud') ? 'animate-fade-in-up' : ''} style={{ opacity: isVisible('loud') ? 1 : 0 }}>
          <h2>THE INTERNET IS LOUD.</h2>
          <p style={{ margin: '0 auto var(--space-8)' }}>
            Creators shouldn't have to personally absorb every comment.
            Not every message deserves the same energy. Not every criticism is abuse.
            Not every compliment is meaningful. And some things require immediate attention.
          </p>
          <p style={{ margin: '0 auto', color: 'var(--text-tertiary)' }}>
            Ghost Guardian understands the difference.
          </p>
        </div>
      </section>

      {/* Comment Types Showcase */}
      <section id="how-it-works" data-animate className="landing-section">
        <div className={isVisible('how-it-works') ? 'animate-fade-in-up' : ''} style={{ opacity: isVisible('how-it-works') ? 1 : 0 }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <h2>NOT EVERY COMMENT DESERVES<br/>THE SAME RESPONSE.</h2>
            <p style={{ margin: '0 auto' }}>Ghost Guardian classifies, understands, and responds to each comment with the intelligence it deserves.</p>
          </div>

          {/* Comment type tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
            {commentTypes.map((ct, i) => (
              <button
                key={ct.type}
                onClick={() => setActiveComment(i)}
                className={`btn btn-sm ${activeComment === i ? '' : 'btn-ghost'}`}
                style={activeComment === i ? { background: ct.color + '20', color: ct.color, border: `1px solid ${ct.color}40` } : {}}
              >
                <ct.icon size={14} /> {ct.type}
              </button>
            ))}
          </div>

          {/* Active comment display */}
          <div className="card card-glass" style={{ maxWidth: 700, margin: '0 auto', padding: 'var(--space-8)' }}>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                <div className="risk-dot" style={{ background: commentTypes[activeComment].color }} />
                <span className="badge" style={{ background: commentTypes[activeComment].color + '20', color: commentTypes[activeComment].color }}>
                  {commentTypes[activeComment].type}
                </span>
              </div>
              <p style={{ fontSize: 'var(--text-lg)', fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                {commentTypes[activeComment].comment}
              </p>
            </div>
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <Ghost size={14} style={{ color: 'var(--primary-400)' }} />
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--primary-400)' }}>Ghost Guardian Response</span>
              </div>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)', lineHeight: 'var(--leading-relaxed)' }}>
                {commentTypes[activeComment].response}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Your Voice Your Rules */}
      <section id="voice" data-animate className="landing-section" style={{ textAlign: 'center' }}>
        <div className={isVisible('voice') ? 'animate-fade-in-up' : ''} style={{ opacity: isVisible('voice') ? 1 : 0 }}>
          <h2>YOUR VOICE. YOUR RULES.</h2>
          <p style={{ margin: '0 auto var(--space-10)' }}>
            Ghost Guardian doesn't replace you. It learns how you communicate — your tone, your humor,
            your boundaries — and generates responses that sound like you wrote them. Because the creator
            should remain the person people came to hear.
          </p>
          <div className="grid-auto" style={{ maxWidth: 800, margin: '0 auto' }}>
            {[
              { icon: Mic2, title: 'Voice Training', desc: 'Teach your Guardian how you speak by approving, editing, and saving examples.' },
              { icon: Shield, title: 'Custom Boundaries', desc: 'Set topics to avoid, subjects requiring approval, and lines that should never be crossed.' },
              { icon: Sparkles, title: 'Guardian Wit', desc: 'Enable intelligent, composed responses that outclass hostility without becoming hostile.' },
            ].map(f => (
              <div key={f.title} className="card" style={{ textAlign: 'left' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-3)', color: 'var(--primary-400)' }}>
                  <f.icon size={20} />
                </div>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>{f.title}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Defend Without Becoming The Troll */}
      <section id="philosophy" data-animate className="landing-section" style={{ textAlign: 'center' }}>
        <div className={isVisible('philosophy') ? 'animate-fade-in-up' : ''} style={{ opacity: isVisible('philosophy') ? 1 : 0 }}>
          <h2 style={{ background: 'linear-gradient(135deg, var(--primary-300), var(--amber-400))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            DEFEND WITHOUT<br/>BECOMING THE TROLL.
          </h2>
          <p style={{ margin: '0 auto var(--space-8)' }}>
            Ghost Guardian doesn't fight. It doesn't insult. It doesn't humiliate.
            It understands the difference between disagreement and abuse,
            between criticism and cruelty. And it responds accordingly.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'var(--space-3)', maxWidth: 700, margin: '0 auto' }}>
            {[
              'Curiosity before judgment',
              'Connection before correction',
              'Compassion without submission',
              'Boundaries without cruelty',
              'Humor without humiliation',
              'Intelligence without arrogance',
              'Silence when silence is wiser',
            ].map(p => (
              <span key={p} className="badge badge-neutral badge-lg" style={{ padding: 'var(--space-2) var(--space-4)' }}>{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Audience Intelligence */}
      <section id="intelligence" data-animate className="landing-section" style={{ textAlign: 'center' }}>
        <div className={isVisible('intelligence') ? 'animate-fade-in-up' : ''} style={{ opacity: isVisible('intelligence') ? 1 : 0 }}>
          <h2>YOUR AUDIENCE IS TRYING TO<br/>TELL YOU SOMETHING.</h2>
          <p style={{ margin: '0 auto var(--space-10)' }}>
            Ghost Guardian doesn't just respond to comments — it listens to your community.
            It surfaces patterns, recurring questions, emerging topics, and content opportunities
            you'd never find reading comments one at a time.
          </p>
          <div className="grid-auto" style={{ maxWidth: 900, margin: '0 auto' }}>
            {[
              { icon: TrendingUp, title: 'Emerging Topics', desc: 'Discover what subjects are gaining traction before they trend.' },
              { icon: MessageSquare, title: 'Recurring Questions', desc: '83 people asked variations of the same question. Now you know.' },
              { icon: Sparkles, title: 'Content Opportunities', desc: 'Your audience is requesting a follow-up episode. Here\'s the data.' },
              { icon: Users, title: 'Community Health', desc: 'Track constructive discussion vs. hostility. Know your community\'s mood.' },
            ].map(f => (
              <div key={f.title} className="card" style={{ textAlign: 'left' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-3)', color: 'var(--primary-400)' }}>
                  <f.icon size={20} />
                </div>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>{f.title}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Create Without Fear */}
      <section id="create" data-animate className="landing-section" style={{ textAlign: 'center' }}>
        <div className={isVisible('create') ? 'animate-fade-in-up' : ''} style={{ opacity: isVisible('create') ? 1 : 0 }}>
          <h2>YOU SHOULD CREATE.</h2>
          <p style={{ margin: '0 auto var(--space-6)', fontSize: 'var(--text-xl)', color: 'var(--text-secondary)' }}>
            There are people who have something beautiful to give the world
            who never give it because they're afraid of what people will say.
          </p>
          <p style={{ margin: '0 auto var(--space-8)', color: 'var(--text-tertiary)' }}>
            Ghost Guardian exists to help change that. Not by hiding the world from creators.
            Not by attacking critics. But by helping creators distinguish conversation from cruelty,
            criticism from abuse, and what deserves their energy from what doesn't.
          </p>
          <span className="badge badge-primary badge-lg" style={{ padding: 'var(--space-2) var(--space-5)' }}>
            Create Without Fear — Coming Soon
          </span>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: 'var(--space-24) var(--space-6)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="ghost-orb" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, height: 400, opacity: 0.1 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, var(--text-4xl))', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 'var(--space-4)' }}>
            You create.<br/>
            <span className="gradient-text">Ghost Guardian has your back.</span>
          </h2>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-8)', maxWidth: 440, margin: '0 auto var(--space-8)' }}>
            Join the creators who never worry about their comments again.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/auth?demo=true')} className="btn btn-primary btn-xl">
              Meet Your Guardian <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/pricing')} className="btn btn-secondary btn-xl">
              View Pricing
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: 'var(--space-8) var(--space-6)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <Ghost size={16} style={{ color: 'var(--primary-400)' }} />
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Ghost Guardian</span>
        </div>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          Defend the creator without becoming the troll. © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

function Mic2(props) {
  return <Mic {...props} />;
}
