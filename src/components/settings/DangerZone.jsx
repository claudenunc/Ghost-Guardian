import React, { useState } from 'react';
import {
  AlertTriangle,
  RotateCcw,
  Trash2,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { Button, Chip } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';

export default function DangerZone() {
  const { resetDemo, signOut, isDemo, showToast } = useGuardian();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleReset = () => {
    resetDemo();
    setShowResetConfirm(false);
  };

  const handleClearLocalStorage = () => {
    localStorage.clear();
    resetDemo();
    setShowClearConfirm(false);
    showToast('Local browser storage cleared and reset.', 'info');
  };

  return (
    <section className="ghost-panel p-6 sm:p-8 space-y-6 border-[#f87171]/25 bg-gradient-to-r from-[#1a1215]/80 via-[#141217]/90 to-[#121422]/90">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2 text-[#f87171]">
          <AlertTriangle size={18} />
          <h3 className="font-display text-lg text-white font-bold">Danger Zone</h3>
        </div>
        <Chip variant="critical">Irreversible Actions</Chip>
      </div>

      <div className="divide-y divide-white/5">
        {/* Reset Demo Fixtures */}
        <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-white">
              Reset Demo Workspace
            </h4>
            <p className="text-xs text-[#8f97b0] mt-0.5 leading-relaxed">
              Restore the fictional creator data, comments, voice profile, and boundary policies to their initial demo state.
            </p>
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setShowResetConfirm(true)}
          >
            <RotateCcw size={14} /> Reset Demo Workspace
          </Button>
        </div>

        {/* Clear Local Cache */}
        <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-white">
              Clear Local Browser Storage
            </h4>
            <p className="text-xs text-[#8f97b0] mt-0.5 leading-relaxed">
              Purges any cached preferences and saved state stored in your local browser storage.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowClearConfirm(true)}
          >
            <Trash2 size={14} /> Clear Local Cache
          </Button>
        </div>

        {/* Sign Out */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-white">
              Sign Out of Session
            </h4>
            <p className="text-xs text-[#8f97b0] mt-0.5 leading-relaxed">
              Disconnects your current session and returns to the authentication screen.
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={signOut}>
            <LogOut size={14} /> Sign Out
          </Button>
        </div>
      </div>

      {/* Confirmation Modal: Reset Demo */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-[#f87171]/40 bg-[#161215] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-[#f87171]">
              <ShieldAlert size={20} />
              <h4 className="font-display text-base font-bold text-white">
                Confirm Demo Reset
              </h4>
            </div>
            <p className="text-xs text-[#8f97b0] leading-relaxed">
              This will overwrite all active comment approvals, voice calibrations, and custom policies with fresh demo fixtures.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button size="sm" variant="ghost" onClick={() => setShowResetConfirm(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="destructive" onClick={handleReset}>
                Yes, Reset Workspace
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Clear Local Cache */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-[#fbbf24]/40 bg-[#161412] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-[#fbbf24]">
              <AlertTriangle size={20} />
              <h4 className="font-display text-base font-bold text-white">
                Confirm Clear Cache
              </h4>
            </div>
            <p className="text-xs text-[#8f97b0] leading-relaxed">
              This will clear all browser storage and re-initialize the workspace.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button size="sm" variant="ghost" onClick={() => setShowClearConfirm(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleClearLocalStorage}>
                Clear & Reload
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
