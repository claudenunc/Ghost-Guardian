import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  Shield,
  Mail,
  FileText,
} from 'lucide-react';
import { Button } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';
import { calculateTimeSaved } from '../../domain/analytics/timeSaved';
import TimeSavedBreakdown from './TimeSavedBreakdown';
import WeeklyInsightsEmail from './WeeklyInsightsEmail';
import MonthlyReportEmail from './MonthlyReportEmail';

export default function TimeSavedWidget({
  variant = 'hero', // 'hero' | 'compact' | 'card'
  className = '',
}) {
  const { comments, commentStates, settings, questionClusters, topics, commenters } = useGuardian();
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [isWeeklyEmailOpen, setIsWeeklyEmailOpen] = useState(false);
  const [isMonthlyReportOpen, setIsMonthlyReportOpen] = useState(false);
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' | 'session'

  const hourlyRate = settings?.hourlyRate || 50;

  // Compute metrics for both monthly projection & live session
  const monthlyData = useMemo(() => {
    return calculateTimeSaved(comments, commentStates, hourlyRate, { useMonthlyProjection: true });
  }, [comments, commentStates, hourlyRate]);

  const sessionData = useMemo(() => {
    return calculateTimeSaved(comments, commentStates, hourlyRate, { useMonthlyProjection: false });
  }, [comments, commentStates, hourlyRate]);

  const activeData = viewMode === 'monthly' ? monthlyData : sessionData;
  const hours = activeData.totalHours;
  const dollarValue = activeData.dollarValue;

  const topQuestions = (questionClusters || []).map((q) => ({
    question: q.question,
    mentions: q.mentions,
    trend: q.trend,
  }));

  const activeCommenter = commenters?.[0] || null;

  return (
    <>
      {/* Time Saved Hero Widget */}
      <div
        className={`ghost-panel ghost-glow relative overflow-hidden border-[#4de1dc]/35 bg-gradient-to-br from-[#121929]/95 via-[#131726]/95 to-[#1c1830]/95 p-6 sm:p-8 transition-all hover:border-[#4de1dc]/50 ${className}`}
      >
        {/* Background Subtle Guardian Aura */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[#4de1dc]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 rounded-full bg-[#c084fc]/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Main Hero Metric Area */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#4de1dc]/15 text-[#4de1dc]">
                <Shield size={16} />
              </span>
              <span className="text-xs font-bold tracking-[0.2em] text-[#4de1dc] uppercase">
                Ghost Guardian saved you
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-white">
                  {hours} hours
                </span>
                <span className="text-base sm:text-xl text-[#8f97b0] font-normal">
                  {viewMode === 'monthly' ? 'this month' : 'this session'}
                </span>
              </div>

              <p className="text-base sm:text-lg text-[#34d399] font-medium pt-0.5">
                That's <strong className="font-display font-bold">${dollarValue.toLocaleString()}</strong> in your time.
              </p>
            </div>

            <p className="text-xs sm:text-sm text-[#8f97b0] max-w-xl leading-relaxed">
              Autonomous spam isolation, protective hostility shielding, and voice-aligned replies kept you connected without the cognitive drain.
            </p>
          </div>

          {/* Action CTAs and View Toggle */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0 w-full sm:w-auto">
            {/* View Mode Toggle */}
            <div className="flex rounded-xl bg-[#0a0d14]/70 p-1 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('monthly')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  viewMode === 'monthly'
                    ? 'bg-[#1e2235] text-[#4de1dc] shadow-sm'
                    : 'text-[#8f97b0] hover:text-white'
                }`}
              >
                Monthly Overview
              </button>
              <button
                type="button"
                onClick={() => setViewMode('session')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  viewMode === 'session'
                    ? 'bg-[#1e2235] text-[#4de1dc] shadow-sm'
                    : 'text-[#8f97b0] hover:text-white'
                }`}
              >
                Active Session
              </button>
            </div>

            {/* Primary Action Button */}
            <Button
              size="md"
              onClick={() => setIsBreakdownOpen(true)}
              className="gap-2 shadow-[0_0_20px_rgba(77,225,220,0.2)] hover:scale-[1.02] transition-transform"
            >
              <span>View Breakdown</span>
              <ArrowRight size={16} />
            </Button>

            {/* Quick Digest Links */}
            <div className="flex items-center gap-3 text-xs text-[#8f97b0] pt-1">
              <button
                type="button"
                onClick={() => setIsWeeklyEmailOpen(true)}
                className="hover:text-[#4de1dc] transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <Mail size={12} /> Weekly Email
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setIsMonthlyReportOpen(true)}
                className="hover:text-[#c084fc] transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <FileText size={12} /> Monthly Report
              </button>
            </div>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">🗑️</span>
            <div>
              <span className="text-[#8f97b0] block text-[10px] uppercase font-bold">Spam Filtered</span>
              <span className="text-white font-medium">
                {activeData.breakdown.spamFiltered?.count} comments
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-base">🤖</span>
            <div>
              <span className="text-[#8f97b0] block text-[10px] uppercase font-bold">Routine Drafts</span>
              <span className="text-white font-medium">
                {activeData.breakdown.routineReplies?.count} acknowledged
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-base">🛡️</span>
            <div>
              <span className="text-[#8f97b0] block text-[10px] uppercase font-bold">Hostile Shielded</span>
              <span className="text-[#818cf8] font-medium">
                {activeData.breakdown.hostileShielded?.count} concealed
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-base">🤍</span>
            <div>
              <span className="text-[#8f97b0] block text-[10px] uppercase font-bold">Human Moments</span>
              <span className="text-[#c084fc] font-medium">
                {activeData.breakdown.humanMomentsPreserved?.count} preserved
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Breakdown Modal */}
      <TimeSavedBreakdown
        isOpen={isBreakdownOpen}
        onClose={() => setIsBreakdownOpen(false)}
        timeSavedData={activeData}
        onOpenWeeklyEmail={() => {
          setIsBreakdownOpen(false);
          setIsWeeklyEmailOpen(true);
        }}
        onOpenMonthlyReport={() => {
          setIsBreakdownOpen(false);
          setIsMonthlyReportOpen(true);
        }}
      />

      {/* Weekly Insights Email Preview */}
      <WeeklyInsightsEmail
        isOpen={isWeeklyEmailOpen}
        onClose={() => setIsWeeklyEmailOpen(false)}
        timeSavedData={activeData}
        topQuestions={topQuestions}
      />

      {/* Monthly Report Email Preview */}
      <MonthlyReportEmail
        isOpen={isMonthlyReportOpen}
        onClose={() => setIsMonthlyReportOpen(false)}
        timeSavedData={activeData}
        topTopics={topics}
        activeCommenter={activeCommenter}
      />
    </>
  );
}
