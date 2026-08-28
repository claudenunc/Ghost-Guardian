import React from 'react';
import { Shield } from 'lucide-react';

export function GhostMark({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl border border-white/10 bg-[#1e2235] text-[#4de1dc] shadow-[0_0_15px_rgba(77,225,220,0.2)] ${className}`}
      style={{ width: '2.25rem', height: '2.25rem' }}
    >
      <Shield size={18} strokeWidth={2} />
    </span>
  );
}

export function Chip({
  children,
  variant = 'muted',
  className = '',
}) {
  const styles = {
    muted: 'bg-[#1e2235] text-[#e4e7f1] border-white/5',
    outline: 'bg-transparent text-[#8f97b0] border-white/10',
    guardian: 'bg-[#4de1dc]/15 text-[#4de1dc] border-[#4de1dc]/30',
    attention: 'bg-[#fbbf24]/15 text-[#fbbf24] border-[#fbbf24]/30',
    critical: 'bg-[#f87171]/15 text-[#f87171] border-[#f87171]/30',
    positive: 'bg-[#34d399]/15 text-[#34d399] border-[#34d399]/30',
    human: 'bg-[#c084fc]/15 text-[#c084fc] border-[#c084fc]/35',
    shield: 'bg-[#818cf8]/15 text-[#818cf8] border-[#818cf8]/35',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${styles[variant] || styles.muted} ${className}`}
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
              ? '#34d399'
              : risk === 'medium'
              ? '#fbbf24'
              : '#f87171',
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
              ? '#4de1dc'
              : current.variant === 'attention'
              ? '#fbbf24'
              : '#8f97b0',
        }}
      />
      {current.label}
    </Chip>
  );
}

export function HumanMomentChip({ className = '' }) {
  return (
    <Chip variant="human" className={`shadow-[0_0_12px_rgba(192,132,252,0.15)] ${className}`}>
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          backgroundColor: '#c084fc',
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
    attention: 'text-[#fbbf24]',
    critical: 'text-[#f87171]',
    positive: 'text-[#34d399]',
  }[tone] || 'text-white';

  return (
    <div className="ghost-panel p-5">
      <p className="text-[11px] tracking-widest text-[#8f97b0] uppercase font-medium">{label}</p>
      <p className={`mt-2 font-display text-2xl sm:text-3xl ${toneStyle}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-[#8f97b0]">{hint}</p> : null}
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
        <h2 className="font-display text-xl sm:text-2xl text-white tracking-tight">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-[#8f97b0]">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ children }) {
  return (
    <div className="ghost-panel p-8 text-center text-sm text-[#8f97b0]">
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
  const variants = {
    default: 'bg-[#4de1dc] hover:bg-[#3bcac5] text-[#091a1a] font-semibold shadow-md',
    outline: 'bg-transparent border border-white/15 text-white hover:bg-white/5 hover:border-white/25',
    secondary: 'bg-[#1e2235] hover:bg-[#262b42] text-white border border-white/10',
    destructive: 'bg-[#f87171] hover:bg-[#ef4444] text-white font-semibold shadow-md',
    ghost: 'bg-transparent text-[#8f97b0] hover:text-white hover:bg-white/5 border-transparent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm rounded-xl gap-2',
    lg: 'px-6 py-3 text-base rounded-xl gap-2.5 font-semibold',
    icon: 'p-2 rounded-xl',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-sans transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
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
      className={`w-full rounded-xl border border-white/10 bg-[#0d0f17]/70 px-3.5 py-2 text-sm text-white placeholder:text-[#8f97b0]/50 focus:border-[#4de1dc] focus:outline-none focus:ring-1 focus:ring-[#4de1dc]/50 transition-colors ${className}`}
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
      className={`w-full rounded-xl border border-white/10 bg-[#0d0f17]/70 px-3.5 py-2.5 text-sm text-white placeholder:text-[#8f97b0]/50 focus:border-[#4de1dc] focus:outline-none focus:ring-1 focus:ring-[#4de1dc]/50 transition-colors resize-y ${className}`}
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
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? 'bg-[#4de1dc]' : 'bg-[#1e2235]'
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
      className="w-full h-1.5 bg-[#1e2235] rounded-lg appearance-none cursor-pointer accent-[#4de1dc]"
    />
  );
}
