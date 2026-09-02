import React from 'react';
import { Shield } from 'lucide-react';

export function GhostMark({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl border border-[#0A00FF]/50 bg-[#0a0a0a] text-[#0A00FF] shadow-[0_0_20px_rgba(10,0,255,0.45),inset_0_1px_0_rgba(255,255,255,0.2)] ${className}`}
      style={{ width: '2.25rem', height: '2.25rem' }}
    >
      <Shield size={18} strokeWidth={2.2} />
    </span>
  );
}

export function Chip({
  children,
  variant = 'muted',
  className = '',
}) {
  const styles = {
    muted: 'bg-[#0a0a0a] text-white border-white/10',
    outline: 'bg-transparent text-[#a0a0a0] border-white/10',
    guardian: 'bg-[#0A00FF]/15 text-[#0A00FF] border-[#0A00FF]/40 shadow-[0_0_14px_rgba(10,0,255,0.25)]',
    attention: 'bg-[#FF6A00]/15 text-[#FF6A00] border-[#FF6A00]/40 shadow-[0_0_14px_rgba(255,106,0,0.25)]',
    critical: 'bg-[#FF1400]/15 text-[#FF2A00] border-[#FF1400]/40 shadow-[0_0_14px_rgba(255,20,0,0.25)]',
    positive: 'bg-[#00FF66]/15 text-[#00FF66] border-[#00FF66]/40 shadow-[0_0_14px_rgba(0,255,102,0.25)]',
    human: 'bg-[#FF007A]/15 text-[#FF007A] border-[#FF007A]/40 shadow-[0_0_14px_rgba(255,0,122,0.25)]',
    shield: 'bg-[#7A00FF]/15 text-[#A000FF] border-[#7A00FF]/40 shadow-[0_0_14px_rgba(122,0,255,0.25)]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-[11px] font-mono font-bold tracking-wider uppercase ${styles[variant] || styles.muted} ${className}`}
    >
      {children}
    </span>
  );
}

export function RiskChip({ risk }) {
  const variant = {
    low: 'positive',
    medium: 'attention',
    high: 'critical',
    critical: 'critical',
  }[risk] || 'muted';

  return (
    <Chip variant={variant}>
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          backgroundColor:
            risk === 'low'
              ? '#00FF66'
              : risk === 'medium'
              ? '#FF6A00'
              : '#FF1400',
          boxShadow:
            risk === 'low'
              ? '0 0 8px #00FF66'
              : risk === 'medium'
              ? '0 0 8px #FF6A00'
              : '0 0 8px #FF1400',
        }}
      />
      {risk} risk
    </Chip>
  );
}

export function RuleSignalChip({ signal }) {
  const map = {
    strong_match: { label: 'Strong match', variant: 'guardian' },
    match: { label: 'Match', variant: 'muted' },
    weak_match: { label: 'Weak match', variant: 'outline' },
    needs_review: { label: 'Needs review', variant: 'attention' },
  };

  const current = map[signal] || { label: 'Match', variant: 'muted' };

  return (
    <Chip variant={current.variant}>
      <span
        style={{
          width: 4,
          height: 4,
          borderRadius: '50%',
          backgroundColor:
            current.variant === 'guardian'
              ? '#0A00FF'
              : current.variant === 'attention'
              ? '#FF6A00'
              : '#a0a0a0',
        }}
      />
      {current.label}
    </Chip>
  );
}

export function HumanMomentChip({ className = '' }) {
  return (
    <Chip variant="human" className={`shadow-[0_0_16px_rgba(255,0,122,0.35)] ${className}`}>
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          backgroundColor: '#FF007A',
          boxShadow: '0 0 8px #FF007A',
        }}
      />
      Human Moment
    </Chip>
  );
}

export function PriorityChip({ priority, className = '' }) {
  const map = {
    1: { label: 'Human Moment', variant: 'human' },
    2: { label: 'Critical Safety', variant: 'critical' },
    3: { label: 'Sensitive Disclosure', variant: 'human' },
    4: { label: 'High Engagement', variant: 'attention' },
    5: { label: 'Question', variant: 'guardian' },
    6: { label: 'Routine', variant: 'muted' },
    7: { label: 'Silence Recommended', variant: 'outline' },
    8: { label: 'Shielded Hostile', variant: 'critical' },
  };

  const item = map[priority] || { label: 'Priority', variant: 'muted' };
  return (
    <Chip variant={item.variant} className={className}>
      {item.label}
    </Chip>
  );
}

const severeClasses = ['HARASSMENT', 'HATE', 'THREAT', 'TROLLING', 'SPAM', 'SCAM'];

export function ClassificationChip({ value }) {
  const isSevere = severeClasses.includes(value);
  const isSensitive = value === 'SENSITIVE';
  const variant = isSevere ? 'critical' : isSensitive ? 'human' : 'guardian';
  return (
    <Chip variant={variant}>
      {String(value || '').replace(/_/g, ' ')}
    </Chip>
  );
}

export function StrategyChip({ value }) {
  return <Chip variant="outline">{value}</Chip>;
}

export function ActionChip({ value }) {
  const severe = value === 'escalate' || value === 'report' || value === 'hide' || value === 'human_review';
  const isSilence = value === 'silence';
  return (
    <Chip variant={severe ? 'attention' : isSilence ? 'outline' : 'muted'}>
      {String(value || '').replace(/_/g, ' ')}
    </Chip>
  );
}

export function StatBlock({
  label,
  value,
  hint,
  tone = 'default',
}) {
  const toneStyle = {
    default: 'text-white',
    attention: 'text-[#FF6A00] drop-shadow-[0_0_12px_rgba(255,106,0,0.5)]',
    critical: 'text-[#FF2A00] drop-shadow-[0_0_12px_rgba(255,20,0,0.5)]',
    positive: 'text-[#00FF66] drop-shadow-[0_0_12px_rgba(0,255,102,0.5)]',
  }[tone] || 'text-white';

  return (
    <div className="ghost-panel p-5 space-y-2">
      <p className="text-[11px] tracking-widest text-[#a0a0a0] uppercase font-mono font-semibold">{label}</p>
      <p className={`font-display text-2xl sm:text-3xl font-extrabold ${toneStyle}`}>{value}</p>
      {hint ? <p className="text-xs text-[#a0a0a0]">{hint}</p> : null}
    </div>
  );
}

export function SectionTitle({
  title,
  subtitle,
  action,
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-xl sm:text-2xl text-white tracking-wide uppercase font-bold">{title}</h2>
        {subtitle ? <p className="mt-1 text-xs sm:text-sm text-[#a0a0a0]">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ children }) {
  return (
    <div className="ghost-panel p-8 text-center text-sm text-[#a0a0a0]">
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = 'default',
  size = 'md',
  onClick,
  disabled,
  className = '',
  type = 'button',
  asChild,
  ...props
}) {
  // Reactor-core buttons: military-grade, pressurized, dimensional beveled frames, internal plasma glow
  const variants = {
    default: 'bg-[#0a0a0a] text-white border border-[#0A00FF] shadow-[0_0_18px_rgba(10,0,255,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-[#0200F1] hover:border-[#0A00FF] hover:shadow-[0_0_28px_rgba(10,0,255,0.7),inset_0_1px_0_rgba(255,255,255,0.4)]',
    primary: 'bg-[#0200F1] text-white border border-[#0A00FF] shadow-[0_0_24px_rgba(10,0,255,0.5),inset_0_1px_0_rgba(255,255,255,0.4)] hover:bg-[#0A00FF] hover:shadow-[0_0_36px_rgba(10,0,255,0.8)]',
    outline: 'bg-[#0a0a0a] border border-white/15 text-white hover:border-[#0A00FF] hover:shadow-[0_0_16px_rgba(10,0,255,0.35)]',
    secondary: 'bg-[#0a0a0a] hover:bg-[#141414] text-[#a0a0a0] hover:text-white border border-white/10',
    destructive: 'bg-[#0a0a0a] text-[#FF2A00] border border-[#FF1400] shadow-[0_0_18px_rgba(255,20,0,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] hover:bg-[#FF1400] hover:text-white hover:shadow-[0_0_28px_rgba(255,20,0,0.7)]',
    ghost: 'bg-transparent text-[#a0a0a0] hover:text-white hover:bg-white/5 border-transparent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-xs sm:text-sm rounded-lg gap-2',
    lg: 'px-6 py-3 text-sm sm:text-base rounded-lg gap-2.5 font-bold',
    icon: 'p-2 rounded-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-display font-bold uppercase tracking-wider transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ value, onChange, placeholder, className = '', type = 'text', ...props }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-3.5 py-2 text-sm text-white placeholder:text-[#a0a0a0]/50 focus:border-[#0A00FF] focus:outline-none focus:ring-1 focus:ring-[#0A00FF] transition-colors font-mono ${className}`}
      {...props}
    />
  );
}

export function Textarea({ value, onChange, placeholder, rows = 3, className = '', ...props }) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-3.5 py-2.5 text-sm text-white placeholder:text-[#a0a0a0]/50 focus:border-[#0A00FF] focus:outline-none focus:ring-1 focus:ring-[#0A00FF] transition-colors resize-y ${className}`}
      {...props}
    />
  );
}

export function Switch({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-white/20 transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? 'bg-[#0A00FF] shadow-[0_0_15px_#0A00FF]' : 'bg-[#0a0a0a]'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export function Slider({ value = [50], max = 100, step = 5, onChange }) {
  const val = value[0] ?? 50;
  return (
    <input
      type="range"
      min={0}
      max={max}
      step={step}
      value={val}
      onChange={(e) => onChange && onChange(Number(e.target.value))}
      className="w-full h-1.5 bg-[#141414] rounded-lg appearance-none cursor-pointer accent-[#0A00FF]"
    />
  );
}
